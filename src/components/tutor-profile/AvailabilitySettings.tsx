import { useEffect, useState, type FormEvent } from 'react'
import { Clock } from 'lucide-react'
import type { TutorAvailabilityRow } from '../../types/booking'
import { WEEKDAY_LABELS } from '../../types/booking'
import {
  createTutorAvailability,
  deleteTutorAvailability,
  fetchTutorAvailability,
  syncApiSession,
} from '../../utils/bookingApi'
import { useAuth } from '../../auth/AuthContext'

function formatTimeDisplay(time: string): string {
  const raw = String(time).slice(0, 5)
  const [h, m] = raw.split(':').map(Number)
  const d = new Date()
  d.setHours(h || 0, m || 0, 0, 0)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15'

const labelClass =
  'text-[11px] font-semibold tracking-wide text-slate-400 uppercase'

export default function AvailabilitySettings({
  embedded = false,
}: {
  embedded?: boolean
}) {
  const { user } = useAuth()
  const [rows, setRows] = useState<TutorAvailabilityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60)

  const load = async () => {
    if (!user || user.role !== 'tutor') return
    setLoading(true)
    setError(null)
    try {
      await syncApiSession(user)
      const data = await fetchTutorAvailability()
      setRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [user?.id])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== 'tutor') return
    setSaving(true)
    setError(null)
    try {
      await syncApiSession(user)
      await createTutorAvailability({
        dayOfWeek,
        startTime,
        endTime,
        slotDurationMinutes,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: number) => {
    if (!user || user.role !== 'tutor') return
    setError(null)
    try {
      await syncApiSession(user)
      await deleteTutorAvailability(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const shellClass = embedded
    ? ''
    : 'rounded-2xl border border-gray-200 bg-white p-5 sm:p-6'

  return (
    <section className={shellClass}>
      <h2 className="text-lg font-bold text-slate-900">
        Weekly availability
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        Students book open slots from this repeating schedule. Times are stored
        in UTC; the calendar shows them in each viewer&apos;s local timezone.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Day
          <select
            className={fieldClass}
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
          >
            {WEEKDAY_LABELS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Slot length
          <select
            className={fieldClass}
            value={slotDurationMinutes}
            onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
          >
            {[30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Start
          <span className="relative mt-1.5 block">
            <input
              type="time"
              required
              className={`${fieldClass} mt-0 pr-9`}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Clock
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
          </span>
        </label>
        <label className={labelClass}>
          End
          <span className="relative mt-1.5 block">
            <input
              type="time"
              required
              className={`${fieldClass} mt-0 pr-9`}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <Clock
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
          </span>
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Add availability'}
          </button>
        </div>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">
          Your templates
        </h3>
        {loading ? (
          <p className="mt-2 text-sm text-slate-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No weekly windows yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-slate-50 px-3 py-2.5"
              >
                <p className="text-sm text-slate-800">
                  {WEEKDAY_LABELS[row.day_of_week] ?? 'Day'}{' '}
                  {formatTimeDisplay(row.start_time)} -{' '}
                  {formatTimeDisplay(row.end_time)} -{' '}
                  {row.slot_duration_minutes} min
                </p>
                <button
                  type="button"
                  onClick={() => void onDelete(row.id)}
                  className="text-sm font-semibold text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
