import { useAuth } from '../context/AuthContext'
import AdminLogin from '../pages/admin/AdminLogin'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading...</div>
  if (user?.role !== 'admin') return <AdminLogin />

  return children
}
