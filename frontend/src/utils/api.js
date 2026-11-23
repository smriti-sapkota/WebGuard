export const API_BASE = (
  import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

const TOKEN_KEY = 'webguard_token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* storage unavailable */ }
}

export function authHeaders(extra = {}) {
  const token = getToken()
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra
}

async function errorDetail(res) {
  let detail = `HTTP ${res.status}`
  try {
    const err = await res.json()
    if (err.detail) {
      detail = Array.isArray(err.detail)
        ? err.detail.map(e => e.msg).join(' | ')
        : String(err.detail)
    }
  } catch { /* not json */ }
  return detail
}

export async function authRequest(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await errorDetail(res))
  return res.json()
}

export async function fetchGoogleClientId() {
  const fallback = import.meta.env.VITE_GOOGLE_CLIENT_ID || null
  try {
    const res = await fetch(`${API_BASE}/auth/config`)
    if (!res.ok) return fallback
    const data = await res.json()
    return data.google_client_id || fallback
  } catch {
    return fallback
  }
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() })
  if (!res.ok) throw new Error('not logged in')
  return res.json()
}
