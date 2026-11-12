import { AlertCircle, ArrowRight, CheckCircle2, ClipboardList, Users } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge'
import api, { getErrorMessage } from '../../services/api'

const AdminAnalytics = lazy(() => import('./AdminAnalytics'))
const initialData = {
  stats: {
    totalStudents: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    assignedComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
  },
  categoryData: [],
  statusData: [],
  monthlyData: [],
  staffPerformance: [],
  recentComplaints: [],
}

function MetricCard({ label, value, note, icon: Icon, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="rounded-xl bg-teal-50 p-2 text-teal-700"><Icon size={18} /></span>
      </div>
      <p className="mt-4 text-3xl font-bold text-navy-800">{loading ? '—' : value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/admin/dashboard')
      .then((response) => {
        if (active) setData({ ...initialData, ...response.data })
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
    { label: 'Registered students', value: data.stats.totalStudents, note: 'Student accounts', icon: Users },
    { label: 'All complaints', value: data.stats.totalComplaints, note: 'Across all hostels', icon: ClipboardList },
    { label: 'Pending', value: data.stats.pendingComplaints, note: 'Submitted or reopened', icon: AlertCircle },
    { label: 'Assigned', value: data.stats.assignedComplaints, note: 'Waiting for staff action', icon: Users },
    { label: 'In progress', value: data.stats.inProgressComplaints, note: 'Currently being handled', icon: ClipboardList },
    { label: 'Resolved', value: data.stats.resolvedComplaints, note: 'Resolved or closed', icon: CheckCircle2 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-teal-700">Hostel operations</p>
          <h1 className="mt-1 text-3xl font-bold text-navy-800">Admin overview</h1>
          <p className="mt-2 text-sm text-slate-500">A live view of student reports and maintenance workload.</p>
        </div>
        <Link to="/admin/complaints" className="btn-primary">Manage complaints <ArrowRight size={16} /></Link>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Administrative statistics">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} loading={loading} />)}
      </section>

      <Suspense fallback={<div className="grid gap-5 xl:grid-cols-2" aria-label="Loading analytics"><div className="card h-80 animate-pulse bg-slate-50" /><div className="card h-80 animate-pulse bg-slate-50" /></div>}>
        <AdminAnalytics
          categoryData={data.categoryData}
          statusData={data.statusData}
          monthlyData={data.monthlyData}
          staffPerformance={data.staffPerformance}
          loading={loading}
        />
      </Suspense>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-navy-800">Recent complaints</h2>
            <p className="mt-1 text-xs text-slate-500">Latest reports across the hostel</p>
          </div>
          <Link to="/admin/complaints" className="text-sm font-semibold text-teal-700 hover:text-teal-800">View all</Link>
        </div>
        {data.recentComplaints.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Complaint</th><th className="px-5 py-3">Student</th><th className="px-5 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-navy-700">{complaint.complaintId}</td>
                    <td className="px-5 py-3">
                      <Link className="font-medium text-slate-800 hover:text-teal-700" to={`/admin/complaints/${complaint._id}`}>{complaint.title}</Link>
                      <p className="mt-1 text-xs text-slate-500">{complaint.category}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{complaint.studentId?.name || 'Unknown'}</td>
                    <td className="whitespace-nowrap px-5 py-3"><ComplaintStatusBadge status={complaint.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="px-5 py-10 text-center text-sm text-slate-400">{loading ? 'Loading complaints…' : 'No complaints have been submitted yet.'}</p>}
      </section>
    </div>
  )
}
