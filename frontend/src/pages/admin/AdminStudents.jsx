import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../services/api'

const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const pageSize = 25

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadStudents = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/admin/users', { params: { role, search, page, limit: pageSize } })
        if (active) {
          setStudents(response.data.users)
          setTotal(response.data.total)
          setPages(response.data.pages)
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStudents()
    return () => { active = false }
  }, [search, role, page])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-teal-700">People</p>
          <h1 className="mt-1 text-3xl font-bold text-navy-800">Registered users</h1>
          <p className="mt-2 text-sm text-slate-500">Browse and search registered student, staff, and administrator profiles.</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"><Users className="mr-2 inline text-teal-700" size={17} />{total} registered</div>
      </div>

      <section className="card grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="relative block">
          <span className="sr-only">Search registered users</span>
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} placeholder="Search by name or email" />
        </label>
        <label>
          <span className="sr-only">Filter by user role</span>
          <select className="input" value={role} onChange={(event) => { setPage(1); setRole(event.target.value) }}>
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="staff">Maintenance staff</option>
            <option value="admin">Administrators</option>
          </select>
        </label>
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <section className="card overflow-hidden">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading registered users…</p> : students.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">No users match this search.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Hostel location</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Joined</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="px-5 py-4"><p className="font-semibold text-slate-800">{student.name}</p><p className="mt-1 text-xs text-slate-500">{student.email}</p></td>
                      <td className="whitespace-nowrap px-5 py-4 capitalize text-slate-600">{student.role}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{[student.hostel, student.block && `Block ${student.block}`, student.roomNumber && `Room ${student.roomNumber}`].filter(Boolean).join(' · ') || 'Not provided'}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{student.phone || '—'}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(student.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm">
              <span className="text-slate-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary px-3 py-2" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <button type="button" className="btn-secondary px-3 py-2" onClick={() => setPage((current) => Math.min(pages, current + 1))} disabled={page >= pages || loading}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
