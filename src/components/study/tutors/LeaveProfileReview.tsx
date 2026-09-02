import { useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../../../auth/AuthContext'
import { createReview, ensureApiSession } from '../../../utils/platformApi'

interface LeaveProfileReviewProps {
  tutorHandle: string
  tutorName: string
  alreadyReviewed: boolean
  existingRating?: number
  onSubmitted: () => void
}

export default function LeaveProfileReview({
  tutorHandle,
  tutorName,
  alreadyReviewed,
  existingRating,
  onSubmitted,
}: LeaveProfileReviewProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user || user.role !== 'student') return null

  const shown = hover || rating

  if (alreadyReviewed) {
    return (
      <section
        id="leave-review"
        className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.08)] sm:p-6"
      >
        <h3 className="text-base font-bold text-slate-900">Your review</h3>
        <p className="mt-1 text-sm text-slate-500">
          You rated {tutorName}
        </p>
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-6 w-6 ${
                i < (existingRating ?? 0)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-200'
              }`}
              aria-hidden
            />
          ))}
        </div>
      </section>
    )
  }

  const onSubmit = async () => {
    if (rating < 1) {
      setError('Tap a star to rate this teacher')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await ensureApiSession(user)
      await createReview({
        tutorHandle,
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
    <section
      id="leave-review"
      className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.08)] sm:p-6"
    >
      <h3 className="text-base font-bold text-slate-900">Leave a review</h3>
      <p className="mt-1 text-sm text-slate-500">
        Rate {tutorName} with stars — 1 is poor, 5 is excellent.
      </p>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="rounded-lg p-0.5 transition hover:scale-105"
            aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
          >
            <Star
              className={`h-8 w-8 ${
                n <= shown
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-200'
              }`}
            />
          </button>
        ))}
        {rating > 0 ? (
          <span className="ml-2 text-sm font-semibold text-slate-700">
            {rating}/5
          </span>
        ) : null}
      </div>

      <label className="mt-4 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Comment (optional)
        <textarea
          className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like about this teacher?"
          maxLength={2000}
        />
      </label>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        disabled={submitting}
        onClick={() => void onSubmit()}
        className="mt-4 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </section>
  )
}
