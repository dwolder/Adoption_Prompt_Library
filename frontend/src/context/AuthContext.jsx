import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

const TOKEN_KEY = 'prompt_library_token'
const USER_KEY = 'prompt_library_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem(USER_KEY)
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email) => {
    const { access_token, user: u } = await api.login(email)
    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(access_token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
