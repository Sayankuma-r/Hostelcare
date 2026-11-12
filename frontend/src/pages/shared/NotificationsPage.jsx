import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api, { getErrorMessage } from '../../services/api'

const complaintRoute = (role, id) => id ? `/${role}/complaints/${id}` : `/${role}/notifications`

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/notifications')
      .then((response) => {
        if (active) {
          setNotifications(response.data.notifications)
          setUnreadCount(response.data.unreadCount)
        }
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications((current) => current.map((item) => item._id === id ? { ...item, isRead: true } : item))
      setUnreadCount((current) => Math.max(0, current - 1))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
      setError('')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-teal-700">Updates</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-navy-800"><Bell size={26} /> Notifications</h1>
          <p className="mt-2 text-sm text-slate-500">Stay informed about complaint assignments and status changes.</p>
        </div>
        {unreadCount > 0 && <button type="button" className="btn-secondary" onClick={markAllRead}><CheckCheck size={16} /> Mark all as read</button>}
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <section className="card overflow-hidden" aria-label="Notification list">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading notifications…</p> : notifications.length === 0 ? (
          <div className="px-6 py-14 text-center"><Bell className="mx-auto text-slate-300" size={28} /><h2 className="mt-3 font-semibold text-navy-800">You’re all caught up</h2><p className="mt-1 text-sm text-slate-500">New complaint updates will appear here.</p></div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const complaintId = notification.complaintId?._id || notification.complaintId
              return (
                <li key={notification._id} className={`flex gap-3 p-5 sm:gap-4 ${notification.isRead ? 'bg-white' : 'bg-teal-50/40'}`}>
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-200' : 'bg-teal-600'}`} aria-label={notification.isRead ? 'Read' : 'Unread'} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-6 ${notification.isRead ? 'text-slate-600' : 'font-medium text-slate-800'}`}>{notification.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      {complaintId && <Link className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800" to={complaintRoute(user.role, complaintId)}><ExternalLink size={14} /> Open complaint</Link>}
                      {!notification.isRead && <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700" onClick={() => markRead(notification._id)}><Check size={14} /> Mark as read</button>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
