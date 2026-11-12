import { Bell, Check, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'

const getComplaintRoute = (role, complaintId) => {
  if (!complaintId) return `/${role}/notifications`
  return `/${role}/complaints/${complaintId}`
}

export default function NotificationBell({ role }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data.notifications)
      setUnreadCount(response.data.unreadCount)
      setError('')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  useEffect(() => {
    loadNotifications()
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

  const openComplaint = async (notification) => {
    if (!notification.isRead) await markRead(notification._id)
    const complaintId = notification.complaintId?._id || notification.complaintId
    setOpen(false)
    navigate(getComplaintRoute(role, complaintId))
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current)
          if (!open) loadNotifications()
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="font-semibold text-navy-800">Notifications</h2>
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && <button type="button" className="text-xs font-semibold text-teal-700 hover:text-teal-800" onClick={markAllRead}>Mark all read</button>}
          </div>
          {error && <p className="px-4 py-3 text-xs text-red-600" role="alert">{error}</p>}
          {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-500">You’re all caught up.</p> : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {notifications.slice(0, 6).map((notification) => (
                <li key={notification._id} className={`p-4 ${notification.isRead ? 'bg-white' : 'bg-teal-50/50'}`}>
                  <p className="text-sm leading-5 text-slate-700">{notification.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-teal-700" onClick={() => openComplaint(notification)}>
                        <ExternalLink size={13} /> Open
                      </button>
                      {!notification.isRead && <button type="button" className="inline-flex items-center gap-1 text-xs text-slate-500" onClick={() => markRead(notification._id)}><Check size={13} /> Read</button>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="w-full border-t border-slate-100 px-4 py-3 text-sm font-semibold text-teal-700 hover:bg-slate-50" onClick={() => { setOpen(false); navigate(`/${role}/notifications`) }}>
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}
