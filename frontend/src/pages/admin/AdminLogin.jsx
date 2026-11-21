import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../services/api'

export default function AdminLogin() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(form)
      if (response.user.role !== 'admin') {
        logout()
        setError('This account does not have administrator access.')
        return
      }
      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="card w-full max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">HostelCare administration</p>
        <h1 className="mt-2 text-3xl font-bold text-navy-800">Administrator sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in with an administrator account to manage the hostel service.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="admin-email">Email</label>
            <input id="admin-email" className="input" type="email" autoComplete="username" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          </div>
          <div>
            <label className="label" htmlFor="admin-password">Password</label>
            <input id="admin-password" className="input" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
          </div>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in to admin panel'}
          </button>
        </form>
      </section>
    </main>
  )
}
