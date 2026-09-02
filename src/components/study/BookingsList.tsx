import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import type { BookingRow } from '../../types/booking'
import {
  cancelBooking,
  fetchBookings,
  formatDateTimeRange,
  syncApiSession,
} from '../../utils/bookingApi'
import LeaveReviewModal from './bookings/LeaveReviewModal'
import { StatusBadge } from '../shared/StatusBadge'

interface BookingsListProps {
  role: 'student' | 'tutor'
  emptyHint?: string
}

function truthyReview(flag: unknown): boolean {
  return flag === true || flag === 't' || flag === 'true' || flag === 1
}

export default function BookingsList({ role, emptyHint }: BookingsListProps) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [reviewBooking, setReviewBooking] = useState<BookingRow | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      await syncApiSession(user)
      const rows = await fetchBookings(role)
      setBookings(rows)
    } catch (err) {
      setBookings([])
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [user, role])

  useEffect(() => {
    void load()
  }, [load])

  const onCancel = async (id: number) => {
    if (!user) return
    if (!window.confirm('Cancel this booking?')) return
    setBusyId(id)
    try {
      await syncApiSession(user)
      await cancelBooking(id)
      setBookings((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
          aria-hidden
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-900">
        {error}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          {emptyHint ?? 'No confirmed bookings yet.'}
        </p>
        {role === 'student' ? (
          <Link
            to="/study/tutors"
            className="mt-4 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Find a tutor
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-3">
        {bookings.map((b) => {
          const counterpart =
            role === 'student'
              ? b.tutor_name ?? 'Tutor'
              : b.student_name ?? 'Student'
          const handle =
            role === 'student' ? b.tutor_handle : b.student_handle
          const canReview =
            role === 'student' &&
            b.status === 'completed' &&
            !truthyReview(b.has_review)

          return (
            <li
              key={b.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-slate-900">
                      {b.subject || 'Lesson'}
                    </p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    with {counterpart}
                    {handle ? (
                      <span className="text-slate-400"> @{handle}</span>
                    ) : null}
                  </p>
                    <p className="mt-2 text-sm font-medium text-indigo-700">
                    {formatDateTimeRange(b.start_at, b.end_at)}
                  </p>
                  {b.meeting_link ? (
                    <a
                      href={b.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      Meeting link
                    </a>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {canReview ? (
                    <button
                      type="button"
                      onClick={() => setReviewBooking(b)}
                      className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                    >
                      Leave review
                    </button>
                  ) : null}
                  {b.status === 'confirmed' ? (
                    <button
                      type="button"
                      disabled={busyId === b.id}
                      onClick={() => void onCancel(b.id)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {busyId === b.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {reviewBooking ? (
        <LeaveReviewModal
          open
          bookingId={reviewBooking.id}
          tutorName={reviewBooking.tutor_name ?? 'Tutor'}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => {
            setReviewBooking(null)
            void load()
          }}
        />
      ) : null}
    </>
  )
}
