import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { StatusBadge } from '../../components/shared/StatusBadge'
import type { BookingRow } from '../../types/booking'
import {
  cancelBooking,
  completeBooking,
  fetchBookings,
  formatDateTimeRange,
  syncApiSession,
} from '../../utils/bookingApi'
import { sendStudentBoost } from '../../utils/studentXp'

type Filter = 'upcoming' | 'past' | 'cancelled'

export default function TutorBookingsInbox() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [filter, setFilter] = useState<Filter>('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user || user.role !== 'tutor') return
    setLoading(true)
    setError(null)
    try {
      await syncApiSession(user)
      const rows = await fetchBookings('tutor')
      setBookings(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const now = Date.now()
    return bookings.filter((b) => {
      if (filter === 'cancelled') return b.status === 'cancelled'
      if (filter === 'past') {
        return (
          b.status === 'completed' ||
          (b.status === 'confirmed' && new Date(b.end_at).getTime() < now)
        )
      }
      return (
        b.status === 'confirmed' && new Date(b.end_at).getTime() >= now
      )
    })
  }, [bookings, filter])

  if (!user || user.role !== 'tutor') return null

  const onComplete = async (id: number) => {
    setBusyId(id)
    try {
      await syncApiSession(user)
      await completeBooking(id)
      setFlash('Lesson completed — student received +30 XP.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete')
    } finally {
      setBusyId(null)
    }
  }

  const onLessonBoost = async (booking: BookingRow) => {
    setBusyId(booking.id)
    setError(null)
    try {
      await syncApiSession(user)
      await sendStudentBoost({
        studentId: booking.student_id,
        kind: 'lesson',
        bookingId: booking.id,
      })
      setFlash('Lesson boost sent — student received +30 XP.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send boost')
    } finally {
      setBusyId(null)
    }
  }

  const onCancel = async (id: number) => {
    if (!window.confirm('Cancel this booking?')) return
    setBusyId(id)
    try {
      await syncApiSession(user)
      await cancelBooking(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Bookings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage upcoming lessons. Completing a lesson gives the student +30 XP.
        </p>
      </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {(
            [
              ['upcoming', 'Upcoming'],
              ['past', 'Past'],
              ['cancelled', 'Cancelled'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {error}
          </p>
        ) : null}
        {flash ? (
          <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {flash}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No {filter} bookings.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {b.subject || 'Lesson'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      with {b.student_name ?? 'Student'}
                      {b.student_handle ? (
                        <span className="text-slate-400">
                          {' '}
                          @{b.student_handle}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-2 text-sm font-medium text-indigo-700">
                      {formatDateTimeRange(b.start_at, b.end_at)}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.status === 'confirmed' ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === b.id}
                          onClick={() => void onComplete(b.id)}
                          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {busyId === b.id ? 'Saving…' : 'Mark as Completed'}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === b.id}
                          onClick={() => void onCancel(b.id)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : null}
                    {b.status === 'completed' && !b.lesson_boosted ? (
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => void onLessonBoost(b)}
                        className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
                      >
                        {busyId === b.id ? 'Sending…' : 'Boost +30 XP'}
                      </button>
                    ) : null}
                    {b.status === 'completed' && b.lesson_boosted ? (
                      <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-400">
                        Lesson boosted
                      </span>
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
