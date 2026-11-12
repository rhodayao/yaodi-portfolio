import seedContent from '../../shared/content.json'

/**
 * Cloudflare Workers backend for the portfolio.
 *
 * Bindings:
 *   PORTFOLIO_KV  KV namespace for content, backups and uploaded images.
 *   ASSETS        Static assets built into frontend/dist/.
 *
 * Secrets:
 *   ADMIN_PASSWORD
 *   SESSION_SECRET
 */

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_CONTENT_BYTES = 5 * 1024 * 1024
const BACKUP_KEEP = 10
const encoder = new TextEncoder()

const ALLOWED_IMAGES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
])

const loginAttempts = new Map()

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    try {
      if (url.pathname.startsWith('/api/')) {
        return await handleApi(request, env, url)
      }
      if (url.pathname.startsWith('/uploads/')) {
        return await handleUploadedImage(request, env, url)
      }
      return await env.ASSETS.fetch(request)
    } catch (error) {
      console.error('Unhandled worker error', error)
      return json({ error: '服务暂时不可用' }, 500)
    }
  },
}

async function handleApi(request, env, url) {
  const path = url.pathname

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      },
    })
  }

  if (path === '/api/health' && request.method === 'GET') {
    const content = await getContent(env)
    return json({ ok: true, updatedAt: content?.updatedAt || null })
  }

  if (path === '/api/content' && request.method === 'GET') {
    return json(await getContent(env))
  }

  if (path === '/api/auth/login' && request.method === 'POST') {
    return await login(request, env)
  }

  if (path === '/api/admin/content' && request.method === 'GET') {
    if (!(await requireAuth(request, env))) return unauthorized()
    return json(await getContent(env))
  }

  if (path === '/api/admin/content' && request.method === 'PUT') {
    if (!(await requireAuth(request, env))) return unauthorized()
    return await saveContent(request, env)
  }

  if (path === '/api/admin/upload' && request.method === 'POST') {
    if (!(await requireAuth(request, env))) return unauthorized()
    return await uploadImage(request, env)
  }

  return json({ error: '接口不存在' }, 404)
}

/* --------------------------------------------------------
   Content
   -------------------------------------------------------- */

function kv(env) {
  if (!env.PORTFOLIO_KV) {
    throw new Error('PORTFOLIO_KV binding is missing')
  }
  return env.PORTFOLIO_KV
}

async function getContent(env) {
  const stored = await kv(env).get('content', 'json')
  if (stored && typeof stored === 'object') return stored
  return seedContent
}

async function saveContent(request, env) {
  let content
  try {
    const raw = await request.text()
    if (raw.length > MAX_CONTENT_BYTES) return json({ error: '内容体积过大' }, 413)
    content = JSON.parse(raw)
  } catch {
    return json({ error: '内容格式不正确' }, 400)
  }

  const error = validateContent(content)
  if (error) return json({ error }, 400)

  const next = { ...content, updatedAt: new Date().toISOString() }
  const body = JSON.stringify(next)
  const storage = kv(env)

  await storage.put('content', body)

  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    await storage.put(`backup:${stamp}`, body)
    const list = await storage.list({ prefix: 'backup:', limit: 1000 })
    const keys = list.keys.map((key) => key.name).sort()
    for (const key of keys.slice(0, Math.max(0, keys.length - BACKUP_KEEP))) {
      await storage.delete(key)
    }
  } catch (error) {
    console.warn('Backup failed', error)
  }

  return json({ ok: true, updatedAt: next.updatedAt })
}

function validateContent(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return '内容格式不正确'
  }
  if (!content.site || typeof content.site !== 'object') return '缺少站点信息'
  if (!Array.isArray(content.projects)) return 'projects 必须是数组'
  if (!Array.isArray(content.experiences)) return 'experiences 必须是数组'
  if (content.projects.length > 60) return '项目数量超出限制'
  for (const project of content.projects) {
    if (!project.slug || !project.title) return '每个项目都必须有 slug 和 title'
    if (!Array.isArray(project.sections)) return '项目 sections 必须是数组'
  }
  return null
}

