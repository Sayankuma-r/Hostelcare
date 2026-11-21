import { useEffect, useState } from 'react'
import { ArrowLeft, Megaphone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api, { getErrorMessage } from '../../services/api'

export default function AnnouncementDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data } = await api.get(`/announcements/${id}`)
        if (!active) return
        setAnnouncement(data.announcement)
        if (user.role !== 'admin' && !data.announcement.isRead) {
          try {
            await api.patch(`/announcements/${id}/read`)
          } catch (requestError) {
            if (active) setError(getErrorMessage(requestError))
          }
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id, user.role])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to={`/${user.role}/announcements`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-800"><ArrowLeft size={16} /> All announcements</Link>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {loading ? <div className="card space-y-4 p-6" aria-label="Loading announcement"><div className="h-5 w-28 animate-pulse rounded bg-slate-100" /><div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" /><div className="h-28 animate-pulse rounded bg-slate-100" /></div> : announcement ? (
        <article className="card p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 font-medium text-teal-800"><Megaphone size={13} /> {announcement.category}</span>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 font-medium text-orange-700">{announcement.priority} priority</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold text-navy-800">{announcement.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{new Date(announcement.publishedAt || announcement.createdAt).toLocaleString()}</p>
          <div className="mt-7 whitespace-pre-wrap border-t border-slate-100 pt-6 text-sm leading-7 text-slate-700">{announcement.content}</div>
          {(announcement.hostel || announcement.block) && <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Applies to {[announcement.hostel, announcement.block].filter(Boolean).join(' · ')}</p>}
        </article>
      ) : !error && <p className="card p-8 text-center text-sm text-slate-500">Announcement not found.</p>}
    </div>
  )
}
