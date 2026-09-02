import { useEffect, useMemo, useState } from 'react'
import type { AvailableSlot } from '../../../types/booking'
import {
  fetchAvailableSlots,
  formatDateLabel,
  formatTimeLabel,
  groupSlotsByDate,
} from '../../../utils/bookingApi'

interface BookingCalendarProps {
  tutorHandle: string
  onSlotSelected: (slot: AvailableSlot, tutorId: string) => void
  refreshKey?: number
}

export default function BookingCalendar({
  tutorHandle,
  onSlotSelected,
  refreshKey = 0,
}: BookingCalendarProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [tutorId, setTutorId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchAvailableSlots(tutorHandle, 14)
      .then((data) => {
        if (cancelled) return
        setTutorId(data.tutorId)
        setSlots(data.slots)
        const byDate = groupSlotsByDate(data.slots)
        const dates = Object.keys(byDate).sort()
        setSelectedDate((prev) =>
          prev && byDate[prev] ? prev : dates[0] ?? '',
        )
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setSlots([])
        setTutorId(null)
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load available slots',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tutorHandle, refreshKey])

  const slotsByDate = useMemo(() => groupSlotsByDate(slots), [slots])
  const datesWithSlots = useMemo(
    () => Object.keys(slotsByDate).sort(),
    [slotsByDate],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
          aria-hidden
        />
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {error}
        {error.toLowerCase().includes('not found')
          ? ' Ask the tutor to sign in and set their weekly availability.'
          : ''}
      </p>
    )
  }

  if (datesWithSlots.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No available slots in the next 14 days.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {datesWithSlots.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => setSelectedDate(date)}
            className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap transition ${
              date === selectedDate
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {formatDateLabel(date)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {(slotsByDate[selectedDate] || []).map((slot) => (
          <button
            key={slot.startAt}
            type="button"
            onClick={() => {
              if (tutorId) onSlotSelected(slot, tutorId)
            }}
            className="rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-800 transition hover:border-indigo-500 hover:bg-indigo-50"
          >
            {formatTimeLabel(slot.startAt)}
          </button>
        ))}
      </div>
    </div>
  )
}
