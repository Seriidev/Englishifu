import { useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../../../auth/AuthContext'
import {
  createReview,
  ensureApiSession,
} from '../../../utils/platformApi'

interface LeaveReviewModalProps {
  open: boolean
  bookingId: number
  tutorName: string
  onClose: () => void
  onSubmitted: () => void
}

export default function LeaveReviewModal({
  open,
  bookingId,
  tutorName,
  onClose,
  onSubmitted,
}: LeaveReviewModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const onSubmit = async () => {
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      await ensureApiSession(user)
      await createReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      })
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <h3 className="text-lg font-bold text-slate-900">Rate your lesson</h3>
        <p className="mt-1 text-sm text-slate-500">
          How was your session with{' '}
          <span className="font-semibold text-slate-800">{tutorName}</span>?
        </p>

        <div className="mt-4 flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="rounded-lg p-1 transition hover:bg-amber-50"
              aria-label={`${n} stars`}
            >
              <Star
                className={`h-7 w-7 ${
                  n <= rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Comment (optional)
          <textarea
            className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What went well? What could improve?"
            maxLength={2000}
          />
        </label>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void onSubmit()}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  )
}
