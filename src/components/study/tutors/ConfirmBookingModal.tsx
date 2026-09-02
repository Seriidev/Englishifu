import { useState } from 'react'
import type { AvailableSlot } from '../../../types/booking'
import { BOOKING_SUBJECTS } from '../../../types/booking'
import {
  createBooking,
  formatDateTimeRange,
} from '../../../utils/bookingApi'

interface ConfirmBookingModalProps {
  open: boolean
  tutorName: string
  tutorId: string
  slot: AvailableSlot | null
  onClose: () => void
  onBooked: () => void
  onConflict: () => void
}

export default function ConfirmBookingModal({
  open,
  tutorName,
  tutorId,
  slot,
  onClose,
  onBooked,
  onConflict,
}: ConfirmBookingModalProps) {
  const [subject, setSubject] = useState<string>(BOOKING_SUBJECTS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open || !slot) return null

  const onConfirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await createBooking({
        tutorId,
        startAt: slot.startAt,
        endAt: slot.endAt,
        subject,
      })
      onBooked()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create booking'
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : ''
      if (code === 'CONFLICT') {
        setError(message)
        onConflict()
      } else {
        setError(message)
      }
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
        <h3 className="text-lg font-bold text-slate-900">Confirm booking</h3>
        <p className="mt-1 text-sm text-slate-500">
          Lesson with <span className="font-semibold text-slate-800">{tutorName}</span>
        </p>
        <p className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600">
          {formatDateTimeRange(slot.startAt, slot.endAt)}
        </p>

        <label className="mt-4 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Subject
          <select
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {BOOKING_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : null}

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
            onClick={() => void onConfirm()}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
          >
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
