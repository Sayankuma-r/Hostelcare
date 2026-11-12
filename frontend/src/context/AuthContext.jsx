import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('hostelcare_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentToken = localStorage.getItem('hostelcare_token')
    if (!currentToken) {
      setLoading(false)
      return
    }

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('hostelcare_token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const setAuth = (authToken, nextUser) => {
    if (authToken) localStorage.setItem('hostelcare_token', authToken)
    else localStorage.removeItem('hostelcare_token')
    setToken(authToken)
    setUser(nextUser)
  }

  const login = async (payload) => {
    const response = await api.post('/auth/login', payload)
    setAuth(response.data.token, response.data.user)
    return response.data
  }

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload)
    setAuth(response.data.token, response.data.user)
    return response.data
  }

  const logout = () => {
    setAuth(null, null)
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, setUser }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
