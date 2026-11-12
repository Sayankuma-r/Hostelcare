import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import StudentDashboard from './pages/student/StudentDashboard'
import NewComplaint from './pages/student/NewComplaint'
import MyComplaints from './pages/student/MyComplaints'
import ComplaintDetails from './pages/student/ComplaintDetails'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminComplaints from './pages/admin/AdminComplaints'
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails'
import AdminStudents from './pages/admin/AdminStudents'
import AdminStaff from './pages/admin/AdminStaff'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffTasks from './pages/staff/StaffTasks'
import StaffComplaintDetails from './pages/staff/StaffComplaintDetails'
import NotificationsPage from './pages/shared/NotificationsPage'
import AdminFeedback from './pages/admin/AdminFeedback'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout role="student" /></ProtectedRoute>}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/complaints" element={<MyComplaints />} />
            <Route path="/student/complaints/new" element={<NewComplaint />} />
            <Route path="/student/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
            <Route path="/student/profile" element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/complaints/:id" element={<AdminComplaintDetails />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/reports" element={<AdminDashboard />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['staff']}><DashboardLayout role="staff" /></ProtectedRoute>}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/complaints" element={<StaffTasks />} />
            <Route path="/staff/complaints/:id" element={<StaffComplaintDetails />} />
            <Route path="/staff/notifications" element={<NotificationsPage />} />
            <Route path="/staff/profile" element={<StaffDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
