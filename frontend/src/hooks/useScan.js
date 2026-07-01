// import { useState, useRef, useCallback, useEffect } from 'react'
// import { normalizeBase, parseExtraFields, startScanRequest, fetchScanStatus } from '../utils/scanApi'

// const DEFAULTS = {
//   apiBase:        'http://127.0.0.1:8000/api',
//   targetUrl:      'http://127.0.0.1:4280/',
//   useAuth:        true,
//   loginUrl:       'http://127.0.0.1:4280/login.php',
//   loginMethod:    'post',
//   username:       'admin',
//   password:       'password',
//   usernameField:  'username',
//   passwordField:  'password',
//   securityUrl:    'http://127.0.0.1:4280/security.php',
//   securityLevel:  'low',
//   securityField:  'security',
//   extraFields:    '{"Login":"Login"}',
// }

// export default function useScan() {
//   const [form, setFormState]      = useState(DEFAULTS)
//   const [scanId, setScanId]       = useState(null)
//   const [status, setStatus]       = useState('idle')
//   const [target, setTarget]       = useState(null)
//   const [updatedAt, setUpdatedAt] = useState(null)
//   const [vulns, setVulns]         = useState([])
//   const [message, setMessage]     = useState(null)
//   const [scanning, setScanning]   = useState(false)

//   const pollRef   = useRef(null)
//   const scanIdRef = useRef(null)   // keep scan_id accessible inside async tick

//   useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

//   const setField = useCallback((key, value) => {
//     setFormState(prev => ({ ...prev, [key]: value }))
//   }, [])

//   const stopPolling = useCallback(() => {
//     if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
//     setScanning(false)
//   }, [])

//   // ── Build the JSON body the backend expects ─────────────────────────────────
//   // Matches backend schemas.py exactly:
//   //   ScanRequest  { url: HttpUrl, auth?: AuthRequest }
//   //   AuthRequest  { login_url, username, password, username_field,
//   //                  password_field, method, extra_fields,
//   //                  security_url?, security_level?, security_field }
//   function buildPayload(f) {
//     // Pydantic HttpUrl requires a valid URL string — keep trailing slash
//     const payload = { url: f.targetUrl.trim() }

//     if (!f.useAuth) return payload

//     const extraFields = parseExtraFields(f.extraFields)

//     const secUrl   = f.securityUrl.trim()   || null
//     const secLevel = f.securityLevel.trim() || null

//     payload.auth = {
//       login_url:      f.loginUrl.trim(),
//       username:       f.username,
//       password:       f.password,
//       username_field: f.usernameField.trim() || 'username',
//       password_field: f.passwordField.trim() || 'password',
//       method:         f.loginMethod,
//       extra_fields:   extraFields,
//       // send null not "" — Pydantic rejects empty string for Optional[HttpUrl]
//       security_url:   secUrl,
//       security_level: secLevel,
//       security_field: f.securityField.trim() || 'security',
//     }

//     return payload
//   }

//   async function startScan(e) {
//     e.preventDefault()
//     stopPolling()

//     let payload
//     try {
//       payload = buildPayload(form)
//     } catch (err) {
//       setStatus('failed')
//       setMessage(err.message)
//       return
//     }

//     const base = normalizeBase(form.apiBase)
//     setScanning(true)
//     setVulns([])
//     setMessage('Starting scan…')
//     setStatus('pending')
//     setTarget(form.targetUrl)
//     setScanId(null)

//     try {
//       // ── POST /api/scan ──────────────────────────────────────────────────────
//       // Backend returns: { scan_id: int, status: str, message: str }
//       const data = await startScanRequest(base, payload)

//       const id = data.scan_id          // integer from backend
//       scanIdRef.current = id
//       setScanId(id)
//       setStatus(data.status || 'pending')
//       setMessage('Scan started — polling for results…')

//       // ── Poll GET /api/scan/{id} every 3s ────────────────────────────────────
//       // Backend returns: ScanResultOut {
//       //   scan_id, target_url, status,
//       //   created_at, completed_at,
//       //   vulnerabilities: VulnerabilityOut[]
//       // }
//       async function tick() {
//         try {
//           const result = await fetchScanStatus(base, scanIdRef.current)

//           setStatus(result.status || 'running')
//           setTarget(result.target_url || form.targetUrl)
//           setUpdatedAt(new Date().toLocaleTimeString())
//           // Each VulnerabilityOut has:
//           // id, vuln_type, severity, affected_url, parameter,
//           // payload, evidence, description, fix
//           setVulns(result.vulnerabilities || [])
//           setMessage(null)

//           if (['completed', 'failed'].includes(
//             String(result.status).toLowerCase()
//           )) {
//             stopPolling()
//           }
//         } catch (err) {
//           stopPolling()
//           setStatus('failed')
//           setMessage(err.message)
//         }
//       }

//       await tick()
//       pollRef.current = setInterval(tick, 3000)

//     } catch (err) {
//       setScanning(false)
//       setStatus('failed')
//       setMessage(err.message)      // now shows real backend error e.g. "422 ..."
//     }
//   }

//   function handleStopPolling() {
//     stopPolling()
//     setStatus('idle')
//   }