/* --------------------------------------------------------
   Auth
   -------------------------------------------------------- */

async function login(request, env) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: '后台密码或签名密钥未配置' }, 500)
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'local'
  const now = Date.now()
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + 60_000 }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + 60_000
  }
  if (entry.count >= 8) {
    return json({ error: '尝试次数过多，请一分钟后再试' }, 429)
  }
  entry.count += 1
  loginAttempts.set(ip, entry)

  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    return json({ error: '请求格式不正确' }, 400)
  }

  const matches = await safeEqual(
    await sha256(password),
    await sha256(env.ADMIN_PASSWORD),
  )
  if (!matches) {
    return json({ error: '密码不正确' }, 401)
  }

  loginAttempts.delete(ip)
  return json({
    token: await createToken(env.SESSION_SECRET),
    expiresIn: TOKEN_TTL_MS,
  })
}

async function requireAuth(request, env) {
  if (!env.SESSION_SECRET) return false
  const header = request.headers.get('Authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return verifyToken(env.SESSION_SECRET, token)
}

function unauthorized() {
  return json({ error: '登录已失效，请重新登录' }, 401)
}

async function createToken(secret) {
  const payload = base64urlEncode(
    encoder.encode(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS, scope: 'admin' })),
  )
  const signature = await hmac(secret, payload)
  return `${payload}.${signature}`
}

async function verifyToken(secret, token) {
  if (!token || !token.includes('.')) return false
  const [payload, signature] = token.split('.')
  const expected = await hmac(secret, payload)
  if (!constantTimeEqual(signature, expected)) return false
  try {
    const data = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)))
    return data.scope === 'admin' && Number(data.exp) > Date.now()
  } catch {
    return false
  }
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return base64urlEncode(new Uint8Array(signature))
}

async function sha256(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(String(value))))
}

async function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index]
  return diff === 0
}

function constantTimeEqual(a, b) {
  const left = encoder.encode(a)
  const right = encoder.encode(b)
  if (left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index]
  return diff === 0
}

function base64urlEncode(bytes) {
  let text = ''
  for (const byte of bytes) text += String.fromCharCode(byte)
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64urlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

/* --------------------------------------------------------
   Image uploads
   -------------------------------------------------------- */

async function uploadImage(request, env) {
  let form
  try {
    form = await request.formData()
  } catch {
    return json({ error: '上传格式不正确' }, 400)
  }

  const file = form.get('file')
  if (!file || typeof file.arrayBuffer !== 'function') {
    return json({ error: '没有收到文件' }, 400)
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return json({ error: '图片不能超过 10MB' }, 413)
  }
  const ext = ALLOWED_IMAGES.get(file.type)
  if (!ext) {
    return json({ error: '仅支持 JPG / PNG / WebP / GIF / AVIF 图片' }, 400)
  }

  const id = `${Date.now()}-${randomHex()}.${ext}`
  await kv(env).put(`upload:${id}`, await file.arrayBuffer(), {
    metadata: {
      contentType: file.type,
      name: String(file.name || '').slice(0, 120),
    },
  })

  return json({ url: `/uploads/${id}`, size: file.size })
}

async function handleUploadedImage(request, env, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const id = decodeURIComponent(url.pathname.slice('/uploads/'.length))
  if (!/^[a-zA-Z0-9-]+\.[a-z0-9]+$/.test(id)) {
    return new Response('Not Found', { status: 404 })
  }

  const result = await kv(env).getWithMetadata(`upload:${id}`, { type: 'arrayBuffer' })
  if (!result.value) {
    return new Response('Not Found', { status: 404 })
  }

  const headers = new Headers({
    'Content-Type': result.metadata?.contentType || 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  })
  return new Response(request.method === 'HEAD' ? null : result.value, { headers })
}

/* --------------------------------------------------------
   Helpers
   -------------------------------------------------------- */

function randomHex() {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  })
}
