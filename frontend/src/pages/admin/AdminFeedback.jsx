import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../services/api'

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/feedback')
      .then((response) => {
        if (active) setFeedback(response.data.feedback)
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-teal-700">Service quality</p>
        <h1 className="mt-1 text-3xl font-bold text-navy-800">Student feedback</h1>
        <p className="mt-2 text-sm text-slate-500">Ratings and comments submitted after complaint resolution.</p>
      </div>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <section className="card overflow-hidden">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading feedback…</p> : feedback.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">No feedback has been submitted yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedback.map((item) => (
              <article key={item._id} className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold text-navy-800">{item.complaintId?.complaintId || 'Complaint'}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.complaintId?.title || 'Complaint details unavailable'} · {item.studentId?.name || 'Student'}</p>
                  </div>
                  <div className="flex items-center gap-1" aria-label={`${item.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} className={star <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.comment}</p>
                <p className="mt-3 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
