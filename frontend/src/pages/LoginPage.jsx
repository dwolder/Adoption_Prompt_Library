import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from '../components/Login'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(email) {
    setError('')
    setLoading(true)
    try {
      await login(email)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">AI Prompt Library</h2>
        <p className="text-slate-600 text-sm mb-6">
          Sign in with your email (mock SSO for internal use).
        </p>
        <Login onLogin={handleLogin} error={error} loading={loading} />
      </div>
    </div>
  )
}
