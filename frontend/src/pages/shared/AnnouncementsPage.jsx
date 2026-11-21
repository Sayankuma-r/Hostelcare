import { useEffect, useState } from 'react'
import { Bell, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api, { getErrorMessage } from '../../services/api'

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/announcements')
      .then(({ data }) => {
        if (active) {
          setAnnouncements(data.announcements)
          setUnreadCount(data.unreadCount)
        }
      })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.18em] text-teal-700">Hostel updates</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-navy-800"><Megaphone size={27} /> Announcements</h1>
        <p className="mt-2 text-sm text-slate-500">{unreadCount} unread announcement{unreadCount === 1 ? '' : 's'} for you.</p>
      </header>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <section className="card overflow-hidden" aria-label="Announcement list">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading announcements…</p> : announcements.length === 0 ? (
          <div className="p-10 text-center"><Bell className="mx-auto text-slate-300" size={26} /><h2 className="mt-3 font-semibold text-navy-800">No current announcements</h2><p className="mt-1 text-sm text-slate-500">Relevant hostel notices will appear here.</p></div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {announcements.map((announcement) => (
              <li key={announcement._id}>
                <Link to={`/${user.role}/announcements/${announcement._id}`} className="block p-5 transition hover:bg-slate-50 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {!announcement.isRead && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800">Unread</span>}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{announcement.category}</span>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700">{announcement.priority}</span>
                    <time className="ml-auto text-xs text-slate-400">{new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}</time>
                  </div>
                  <h2 className="mt-3 font-semibold text-navy-800">{announcement.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{announcement.content}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
