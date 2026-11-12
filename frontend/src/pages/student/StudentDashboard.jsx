import { ArrowRight, Plus, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge'
import { useAuth } from '../../context/AuthContext'
import api, { getErrorMessage } from '../../services/api'

const initialStats = { total: 0, pending: 0, inProgress: 0, resolved: 0 }
const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(initialStats)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/complaints/dashboard')
        if (active) {
          setStats(response.data.stats)
          setComplaints(response.data.recentComplaints || [])
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError))
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDashboard()
    return () => { active = false }
  }, [])

  const cards = [
    { label: 'Total complaints', value: stats.total, note: 'All reports you have filed' },
    { label: 'Pending', value: stats.pending, note: 'Awaiting assignment or follow-up' },
    { label: 'In progress', value: stats.inProgress, note: 'Currently being worked on' },
    { label: 'Resolved', value: stats.resolved, note: 'Completed reports' },
  ]

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-navy-800 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-sm font-medium text-teal-200">STUDENT DASHBOARD</p>
          <h1 className="mt-2 text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Student'}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Stay on top of hostel issues and follow every report as it gets resolved.</p>
        </div>
        <Link to="/student/complaints/new" className="btn-accent shrink-0">
          <Plus size={18} /> Submit a complaint
        </Link>
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Complaint statistics">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold text-navy-800">{loading ? <span className="inline-block h-9 w-10 animate-pulse rounded bg-slate-100" /> : card.value}</span>
              <ReceiptText className="mb-1 text-teal-700" size={20} />
            </div>
            <p className="mt-2 text-xs text-slate-400">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-navy-800">Recent complaints</h2>
            <p className="mt-1 text-sm text-slate-500">The latest updates on your reports</p>
          </div>
          <Link to="/student/complaints" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 p-6" aria-label="Loading dashboard">
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="font-semibold text-navy-800">Nothing to track yet</h3>
            <p className="mt-2 text-sm text-slate-500">Report a hostel issue and we’ll keep you updated here.</p>
            <Link to="/student/complaints/new" className="btn-primary mt-5">Create your first complaint</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((complaint) => (
              <Link
                key={complaint._id}
                to={`/student/complaints/${complaint._id}`}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-800">{complaint.title}</p>
                    <ComplaintStatusBadge status={complaint.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{complaint.complaintId} <span className="mx-1">·</span> {complaint.category}</p>
                </div>
                <p className="shrink-0 text-xs text-slate-500">{formatDate(complaint.createdAt)}</p>
                <ArrowRight className="hidden text-slate-400 sm:block" size={16} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
