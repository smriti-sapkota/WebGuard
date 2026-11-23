import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authRequest, fetchMe, getToken, setToken } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) return
    fetchMe()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const finish = useCallback((data) => {
    setToken(data.token)
    setUser(data.user)
  }, [])

  const value = {
    user,
    loading,
    login: async (email, password) => finish(await authRequest('/auth/login', { email, password })),
    register: async (email, password, name) =>
      finish(await authRequest('/auth/register', { email, password, name })),
    loginWithGoogle: async (credential) =>
      finish(await authRequest('/auth/google', { credential })),
    logout: () => { setToken(null); setUser(null) },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
