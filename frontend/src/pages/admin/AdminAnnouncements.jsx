import { useEffect, useState } from 'react'
import { Bell, Megaphone, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../../services/api'

const categories = ['General', 'Water', 'Electricity', 'Maintenance', 'Mess', 'Emergency']
const priorities = ['Low', 'Medium', 'High', 'Urgent']
const emptyForm = {
  title: '',
  content: '',
  category: 'General',
  priority: 'Medium',
  status: 'Draft',
  audience: ['student', 'staff'],
  hostel: '',
  block: '',
  expiresAt: '',
}

const announcementPayload = (form) => ({
  ...form,
  expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
})

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadAnnouncements = async () => {
    try {
      const response = await api.get('/announcements')
      setAnnouncements(response.data.announcements)
      setError('')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAnnouncements() }, [])

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const toggleAudience = (role) => {
    setForm((current) => ({
      ...current,
      audience: current.audience.includes(role)
        ? current.audience.filter((item) => item !== role)
        : [...current.audience, role],
    }))
  }

  const saveAnnouncement = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = announcementPayload(form)
      if (editingId) await api.put(`/announcements/${editingId}`, payload)
      else await api.post('/announcements', payload)
      setForm(emptyForm)
      setEditingId('')
      await loadAnnouncements()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const editAnnouncement = (announcement) => {
    setEditingId(announcement._id)
    setForm({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      status: announcement.status,
      audience: announcement.audience,
      hostel: announcement.hostel || '',
      block: announcement.block || '',
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : '',
    })
  }

  const changeStatus = async (announcement, status) => {
    try {
      await api.patch(`/announcements/${announcement._id}/status`, { status })
      await loadAnnouncements()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.18em] text-teal-700">Resident communications</p>
        <h1 className="mt-1 text-3xl font-bold text-navy-800">Announcements</h1>
        <p className="mt-2 text-sm text-slate-500">Publish notices to students and staff, with optional hostel, block, and expiry targeting.</p>
      </header>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <form className="card space-y-5 p-5 sm:p-6" onSubmit={saveAnnouncement}>
        <div className="flex items-center gap-2"><Megaphone className="text-teal-700" size={19} /><h2 className="font-semibold text-navy-800">{editingId ? 'Edit announcement' : 'Create announcement'}</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label" htmlFor="announcement-title">Title</label><input id="announcement-title" className="input" name="title" value={form.title} onChange={updateField} minLength={5} maxLength={120} required /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="announcement-content">Details</label><textarea id="announcement-content" className="input min-h-32" name="content" value={form.content} onChange={updateField} minLength={10} maxLength={5000} required /></div>
          <div><label className="label" htmlFor="announcement-category">Category</label><select id="announcement-category" className="input" name="category" value={form.category} onChange={updateField}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div><label className="label" htmlFor="announcement-priority">Priority</label><select id="announcement-priority" className="input" name="priority" value={form.priority} onChange={updateField}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></div>
          <div><label className="label" htmlFor="announcement-status">Status</label><select id="announcement-status" className="input" name="status" value={form.status} onChange={updateField}><option>Draft</option><option>Published</option><option>Archived</option></select></div>
          <div><label className="label" htmlFor="announcement-expiry">Optional expiry</label><input id="announcement-expiry" className="input" type="datetime-local" name="expiresAt" value={form.expiresAt} onChange={updateField} /></div>
          <div><label className="label" htmlFor="announcement-hostel">Hostel (optional)</label><input id="announcement-hostel" className="input" name="hostel" value={form.hostel} onChange={updateField} maxLength={100} placeholder="All hostels if blank" /></div>
          <div><label className="label" htmlFor="announcement-block">Block (optional)</label><input id="announcement-block" className="input" name="block" value={form.block} onChange={updateField} maxLength={50} placeholder="All blocks if blank" /></div>
        </div>
        <fieldset>
          <legend className="label">Audience</legend>
          <div className="flex flex-wrap gap-4">
            {['student', 'staff'].map((role) => (
              <label key={role} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.audience.includes(role)} onChange={() => toggleAudience(role)} />
                {role === 'student' ? 'Students' : 'Maintenance staff'}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn-primary" disabled={saving || form.audience.length === 0}><Save size={16} /> {saving ? 'Saving…' : editingId ? 'Save changes' : 'Save announcement'}</button>
        {editingId && <button type="button" className="ml-3 text-sm font-medium text-slate-500" onClick={() => { setEditingId(''); setForm(emptyForm) }}>Cancel edit</button>}
      </form>

      <section className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4"><Bell className="text-teal-700" size={18} /><h2 className="font-semibold text-navy-800">All announcements</h2></div>
        {loading ? <p className="p-6 text-sm text-slate-500">Loading announcements…</p> : announcements.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No announcements have been created yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {announcements.map((announcement) => (
              <li key={announcement._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-800">{announcement.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{announcement.status}</span><span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700">{announcement.category}</span></div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{announcement.content}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="btn-secondary" to={`/admin/announcements/${announcement._id}`}>Details</Link>
                  <button type="button" className="btn-secondary" onClick={() => editAnnouncement(announcement)}>Edit</button>
                  {announcement.status !== 'Published' && <button type="button" className="btn-accent" onClick={() => changeStatus(announcement, 'Published')}>Publish</button>}
                  {announcement.status !== 'Archived' && <button type="button" className="btn-secondary" onClick={() => changeStatus(announcement, 'Archived')}>Archive</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
