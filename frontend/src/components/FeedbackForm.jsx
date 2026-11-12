import { Star } from 'lucide-react'
import { useState } from 'react'
import api, { getErrorMessage } from '../services/api'

export default function FeedbackForm({ complaintId, feedback, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submitFeedback = async (event) => {
    event.preventDefault()
    setError('')
    if (!rating) {
      setError('Choose a rating from 1 to 5 stars.')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/feedback', { complaintId, rating, comment })
      onSubmitted(response.data.feedback)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  if (feedback) {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="font-semibold text-navy-800">Your feedback</h2>
        <div className="mt-2 flex gap-1" aria-label={`${feedback.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} className={star <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{feedback.comment}</p>
        <p className="mt-2 text-xs text-slate-400">Submitted {new Date(feedback.createdAt).toLocaleDateString()}</p>
      </div>
    )
  }

  return (
    <form className="mt-6 rounded-xl border border-teal-100 bg-teal-50/50 p-4" onSubmit={submitFeedback}>
      <h2 className="font-semibold text-navy-800">How was the resolution?</h2>
      <p className="mt-1 text-sm text-slate-600">Rate the maintenance service and share a few details.</p>
      <div className="mt-3 flex gap-1" role="group" aria-label="Rate resolution from 1 to 5 stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" aria-label={`${star} star${star === 1 ? '' : 's'}`} aria-pressed={rating === star} onClick={() => setRating(star)} className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-teal-600">
            <Star size={23} className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
          </button>
        ))}
      </div>
      <label className="label mt-3" htmlFor="feedbackComment">Your comments</label>
      <textarea id="feedbackComment" className="input min-h-24 resize-y bg-white" value={comment} onChange={(event) => setComment(event.target.value)} minLength={5} maxLength={1000} required placeholder="What went well, or what could be improved?" />
      {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
      <button type="submit" className="btn-accent mt-3" disabled={loading}>{loading ? 'Submitting…' : 'Submit feedback'}</button>
    </form>
  )
}
