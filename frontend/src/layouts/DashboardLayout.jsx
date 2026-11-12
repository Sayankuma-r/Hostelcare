import { LogOut, ReceiptText, ShieldCheck, UserRound } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'
import { useAuth } from '../context/AuthContext'

const navItems = {
  student: [
    { label: 'Dashboard', path: '/student/dashboard' },
    { label: 'Submit Complaint', path: '/student/complaints/new' },
    { label: 'My Complaints', path: '/student/complaints' },
    { label: 'Notifications', path: '/student/notifications' },
    { label: 'Profile', path: '/student/profile' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Complaints', path: '/admin/complaints' },
    { label: 'Students', path: '/admin/students' },
    { label: 'Staff', path: '/admin/staff' },
    { label: 'Notifications', path: '/admin/notifications' },
    { label: 'Feedback', path: '/admin/feedback' },
    { label: 'Reports', path: '/admin/reports' },
  ],
  staff: [
    { label: 'Dashboard', path: '/staff/dashboard' },
    { label: 'Assigned Tasks', path: '/staff/complaints' },
    { label: 'Notifications', path: '/staff/notifications' },
    { label: 'Profile', path: '/staff/profile' },
  ],
}

export default function DashboardLayout({ role = 'student' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items = navItems[role] || navItems.student

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-72 bg-navy-800 p-6 text-white md:block">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold">HostelCare</p>
            <p className="text-xs text-slate-300">{role}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/student/dashboard' && location.pathname.startsWith(`${item.path}/`))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-teal-600 text-white' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              {role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : role === 'staff' ? <UserRound className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-300">{user?.role || role}</p>
            </div>
          </div>
        </div>

        <button type="button" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="min-h-screen p-4 md:ml-72 md:p-8">
        <div className="mb-5 hidden justify-end md:flex">
          <NotificationBell role={role} />
        </div>
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm md:hidden">
          <Link to={`/${role}/dashboard`} className="font-bold text-navy-800">HostelCare</Link>
          <nav className="flex min-w-0 gap-3 overflow-x-auto text-xs text-slate-600">
            {items.map((item) => (
              <Link key={item.path} to={item.path} className="whitespace-nowrap hover:text-teal-700">{item.label}</Link>
            ))}
          </nav>
          <NotificationBell role={role} />
          <button type="button" className="shrink-0 text-xs font-semibold text-slate-600" onClick={handleLogout}>Log out</button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