//   return {
//     form, setField,
//     scanId, status, target, updatedAt,
//     vulns, message, scanning,
//     startScan,
//     stopPolling: handleStopPolling,
//   }
// }
import { useState, useRef, useCallback, useEffect } from 'react'
import { normalizeBase, parseExtraFields, startScanRequest, fetchScanStatus } from '../utils/scanApi'

const DEFAULTS = {
  apiBase:        'http://127.0.0.1:8000/api',
  targetUrl:      'http://127.0.0.1:4280/',
  useAuth:        true,
  loginUrl:       'http://127.0.0.1:4280/login.php',
  loginMethod:    'post',
  username:       'admin',
  password:       'password',
  usernameField:  'username',
  passwordField:  'password',
  securityUrl:    'http://127.0.0.1:4280/security.php',
  securityLevel:  'low',
  securityField:  'security',
  extraFields:    '{"Login":"Login"}',
}

export default function useScan() {
  const [form, setFormState]      = useState(DEFAULTS)
  const [scanId, setScanId]       = useState(null)
  const [status, setStatus]       = useState('idle')
  const [target, setTarget]       = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [vulns, setVulns]         = useState([])
  const [message, setMessage]     = useState(null)
  const [scanning, setScanning]   = useState(false)

  const pollRef   = useRef(null)
  const scanIdRef = useRef(null)   // keep scan_id accessible inside async tick

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const setField = useCallback((key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    setScanning(false)
  }, [])

  // ── Build the JSON body the backend expects ─────────────────────────────────
  // Matches backend schemas.py exactly:
  //   ScanRequest  { url: HttpUrl, auth?: AuthRequest }
  //   AuthRequest  { login_url, username, password, username_field,
  //                  password_field, method, extra_fields,
  //                  security_url?, security_level?, security_field }
  function buildPayload(f) {
    // Pydantic HttpUrl requires a valid URL string — keep trailing slash
    const payload = { url: f.targetUrl.trim() }

    if (!f.useAuth) return payload

    const extraFields = parseExtraFields(f.extraFields)

    const secUrl   = f.securityUrl.trim()   || null
    const secLevel = f.securityLevel.trim() || null

    payload.auth = {
      login_url:      f.loginUrl.trim(),
      username:       f.username,
      password:       f.password,
      username_field: f.usernameField.trim() || 'username',
      password_field: f.passwordField.trim() || 'password',
      method:         f.loginMethod,
      extra_fields:   extraFields,
      // send null not "" — Pydantic rejects empty string for Optional[HttpUrl]
      security_url:   secUrl,
      security_level: secLevel,
      security_field: f.securityField.trim() || 'security',
    }

    return payload
  }

  async function startScan(e) {
    e.preventDefault()
    stopPolling()

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setScanning(false)
      setStatus('failed')
      setMessage('No internet connection')
      setVulns([])
      setScanId(null)
      return
    }

    let payload
    try {
      payload = buildPayload(form)
    } catch (err) {
      setStatus('failed')
      setMessage(err.message)
      return
    }

    const base = normalizeBase(form.apiBase)
    setScanning(true)
    setVulns([])
    setMessage('Starting scan…')
    setStatus('pending')
    setTarget(form.targetUrl)
    setScanId(null)

    try {
      // ── POST /api/scan ──────────────────────────────────────────────────────
      // Backend returns: { scan_id: int, status: str, message: str }
      const data = await startScanRequest(base, payload)

      const id = data.scan_id          // integer from backend
      scanIdRef.current = id
      setScanId(id)
      setStatus(data.status || 'pending')
      setMessage('Scan started — polling for results…')

      // ── Poll GET /api/scan/{id} every 3s ────────────────────────────────────
      // Backend returns: ScanResultOut {
      //   scan_id, target_url, status,
      //   created_at, completed_at,
      //   vulnerabilities: VulnerabilityOut[]
      // }
      async function tick() {
        try {
          const result = await fetchScanStatus(base, scanIdRef.current)

          setStatus(result.status || 'running')
          setTarget(result.target_url || form.targetUrl)
          setUpdatedAt(new Date().toLocaleTimeString())
          // Each VulnerabilityOut has:
          // id, vuln_type, severity, affected_url, parameter,
          // payload, evidence, description, fix
          setVulns(result.vulnerabilities || [])
          setMessage(result.status === 'failed'
            ? (result.error_message || 'Scan failed.')
            : null)

          if (['completed', 'failed'].includes(
            String(result.status).toLowerCase()
          )) {
            stopPolling()
          }
        } catch (err) {
          stopPolling()
          setStatus('failed')
          setMessage(err.message)
        }
      }

      await tick()
      pollRef.current = setInterval(tick, 3000)

    } catch (err) {
      setScanning(false)
      setStatus('failed')
      setMessage(err.message)      // now shows real backend error e.g. "422 ..."
    }
  }

  function handleStopPolling() {
    stopPolling()
    setStatus('idle')
  }

  return {
    form, setField,
    scanId, status, target, updatedAt,
    vulns, message, scanning,
    startScan,
    stopPolling: handleStopPolling,
  }
}