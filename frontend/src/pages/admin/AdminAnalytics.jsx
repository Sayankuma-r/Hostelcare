import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const chartColors = ['#0f766e', '#1d4ed8', '#d97706', '#7c3aed', '#0891b2', '#be123c', '#475569']
const monthName = (month) => new Date(2000, month - 1).toLocaleString(undefined, { month: 'short' })
const formatStatus = (status) => status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function AdminAnalytics({ categoryData, statusData, monthlyData, staffPerformance, loading }) {
  const categoryChart = categoryData.map((item) => ({ name: item._id, count: item.count }))
  const statusChart = statusData.map((item) => ({ name: formatStatus(item._id), count: item.count }))
  const monthlyChart = monthlyData.map((item) => ({
    name: `${monthName(item._id.month)} ${item._id.year}`,
    complaints: item.count,
  }))

  return (
    <section className="grid gap-5 xl:grid-cols-2" aria-label="Complaint analytics">
      <div className="card p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-navy-800">Monthly complaint trend</h2>
          <p className="mt-1 text-xs text-slate-500">Complaints submitted by month</p>
        </div>
        {monthlyChart.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyChart} margin={{ top: 8, right: 12, left: -20, bottom: 4 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="complaints" stroke="#0f766e" strokeWidth={3} dot={{ fill: '#0f766e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="flex h-[260px] items-center justify-center text-sm text-slate-400">{loading ? 'Loading analytics…' : 'No complaint trend data yet'}</p>}
      </div>

      <div className="card p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-navy-800">Complaints by category</h2>
          <p className="mt-1 text-xs text-slate-500">Categories based on submitted reports</p>
        </div>
        {categoryChart.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryChart} margin={{ top: 8, right: 8, left: -20, bottom: 28 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f766e" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="flex h-[260px] items-center justify-center text-sm text-slate-400">{loading ? 'Loading analytics…' : 'No category data yet'}</p>}
      </div>

      <div className="card p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-navy-800">Complaints by status</h2>
          <p className="mt-1 text-xs text-slate-500">Current lifecycle distribution</p>
        </div>
        {statusChart.length ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusChart} dataKey="count" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {statusChart.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ul className="grid w-full grid-cols-2 gap-2 text-xs">
              {statusChart.map((status, index) => (
                <li key={status.name} className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  {status.name}: <strong>{status.count}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : <p className="flex h-[240px] items-center justify-center text-sm text-slate-400">{loading ? 'Loading analytics…' : 'No status data yet'}</p>}
      </div>

      <div className="card p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-navy-800">Staff performance</h2>
          <p className="mt-1 text-xs text-slate-500">Assignments and resolution rate</p>
        </div>
        {staffPerformance.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <tr><th className="py-2">Staff</th><th className="py-2">Assigned</th><th className="py-2">Resolved</th><th className="py-2">Rate</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffPerformance.map((staff) => (
                  <tr key={staff._id}>
                    <td className="py-3 font-medium text-slate-700">{staff.name}</td>
                    <td className="py-3 text-slate-600">{staff.assignedCount}</td>
                    <td className="py-3 text-slate-600">{staff.resolvedCount}</td>
                    <td className="py-3 text-slate-600">{Math.round(staff.resolutionRate)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="flex h-[240px] items-center justify-center text-sm text-slate-400">{loading ? 'Loading performance…' : 'No staff assignments yet'}</p>}
      </div>
    </section>
  )
}
