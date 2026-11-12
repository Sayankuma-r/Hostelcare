import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    hostel: '',
    block: '',
    roomNumber: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await register(form)
      navigate('/student/dashboard')
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="card w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold text-navy-800">Create student account</h1>
        <p className="mt-2 text-sm text-slate-500">Student registration only</p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="label">Full name</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">College email</label>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" name="password" type="password" minLength={8} maxLength={72} value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Hostel</label>
            <input className="input" name="hostel" value={form.hostel} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Block</label>
            <input className="input" name="block" value={form.block} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Room number</label>
            <input className="input" name="roomNumber" value={form.roomNumber} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}

          <div className="md:col-span-2">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-teal-600" to="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}
