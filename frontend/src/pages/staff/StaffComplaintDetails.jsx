import { ArrowLeft, MapPin, Play, Send } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge'
import api, { getErrorMessage, getUploadUrl } from '../../services/api'

const formatDate = (date) => new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function StaffComplaintDetails() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadComplaint = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/complaints/${id}`)
      setComplaint(response.data.complaint)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadComplaint()
  }, [loadComplaint])

  const updateStatus = async (status, remarks) => {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await api.patch(`/complaints/${id}/status`, { status, remarks })
      setNotice(status === 'IN_PROGRESS' ? 'Work started. The student has been notified.' : 'Complaint marked resolved. The student has been notified.')
      setResolutionNote('')
      await loadComplaint()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const submitResolution = (event) => {
    event.preventDefault()
    if (resolutionNote.trim().length < 5) {
      setError('Add resolution notes with at least 5 characters.')
      return
    }
    updateStatus('RESOLVED', resolutionNote.trim())
  }

  if (loading) return <div className="card mx-auto max-w-4xl space-y-4 p-6" aria-label="Loading task"><div className="h-6 w-40 animate-pulse rounded bg-slate-100" /><div className="h-24 animate-pulse rounded-xl bg-slate-100" /></div>
  if (error && !complaint) {
    return <div className="space-y-4"><Link to="/staff/complaints" className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={16} /> Assigned tasks</Link><p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p></div>
  }
  if (!complaint) return null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/staff/complaints" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-800"><ArrowLeft size={16} /> Assigned tasks</Link>
      {notice && <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800" role="status">{notice}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <section className="card p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-700">{complaint.complaintId}</p>
              <h1 className="mt-1 text-2xl font-bold text-navy-800">{complaint.title}</h1>
              <p className="mt-2 text-sm text-slate-500">{complaint.category} · {complaint.priority} priority</p>
            </div>
            <ComplaintStatusBadge status={complaint.status} />
          </div>

          <div className="mt-5 grid gap-3 border-y border-slate-100 py-4 text-sm sm:grid-cols-2">
            <p className="text-slate-600">Reported by <strong className="text-slate-800">{complaint.studentId?.name || 'Student'}</strong></p>
            <p className="flex items-center gap-2 text-slate-600"><MapPin size={16} className="text-teal-700" />{complaint.hostel}, Block {complaint.block}, Room {complaint.roomNumber}</p>
            <p className="text-slate-500 sm:col-span-2">Submitted {formatDate(complaint.createdAt)}</p>
          </div>

          <h2 className="mt-5 font-semibold text-navy-800">Issue description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{complaint.description}</p>
          {complaint.imageUrl && (
            <div className="mt-6">
              <h2 className="mb-3 font-semibold text-navy-800">Problem photo</h2>
              <a href={getUploadUrl(complaint.imageUrl)} target="_blank" rel="noreferrer"><img src={getUploadUrl(complaint.imageUrl)} alt={`Reported issue: ${complaint.title}`} className="max-h-96 rounded-xl border border-slate-200 object-contain" /></a>
            </div>
          )}
          {complaint.resolutionNote && (
            <div className="mt-6 rounded-xl bg-teal-50 p-4">
              <h2 className="font-semibold text-teal-900">Resolution notes</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-teal-800">{complaint.resolutionNote}</p>
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="font-semibold text-navy-800">Work history</h2>
            <ol className="mt-4 space-y-3">
              {complaint.statusHistory.map((item, index) => (
                <li key={`${item.timestamp}-${index}`} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600" />
                  <div><p className="font-medium text-slate-800">{item.to.replaceAll('_', ' ')} <span className="font-normal text-slate-400">· {formatDate(item.timestamp)}</span></p>{item.remarks && <p className="mt-1 text-slate-500">{item.remarks}</p>}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <aside className="card space-y-4 p-5">
          <h2 className="font-semibold text-navy-800">Update work status</h2>
          {complaint.status === 'ASSIGNED' && (
            <>
              <p className="text-sm leading-5 text-slate-500">Accept this assignment and start working on the reported issue.</p>
              <button type="button" className="btn-primary w-full" onClick={() => updateStatus('IN_PROGRESS', 'Work accepted and started')} disabled={saving}>
                <Play size={16} />{saving ? 'Updating…' : 'Accept & start work'}
              </button>
            </>
          )}
          {complaint.status === 'IN_PROGRESS' && (
            <form onSubmit={submitResolution} className="space-y-3">
              <p className="text-sm leading-5 text-slate-500">Describe the repair or action taken. These notes will be visible to the student.</p>
              <div>
                <label className="label" htmlFor="resolutionNote">Resolution notes</label>
                <textarea id="resolutionNote" className="input min-h-32 resize-y" value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} minLength={5} maxLength={1000} required placeholder="Describe the work completed…" />
              </div>
              <button type="submit" className="btn-accent w-full" disabled={saving}><Send size={16} />{saving ? 'Saving…' : 'Mark as resolved'}</button>
            </form>
          )}
          {!['ASSIGNED', 'IN_PROGRESS'].includes(complaint.status) && (
            <p className="rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-500">There are no work actions available for this task in its current status.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
