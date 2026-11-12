import { useEffect, useState } from 'react'
import { Building2, CheckCircle2, ShieldAlert } from 'lucide-react'
import api from '../../services/api'

export default function Landing() {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    api
      .get('/health')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <div className="card w-full max-w-lg p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-700 text-white">
          <Building2 size={28} />
        </div>
        <h1 className="text-3xl font-bold text-navy-800">HostelCare</h1>
        <p className="mt-1 text-teal-600 font-medium">Report. Track. Resolve.</p>
        <p className="mt-4 text-sm text-slate-500">
          Hostel Complaint Management System — Phase 1 project setup.
        </p>
        <div
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1.5 text-sm"
          data-testid="api-status"
        >
          {apiStatus === 'online' ? (
            <CheckCircle2 size={16} className="text-teal-600" />
          ) : (
            <ShieldAlert size={16} className="text-amber-500" />
          )}
          API: {apiStatus}
        </div>
      </div>
    </main>
  )
}
