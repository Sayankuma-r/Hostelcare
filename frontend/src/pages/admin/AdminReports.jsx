import { Download, FileBarChart } from 'lucide-react'
import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../services/api'

const formatStatus = (status) => status
  ? status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
  : ''
const monthName = (month) => new Date(2000, month - 1).toLocaleString(undefined, { month: 'short' })

export default function AdminReports() {
  const [report, setReport] = useState({ summary: [], categoryData: [], priorityData: [], monthlyData: [], totalComplaints: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/admin/reports')
      .then((response) => {
        if (active) setReport(response.data)
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const downloadCsv = () => {
    const rows = [
      ['Report', 'Value', 'Count'],
      ...report.summary.map((item) => ['Status', item._id, item.count]),
      ...report.categoryData.map((item) => ['Category', item._id, item.count]),
      ...report.priorityData.map((item) => ['Priority', item._id, item.count]),
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `hostelcare-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const total = report.totalComplaints || report.summary.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-teal-700">Operations</p>
          <h1 className="mt-1 text-3xl font-bold text-navy-800">Reports</h1>
          <p className="mt-2 text-sm text-slate-500">Export and review complaint totals by status, category, and priority.</p>
        </div>
        <button type="button" className="btn-primary" onClick={downloadCsv} disabled={loading || total === 0}>
          <Download size={16} /> Download CSV
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <section className="card p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-teal-50 p-3 text-teal-700"><FileBarChart size={22} /></span>
          <div><p className="text-sm text-slate-500">Total complaints</p><p className="text-3xl font-bold text-navy-800">{loading ? '—' : total}</p></div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {[
          { title: 'By status', rows: report.summary, empty: 'No status data' },
          { title: 'By category', rows: report.categoryData, empty: 'No category data' },
          { title: 'By priority', rows: report.priorityData, empty: 'No priority data' },
        ].map((section) => (
          <div className="card overflow-hidden" key={section.title}>
            <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-navy-800">{section.title}</h2>
            {loading ? <p className="p-5 text-sm text-slate-500">Loading report…</p> : section.rows.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">{section.empty}</p>
            ) : (
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {section.rows.map((row) => (
                    <tr key={row._id}>
                      <td className="px-5 py-3 text-slate-600">{formatStatus(row._id) || 'Unknown'}</td>
                      <td className="px-5 py-3 text-right font-semibold text-navy-800">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </section>

      <section className="card overflow-hidden">
        <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-navy-800">Monthly trend</h2>
        {loading ? <p className="p-5 text-sm text-slate-500">Loading report…</p> : report.monthlyData.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No monthly complaint data</p>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100">
              {report.monthlyData.map((item) => (
                <tr key={`${item._id.year}-${item._id.month}`}>
                  <td className="px-5 py-3 text-slate-600">{monthName(item._id.month)} {item._id.year}</td>
                  <td className="px-5 py-3 text-right font-semibold text-navy-800">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
