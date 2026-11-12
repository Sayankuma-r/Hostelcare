import { ArrowLeft, MapPin, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge'
import api, { getErrorMessage, getUploadUrl } from '../../services/api'

const priorities = ['Low', 'Medium', 'High', 'Urgent']
const formatDate = (date) => new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function AdminComplaintDetails() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [staff, setStaff] = useState([])
  const [staffId, setStaffId] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [complaintResponse, staffResponse] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get('/admin/users', { params: { role: 'staff', limit: 100 } }),
      ])
      const nextComplaint = complaintResponse.data.complaint
      setComplaint(nextComplaint)
      setStaffId(nextComplaint.assignedTo?._id || '')
      setPriority(nextComplaint.priority)
      setStaff(staffResponse.data.users)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveAssignment = async (event) => {
    event.preventDefault()
    if (!staffId) {
      setError('Select a maintenance staff member first.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await api.patch(`/complaints/${id}/assign`, { staffId })
      setNotice('Complaint assigned successfully.')
      await loadData()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const savePriority = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await api.patch(`/complaints/${id}/priority`, { priority })
      setComplaint(response.data.complaint)
      setNotice('Priority updated.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const closeComplaint = async () => {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await api.patch(`/complaints/${id}/close`)
      setNotice('Complaint closed.')
      await loadData()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card mx-auto max-w-5xl space-y-4 p-6" aria-label="Loading complaint"><div className="h-6 w-40 animate-pulse rounded bg-slate-100" /><div className="h-24 animate-pulse rounded-xl bg-slate-100" /></div>
  if (error && !complaint) {
    return <div className="space-y-4"><Link to="/admin/complaints" className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={16} /> All complaints</Link><p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p></div>
  }
  if (!complaint) return null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/admin/complaints" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-800"><ArrowLeft size={16} /> All complaints</Link>
      {notice && <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800" role="status">{notice}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
        <section className="card p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-700">{complaint.complaintId}</p>
              <h1 className="mt-1 text-2xl font-bold text-navy-800">{complaint.title}</h1>
              <p className="mt-2 text-sm text-slate-500">{complaint.category} <span className="mx-1">·</span> {complaint.priority} priority</p>
            </div>
            <ComplaintStatusBadge status={complaint.status} />
          </div>

          <div className="mt-5 grid gap-3 border-y border-slate-100 py-4 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2 text-slate-600"><UserRound size={16} className="text-teal-700" />{complaint.studentId?.name || 'Unknown student'} ({complaint.studentId?.email || 'No email'})</p>
            <p className="flex items-center gap-2 text-slate-600"><MapPin size={16} className="text-teal-700" />{complaint.hostel}, Block {complaint.block}, Room {complaint.roomNumber}</p>
            <p className="text-slate-500 sm:col-span-2">Submitted {formatDate(complaint.createdAt)}</p>
          </div>

          <h2 className="mt-5 font-semibold text-navy-800">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{complaint.description}</p>

          {complaint.imageUrl && (
            <div className="mt-6">
              <h2 className="mb-3 font-semibold text-navy-800">Attached photo</h2>
              <a href={getUploadUrl(complaint.imageUrl)} target="_blank" rel="noreferrer">
                <img src={getUploadUrl(complaint.imageUrl)} alt={`Photo for ${complaint.title}`} className="max-h-96 rounded-xl border border-slate-200 object-contain" />
              </a>
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="font-semibold text-navy-800">Status history</h2>
            <ol className="mt-4 space-y-3">
              {complaint.statusHistory.map((item, index) => (
                <li key={`${item.timestamp}-${index}`} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600" />
                  <div>
                    <p className="font-medium text-slate-800">{item.to.replaceAll('_', ' ')} <span className="font-normal text-slate-400">· {formatDate(item.timestamp)}</span></p>
                    {item.remarks && <p className="mt-1 text-slate-500">{item.remarks}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {complaint.status === 'RESOLVED' && (
            <button type="button" className="btn-secondary mt-6" onClick={closeComplaint} disabled={saving}>Close resolved complaint</button>
          )}
        </section>

        <aside className="space-y-5">
          <form className="card space-y-4 p-5" onSubmit={saveAssignment}>
            <div>
              <h2 className="font-semibold text-navy-800">Assign maintenance staff</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">The selected team member will receive this task.</p>
            </div>
            <div>
              <label className="label" htmlFor="staffId">Staff member</label>
              <select id="staffId" className="input" value={staffId} onChange={(event) => setStaffId(event.target.value)} required>
                <option value="">Choose staff</option>
                {staff.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}
              </select>
            </div>
            {staff.length === 0 && <p className="text-xs text-amber-700">No staff accounts yet. Create one from Staff management.</p>}
            <button type="submit" className="btn-primary w-full" disabled={saving || staff.length === 0}>{saving ? 'Saving…' : complaint.assignedTo ? 'Reassign complaint' : 'Assign complaint'}</button>
          </form>

          <form className="card space-y-4 p-5" onSubmit={savePriority}>
            <div>
              <h2 className="font-semibold text-navy-800">Complaint priority</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Adjust urgency for maintenance triage.</p>
            </div>
            <select className="input" value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Complaint priority">
              {priorities.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button type="submit" className="btn-secondary w-full" disabled={saving}>{saving ? 'Saving…' : 'Update priority'}</button>
          </form>
        </aside>
      </div>
    </div>
  )
}
