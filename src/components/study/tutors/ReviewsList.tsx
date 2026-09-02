import { Star, User } from 'lucide-react'
import type { TutorReview } from '../../../types/notifications'
import { formatRelativeTime } from '../../../utils/platformApi'

interface ReviewsListProps {
  reviews: TutorReview[]
  averageRating: number
  totalReviews: number
  loading?: boolean
  emptyHint?: string
}

export default function ReviewsList({
  reviews,
  averageRating,
  totalReviews,
  loading,
  emptyHint,
}: ReviewsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
          aria-hidden
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-slate-800">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
          <span className="font-medium text-slate-500">
            · {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500">
          {emptyHint ?? 'No reviews yet.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {r.student_avatar ? (
                  <img
                    src={r.student_avatar}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <User className="h-4 w-4" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {r.student_name ?? 'Student'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatRelativeTime(r.created_at)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                        aria-hidden
                      />
                    ))}
                  </div>
                  {r.comment ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {r.comment}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
