import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import express from 'express'
import compression from 'compression'
import multer from 'multer'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(ROOT, '.env') })

const PORT = Number(process.env.PORT || 8787)
const HOST = process.env.HOST || '0.0.0.0'
const CLIENT_DIST = path.join(ROOT, 'dist')
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, 'backend', 'data')
const DATA_FILE = path.join(DATA_DIR, 'content.json')
const BACKUP_DIR = path.join(DATA_DIR, 'backups')
const SEED_FILE = path.join(ROOT, 'server', 'seed-content.json')
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(ROOT, 'uploads')
const SECRET_FILE = path.join(DATA_DIR, '.session-secret')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yaodi2026'
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12
const MAX_BACKUPS = 30

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(BACKUP_DIR, { recursive: true })
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// A fresh Railway/Render volume is empty. Seed it from the copy baked into
// the image so the admin and public API work on first boot.
if (
  (!fs.existsSync(DATA_FILE) || fs.statSync(DATA_FILE).size === 0) &&
  fs.existsSync(SEED_FILE)
) {
  fs.copyFileSync(SEED_FILE, DATA_FILE)
  console.log('  Initial content    →  seeded from server/seed-content.json')
} else if (!fs.existsSync(DATA_FILE)) {
  throw new Error('Missing content.json and seed-content.json')
}

if (!fs.existsSync(SECRET_FILE)) {
  fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString('hex'), { mode: 0o600 })
}
const SESSION_SECRET = process.env.SESSION_SECRET || fs.readFileSync(SECRET_FILE, 'utf8').trim()

function readContent() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
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

let writeQueue = Promise.resolve()

function persistContent(content) {
  const run = async () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(BACKUP_DIR, `content-${stamp}.json`)
    if (fs.existsSync(DATA_FILE)) {
      await fsp.copyFile(DATA_FILE, backupFile)
      const backups = (await fsp.readdir(BACKUP_DIR))
        .filter((name) => name.startsWith('content-') && name.endsWith('.json'))
        .sort()
      for (const old of backups.slice(0, Math.max(0, backups.length - MAX_BACKUPS))) {
        await fsp.rm(path.join(BACKUP_DIR, old), { force: true })
      }
    }
    const tmp = `${DATA_FILE}.tmp`
    await fsp.writeFile(tmp, JSON.stringify(content, null, 2), 'utf8')
    await fsp.rename(tmp, DATA_FILE)
  }
  writeQueue = writeQueue.then(run, run)
  return writeQueue
}

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest()
}

function safeEqual(a, b) {
  const left = hash(a)
  const right = hash(b)
  return crypto.timingSafeEqual(left, right)
}

function createToken() {
  const payload = base64url(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS, scope: 'admin' }))
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return false
  const [payload, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  if (!safeEqual(signature, expected)) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return data.scope === 'admin' && Number(data.exp) > Date.now()
  } catch {
    return false
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!verifyToken(token)) {
    res.status(401).json({ error: '登录已失效，请重新登录' })
    return
  }
  next()
}

const loginAttempts = new Map()
function loginRateLimit(req, res, next) {
  const ip = req.ip || 'unknown'
  const now = Date.now()
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + 60_000 }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + 60_000
  }
  if (entry.count >= 8) {
    res.status(429).json({ error: '尝试次数过多，请一分钟后再试' })
    return
  }
  entry.count += 1
  loginAttempts.set(ip, entry)
  next()
}

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(compression())
app.use(express.json({ limit: '4mb' }))
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  next()
})

app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '7d',
    fallthrough: true,
    setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=604800'),
  }),
)

app.get('/api/health', (req, res) => {
  let updatedAt = null
  try {
    updatedAt = readContent().updatedAt || null
  } catch {
    // The health endpoint should still respond if content is temporarily unavailable.
  }
  res.json({ ok: true, updatedAt })
})

app.get('/api/content', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store')
    res.json(readContent())
  } catch (error) {
    console.error('Failed to read content:', error)
    res.status(500).json({ error: '内容暂时不可用' })
  }
})

app.post('/api/auth/login', loginRateLimit, (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!safeEqual(password, ADMIN_PASSWORD)) {
    res.status(401).json({ error: '密码不正确' })
    return
  }
  loginAttempts.delete(req.ip || 'unknown')
  res.json({ token: createToken(), expiresIn: TOKEN_TTL_MS })
})

app.get('/api/admin/content', requireAuth, (req, res) => {
  try {
    res.json(readContent())
  } catch {
    res.status(500).json({ error: '读取内容失败' })
  }
})

app.put('/api/admin/content', requireAuth, async (req, res) => {
  const content = req.body
  const error = validateContent(content)
  if (error) {
    res.status(400).json({ error })
    return
  }
  try {
    const next = { ...content, updatedAt: new Date().toISOString() }
    await persistContent(next)
    res.json({ ok: true, updatedAt: next.updatedAt })
  } catch (err) {
    console.error('Failed to save content:', err)
    res.status(500).json({ error: '保存失败，请稍后重试' })
  }
})

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().slice(0, 10) || '.jpg'
      const base = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '-')
        .slice(0, 40)
      cb(null, `${Date.now()}-${crypto.randomBytes(3).toString('hex')}-${base}${ext}`)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      cb(new Error('仅支持 JPG / PNG / WebP / GIF / AVIF 图片'))
      return
    }
    cb(null, true)
  },
})

app.post('/api/admin/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || '上传失败' })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: '没有收到文件' })
      return
    }
    res.json({ url: `/uploads/${req.file.filename}`, size: req.file.size })
  })
})

app.use('/api', (req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

if (fs.existsSync(CLIENT_DIST)) {
  app.use(
    express.static(CLIENT_DIST, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, file) => {
        if (file.endsWith('index.html')) res.setHeader('Cache-Control', 'no-store')
      },
    }),
  )
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'))
  })
} else {
  app.get('*', (req, res) => {
    res
      .status(200)
      .type('text/plain')
      .send('前端尚未构建。开发环境请访问 http://127.0.0.1:5173，或先运行 pnpm build。')
  })
}

app.use((err, req, res, next) => {
  console.error(err)
  if (res.headersSent) {
    next(err)
    return
  }
  res.status(500).json({ error: '服务器开小差了' })
})

app.listen(PORT, HOST, () => {
  console.log(`\n  YD Portfolio API  →  http://127.0.0.1:${PORT}`)
  console.log(`  Admin            →  http://127.0.0.1:${PORT}/admin`)
  if (!process.env.ADMIN_PASSWORD) {
    console.log('  默认后台密码      →  yaodi2026（请在 .env 中修改）')
  }
  console.log(`  内容文件          →  ${DATA_FILE}`)
  console.log(`  上传目录          →  ${UPLOAD_DIR}\n`)
})
