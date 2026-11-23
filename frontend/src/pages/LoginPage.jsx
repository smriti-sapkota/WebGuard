import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchGoogleClientId } from '../utils/api'

export default function LoginPage({ onDone }) {
  const { login, register, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [clientId, setClientId] = useState(null)
  const googleBtn = useRef(null)

  useEffect(() => {
    let alive = true
    fetchGoogleClientId().then((id) => alive && setClientId(id))
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!clientId) return
    function init() {
      window.google?.accounts.id.initialize({
        client_id: clientId,
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
          theme: 'outline', size: 'large', width: 340, text: 'continue_with', shape: 'rectangular',
        })
      }
    }
    if (window.google?.accounts) { init(); return }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = init
    document.head.appendChild(s)
  }, [clientId, loginWithGoogle, onDone])

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

  const isLogin = mode === 'login'

  return (
    <div className="login-page">
      <aside className="login-side">
        <div className="login-side-inner">
          <div className="login-brand">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 6v6c0 5.25 3.9 10.15 9 11.35C17.1 17.15 21 12.25 21 12V6L12 2Z"
                fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 12l2.5 2.5L15 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            WebGuard
          </div>
          <h2>Find the holes before someone else does.</h2>
          <ul className="login-points">
            <li>Automated SQL injection, XSS and CSRF checks</li>
            <li>Authenticated scans behind your login page</li>
            <li>Clear findings with fixes, ranked by severity</li>
          </ul>
          <p className="login-note">Only scan sites you own or have permission to test.</p>
        </div>
      </aside>

      <section className="login-main">
        <div className="login-card">
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="login-sub">
            {isLogin ? 'Log in to run and review your scans.' : 'Sign up to start scanning in under a minute.'}
          </p>

          {clientId && (
            <>
              <div ref={googleBtn} className="google-slot" />
              <div className="login-divider"><span>or continue with email</span></div>
            </>
          )}

          <form onSubmit={submit} className="login-form">
            {!isLogin && (
              <div className="fgroup">
                <label className="flabel">Name</label>
                <input className="finput" value={name} autoComplete="name"
                  onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="fgroup">
              <label className="flabel">Email</label>
              <input type="email" className="finput" value={email} required autoComplete="email"
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="fgroup">
              <label className="flabel">Password</label>
              <input type="password" className="finput" value={password} required minLength={8}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                onChange={(e) => setPassword(e.target.value)} />
              {!isLogin && <span className="login-hint">At least 8 characters.</span>}
            </div>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button type="submit" className="login-submit" disabled={busy}>
              {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="login-switch">
            {isLogin ? "Don't have an account? " : 'Already registered? '}
            <button type="button" className="link-btn"
              onClick={() => { setError(null); setMode(isLogin ? 'register' : 'login') }}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
