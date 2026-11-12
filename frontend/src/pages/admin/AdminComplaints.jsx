import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge'
import api, { getErrorMessage } from '../../services/api'

const categories = ['Electricity', 'Plumbing', 'Water Supply', 'Wi-Fi / Internet', 'Cleaning and Hygiene', 'Furniture', 'Washroom', 'Security', 'Food Quality', 'Other']
const statuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED']
const priorities = ['Low', 'Medium', 'High', 'Urgent']
const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [filters, setFilters] = useState({ search: '', category: '', status: '', priority: '' })
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadComplaints = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/complaints', { params: { ...filters, page, limit: 15 } })
        if (active) {
          setComplaints(response.data.complaints)
          setPages(response.data.pages)
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadComplaints()
    return () => { active = false }
  }, [filters, page])

  const updateFilter = (event) => {
    setPage(1)
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-teal-700">Service desk</p>
        <h1 className="mt-1 text-3xl font-bold text-navy-800">All complaints</h1>
        <p className="mt-2 text-sm text-slate-500">Search, filter and assign maintenance requests.</p>
      </div>

      <section className="card p-4 sm:p-5" aria-label="Complaint filters">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative xl:col-span-1">
            <span className="sr-only">Search complaints</span>
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" name="search" value={filters.search} onChange={updateFilter} placeholder="Search reference, title, description" />
          </label>
          <select className="input" name="category" value={filters.category} onChange={updateFilter} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <select className="input" name="status" value={filters.status} onChange={updateFilter} aria-label="Filter by status">
            <option value="">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
          <select className="input" name="priority" value={filters.priority} onChange={updateFilter} aria-label="Filter by priority">
            <option value="">All priorities</option>
            {priorities.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
        </div>
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <section className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6" aria-label="Loading complaints">
            <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-navy-800">No complaints match these filters</h2>
            <p className="mt-2 text-sm text-slate-500">Try changing the search or filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Reference</th><th className="px-5 py-3">Complaint</th><th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Assigned to</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-navy-700">{complaint.complaintId}</td>
                      <td className="min-w-52 px-5 py-4">
                        <Link to={`/admin/complaints/${complaint._id}`} className="font-semibold text-slate-800 hover:text-teal-700">{complaint.title}</Link>
                        <p className="mt-1 text-xs text-slate-500">{complaint.category}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{complaint.studentId?.name || 'Unknown'}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{complaint.assignedTo?.name || 'Unassigned'}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{complaint.priority}</td>
                      <td className="whitespace-nowrap px-5 py-4"><ComplaintStatusBadge status={complaint.status} /></td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(complaint.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm">
              <span className="text-slate-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary px-3 py-2" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>Previous</button>
                <button type="button" className="btn-secondary px-3 py-2" onClick={() => setPage((current) => Math.min(pages, current + 1))} disabled={page >= pages || loading}>Next</button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
