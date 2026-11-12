import { ArrowRight, CheckCircle2, ClipboardList, Clock3, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge'
import api, { getErrorMessage } from '../../services/api'

const initialStats = { totalAssignedTasks: 0, pendingTasks: 0, inProgressTasks: 0, completedTasks: 0 }

export default function StaffDashboard() {
  const [stats, setStats] = useState(initialStats)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/staff/dashboard')
      .then((response) => {
        if (active) {
          setStats(response.data.stats)
          setComplaints(response.data.complaints || [])
        }
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const metrics = [
    { label: 'Assigned tasks', value: stats.totalAssignedTasks, icon: ClipboardList, note: 'Tasks assigned to you' },
    { label: 'Awaiting action', value: stats.pendingTasks, icon: Clock3, note: 'Ready to start' },
    { label: 'In progress', value: stats.inProgressTasks, icon: Wrench, note: 'Currently being handled' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, note: 'Resolved or closed' },
  ]

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-navy-800 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-sm font-medium text-teal-200">MAINTENANCE WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-bold">Your assigned work</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Review hostel issues, record progress, and add resolution notes when work is complete.</p>
        </div>
        <Link to="/staff/complaints" className="btn-accent shrink-0">Open task list <ArrowRight size={16} /></Link>
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Task statistics">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="card p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <span className="rounded-xl bg-teal-50 p-2 text-teal-700"><Icon size={18} /></span>
              </div>
              <p className="mt-4 text-3xl font-bold text-navy-800">{loading ? '—' : metric.value}</p>
              <p className="mt-1 text-xs text-slate-400">{metric.note}</p>
            </div>
          )
        })}
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-navy-800">Recent assignments</h2>
            <p className="mt-1 text-xs text-slate-500">Most recently updated work</p>
          </div>
          <Link to="/staff/complaints" className="text-sm font-semibold text-teal-700 hover:text-teal-800">View all</Link>
        </div>
        {loading ? <p className="p-6 text-sm text-slate-500">Loading tasks…</p> : complaints.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">No work has been assigned to you yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((complaint) => (
              <Link key={complaint._id} to={`/staff/complaints/${complaint._id}`} className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-800">{complaint.title}</p>
                    <ComplaintStatusBadge status={complaint.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{complaint.complaintId} · {complaint.category} · Room {complaint.roomNumber}</p>
                </div>
                <p className="text-sm text-slate-500">{complaint.studentId?.name || 'Student'}</p>
                <ArrowRight className="hidden text-slate-400 sm:block" size={16} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
