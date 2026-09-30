import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { StatusBadge } from '../../components/shared/StatusBadge'
import type { BookingRow } from '../../types/booking'
import {
  acceptBooking,
  cancelBooking,
  completeBooking,
  fetchBookings,
  formatTimeLabel,
  syncApiSession,
} from '../../utils/bookingApi'

type Filter = 'upcoming' | 'past' | 'cancelled'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
  return letters || '?'
}

function whenParts(startIso: string, endIso: string) {
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(startIso))
  return {
    date,
    time: `${formatTimeLabel(startIso)} – ${formatTimeLabel(endIso)}`,
  }
}

function statusLabel(status: BookingRow['status']): string | undefined {
  if (status === 'pending') return 'Needs approval'
  if (status === 'confirmed') return 'Accepted'
  return undefined
}

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

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === 'pending').length,
    [bookings],
  )

  const filtered = useMemo(() => {
    const now = Date.now()
    return bookings
      .filter((b) => {
        if (filter === 'cancelled') return b.status === 'cancelled'
        if (filter === 'past') {
          return (
            b.status === 'completed' ||
            (b.status === 'confirmed' && new Date(b.end_at).getTime() < now)
          )
        }
        if (b.status === 'pending') return true
        return b.status === 'confirmed' && new Date(b.end_at).getTime() >= now
      })
      .sort((a, b) => {
        const rank = (row: BookingRow) => (row.status === 'pending' ? 0 : 1)
        return (
          rank(a) - rank(b) ||
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        )
      })
  }, [bookings, filter])

  if (!user || user.role !== 'tutor') return null

  const onAccept = async (id: number) => {
    setBusyId(id)
    setError(null)
    try {
      await syncApiSession(user)
      await acceptBooking(id)
      setFlash('Request accepted. The student can see the lesson now.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept')
    } finally {
      setBusyId(null)
    }
  }

  const onComplete = async (id: number) => {
    setBusyId(id)
    try {
      await syncApiSession(user)
      await completeBooking(id)
      setFlash('Lesson completed. Student received +10 XP.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete')
    } finally {
      setBusyId(null)
    }
  }

  const onCancel = async (id: number, pending: boolean) => {
    if (!window.confirm(pending ? 'Decline this request?' : 'Cancel this booking?')) return
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
          New student requests stay here until you accept them. Completing an
          accepted lesson gives the student +10 XP.
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
              className={`inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                filter === id
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
              {id === 'upcoming' && pendingCount > 0 ? (
                <span
                  className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                    filter === id
                      ? 'bg-white/25 text-white'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {pendingCount}
                </span>
              ) : null}
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
            {filtered.map((b) => {
              const studentName = b.student_name ?? 'Student'
              const when = whenParts(b.start_at, b.end_at)
              const waiting = b.status === 'pending'
              return (
                <li
                  key={b.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
                    waiting
                      ? 'border-amber-300 ring-1 ring-amber-100'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                        {initials(studentName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-slate-900">
                          {studentName}
                        </p>
                        {b.student_handle ? (
                          <p className="text-sm text-slate-500">
                            @{b.student_handle}
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {b.subject || 'Lesson'}
                          </span>
                          <StatusBadge
                            status={b.status}
                            label={statusLabel(b.status)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-indigo-50 px-4 py-3 lg:min-w-[220px] lg:text-right">
                      <p className="text-xs font-semibold tracking-wide text-indigo-400 uppercase">
                        Lesson time
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">
                        {when.date}
                      </p>
                      <p className="text-lg font-bold text-indigo-700">
                        {when.time}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {waiting ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === b.id}
                          onClick={() => void onAccept(b.id)}
                          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {busyId === b.id ? 'Saving…' : 'Accept'}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === b.id}
                          onClick={() => void onCancel(b.id, true)}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    ) : null}
                    {b.status === 'confirmed' ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === b.id}
                          onClick={() => void onComplete(b.id)}
                          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {busyId === b.id ? 'Saving…' : 'Mark as Completed'}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === b.id}
                          onClick={() => void onCancel(b.id, false)}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : null}
                    {b.status === 'completed' ? (
                      <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">
                        +10 XP
                      </span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
    </div>
  )
}
