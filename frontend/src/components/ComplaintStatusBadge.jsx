const statusStyles = {
  SUBMITTED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  RESOLVED: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  CLOSED: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  REOPENED: 'bg-orange-50 text-orange-700 ring-orange-600/20',
}

const formatStatus = (status) => status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function ComplaintStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status] || statusStyles.SUBMITTED}`}>
      {formatStatus(status)}
    </span>
  )
}
