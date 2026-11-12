import type { SiteContent } from '../types'

const TOKEN_KEY = 'yd_admin_token'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  let payload: unknown = null
  const text = await response.text()
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = null
  }
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `请求失败 (${response.status})`
    throw new ApiError(message, response.status)
  }
  return payload as T
}

export async function fetchPublicContent(): Promise<SiteContent> {
  return request<SiteContent>('/api/content', { cache: 'no-store' })
}

export async function login(password: string) {
  return request<{ token: string; expiresIn: number }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  }
}

export async function fetchAdminContent(): Promise<SiteContent> {
  return request<SiteContent>('/api/admin/content', {
    headers: authHeaders(),
    cache: 'no-store',
  })
}

export async function saveContent(content: SiteContent) {
  return request<{ ok: boolean; updatedAt: string }>('/api/admin/content', {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })
}

export async function uploadImage(file: File) {
  const form = new FormData()
  form.append('file', file)
  return request<{ url: string; size: number }>('/api/admin/upload', {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  })
}
