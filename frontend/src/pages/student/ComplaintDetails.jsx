import { ArrowLeft, CalendarDays, MapPin, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge'
import FeedbackForm from '../../components/FeedbackForm'
import api, { getErrorMessage, getUploadUrl } from '../../services/api'

const formatDate = (date) => new Date(date).toLocaleString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export default function ComplaintDetails() {
  const { id } = useParams()
  const location = useLocation()
  const [complaint, setComplaint] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')

  const loadComplaint = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [complaintResponse, feedbackResponse] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/feedback/${id}`),
      ])
      setComplaint(complaintResponse.data.complaint)
      setFeedback(feedbackResponse.data.feedback[0] || null)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadComplaint()
  }, [loadComplaint])

  const reopenComplaint = async () => {
    setUpdating(true)
    setError('')
    setNotice('')
    try {
      await api.patch(`/complaints/${id}/reopen`, { remarks: 'The issue is still unresolved' })
      setNotice('Reopen request submitted.')
      await loadComplaint()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="card mx-auto max-w-4xl space-y-4 p-6" aria-label="Loading complaint"><div className="h-6 w-40 animate-pulse rounded bg-slate-100" /><div className="h-28 animate-pulse rounded-xl bg-slate-100" /></div>
  }

  if (error && !complaint) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link to="/student/complaints" className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={16} /> My complaints</Link>
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
      </div>
    )
  }

  if (!complaint) return null

  const mayReopen = ['RESOLVED', 'CLOSED'].includes(complaint.status)
  const timeline = [...(complaint.statusHistory || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/student/complaints" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-800">
        <ArrowLeft size={16} /> My complaints
      </Link>

      {notice && <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800" role="status">{notice}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <section className="card p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold text-teal-700">{complaint.complaintId}</p>
            <h1 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">{complaint.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{complaint.category} <span className="mx-1.5">·</span> {complaint.priority} priority</p>
          </div>
          <ComplaintStatusBadge status={complaint.status} />
        </div>

        <div className="mt-6 grid gap-3 border-y border-slate-100 py-4 text-sm sm:grid-cols-2">
          <p className="flex items-center gap-2 text-slate-600"><MapPin size={16} className="text-teal-700" />{complaint.hostel}, Block {complaint.block}, Room {complaint.roomNumber}</p>
          <p className="flex items-center gap-2 text-slate-600"><CalendarDays size={16} className="text-teal-700" />Submitted {formatDate(complaint.createdAt)}</p>
          {complaint.assignedTo && <p className="text-slate-600 sm:col-span-2">Assigned to <span className="font-semibold text-slate-800">{complaint.assignedTo.name}</span></p>}
        </div>

        <div className="pt-5">
          <h2 className="font-semibold text-navy-800">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{complaint.description}</p>
        </div>

        {complaint.imageUrl && (
          <div className="mt-6">
            <h2 className="mb-3 font-semibold text-navy-800">Attached photo</h2>
            <a href={getUploadUrl(complaint.imageUrl)} target="_blank" rel="noreferrer">
              <img src={getUploadUrl(complaint.imageUrl)} alt={`Photo for ${complaint.title}`} className="max-h-96 rounded-xl border border-slate-200 object-contain" />
            </a>
          </div>
        )}

        {complaint.resolutionNote && (
          <div className="mt-6 rounded-xl bg-teal-50 p-4">
            <h2 className="font-semibold text-teal-900">Resolution notes</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-teal-800">{complaint.resolutionNote}</p>
          </div>
        )}

        {mayReopen && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">Is the issue still unresolved? You can send a reopen request.</p>
            <button type="button" className="btn-secondary mt-3" onClick={reopenComplaint} disabled={updating}>
              <RotateCcw size={16} />{updating ? 'Sending request...' : 'Request reopening'}
            </button>
          </div>
        )}

        {['RESOLVED', 'CLOSED'].includes(complaint.status) && (
          <FeedbackForm
            complaintId={complaint._id}
            feedback={feedback}
            onSubmitted={(submittedFeedback) => {
              setFeedback(submittedFeedback)
              setNotice('Thank you for sharing your feedback.')
            }}
          />
        )}
      </section>

      <section className="card p-5 sm:p-8">
        <h2 className="text-xl font-semibold text-navy-800">Status history</h2>
        <ol className="mt-5 space-y-0">
          {timeline.map((item, index) => (
            <li key={`${item.to}-${item.timestamp}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
              {index < timeline.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" aria-hidden="true" />}
              <span className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-white ring-1 ${index === timeline.length - 1 ? 'bg-teal-600 ring-teal-600' : 'bg-slate-300 ring-slate-300'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800">{item.to.replaceAll('_', ' ')}</span>
                  <span className="text-xs text-slate-500">{formatDate(item.timestamp)}</span>
                </div>
                {item.remarks && <p className="mt-1 text-sm text-slate-600">{item.remarks}</p>}
                {item.updatedBy?.name && <p className="mt-1 text-xs text-slate-400">Updated by {item.updatedBy.name}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
