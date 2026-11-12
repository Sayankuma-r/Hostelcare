import { useCallback, useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import api, { getErrorMessage } from '../../services/api'

const initialForm = { name: '', email: '', password: '', phone: '' }

export default function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadStaff = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/users', { params: { role: 'staff', limit: 100 } })
      setStaff(response.data.users)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const createStaff = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await api.post('/admin/staff', form)
      setForm(initialForm)
      setNotice('Maintenance staff account created.')
      await loadStaff()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-teal-700">People</p>
        <h1 className="mt-1 text-3xl font-bold text-navy-800">Maintenance staff</h1>
        <p className="mt-2 text-sm text-slate-500">Create team accounts and review current maintenance staff.</p>
      </div>

      {notice && <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800" role="status">{notice}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <form className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4" onSubmit={createStaff}>
        <div className="sm:col-span-2 lg:col-span-4">
          <h2 className="flex items-center gap-2 font-semibold text-navy-800"><UserPlus size={18} className="text-teal-700" /> Add staff member</h2>
        </div>
        <div>
          <label className="label" htmlFor="staffName">Full name</label>
          <input id="staffName" className="input" name="name" value={form.name} onChange={updateForm} minLength={2} maxLength={100} required />
        </div>
        <div>
          <label className="label" htmlFor="staffEmail">Email</label>
          <input id="staffEmail" className="input" name="email" type="email" value={form.email} onChange={updateForm} required />
        </div>
        <div>
          <label className="label" htmlFor="staffPassword">Temporary password</label>
          <input id="staffPassword" className="input" name="password" type="password" value={form.password} onChange={updateForm} minLength={8} maxLength={72} required />
        </div>
        <div>
          <label className="label" htmlFor="staffPhone">Phone (optional)</label>
          <input id="staffPhone" className="input" name="phone" value={form.phone} onChange={updateForm} maxLength={30} />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create staff account'}</button>
        </div>
      </form>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-navy-800">Staff accounts</h2></div>
        {loading ? <p className="p-6 text-sm text-slate-500">Loading staff…</p> : staff.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">No staff accounts yet. Create one above to assign work.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Staff member</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Joined</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((member) => (
                  <tr key={member._id}>
                    <td className="px-5 py-4"><p className="font-semibold text-slate-800">{member.name}</p><p className="mt-1 text-xs text-slate-500">{member.email}</p></td>
                    <td className="px-5 py-4 text-slate-600">{member.phone || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(member.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
