export function normalizeBase(base) {
  return base.trim().replace(/\/+$/, '')
}

export function parseExtraFields(raw) {
  if (!raw.trim()) return {}
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Extra fields must be a JSON object.')
    }
    return parsed
  } catch (err) {
    throw new Error(`Invalid Extra Fields JSON: ${err.message}`)
  }
}

export async function startScanRequest(apiBase, payload) {
  const res = await fetch(`${apiBase}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    // read the error body so we can show the real reason
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      // FastAPI validation errors come as { detail: [...] }
      if (err.detail) {
        if (Array.isArray(err.detail)) {
          detail = err.detail.map(e => `${e.loc?.join('.')} — ${e.msg}`).join(' | ')
        } else {
          detail = String(err.detail)
        }
      }
    } catch (_) {}
    throw new Error(`Scan start failed — ${detail}`)
  }

  return res.json()
}

export async function fetchScanStatus(apiBase, scanId) {
  const res = await fetch(`${apiBase}/scan/${scanId}`)
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      if (err.detail) detail = String(err.detail)
    } catch (_) {}
    throw new Error(`Poll failed — ${detail}`)
  }
  return res.json()
}