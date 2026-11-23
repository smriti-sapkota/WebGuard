import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function LoginPage({ onDone }) {
  const { login, register, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const googleBtn = useRef(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    function init() {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            await loginWithGoogle(credential)
            onDone()
          } catch (err) {
            setError(err.message)
          }
        },
      })
      if (googleBtn.current) {
        window.google?.accounts.id.renderButton(googleBtn.current, {
          theme: 'outline', size: 'large', width: 320, text: 'continue_with',
        })
      }
    }
    if (window.google?.accounts) { init(); return }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = init
    document.head.appendChild(s)
  }, [loginWithGoogle, onDone])

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, name || null)
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="scanner-wrap" style={{ maxWidth: 420 }}>
      <div className="page-head">
        <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
        <p>You need an account to run scans.</p>
      </div>
      <div className="hr" />
      <div className="card">
        {GOOGLE_CLIENT_ID && (
          <>
            <div ref={googleBtn} style={{ display: 'flex', justifyContent: 'center' }} />
            <div style={{ textAlign: 'center', margin: '14px 0', opacity: 0.6 }}>or</div>
          </>
        )}
        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="fgroup">
              <label className="flabel">Name</label>
              <input className="finput" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="fgroup">
            <label className="flabel">Email</label>
            <input type="email" className="finput" value={email} required
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">Password</label>
            <input type="password" className="finput" value={password} required minLength={8}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p style={{ color: '#e5484d', fontSize: 14 }}>{error}</p>}
          <div className="btn-row">
            <button type="submit" className="btn-scan" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </form>
        <p style={{ marginTop: 14, fontSize: 14 }}>
          {mode === 'login' ? 'No account? ' : 'Already registered? '}
          <button type="button" className="nav-btn"
            onClick={() => { setError(null); setMode(mode === 'login' ? 'register' : 'login') }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
