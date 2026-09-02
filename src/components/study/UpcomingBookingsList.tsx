import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreVertical, Users } from 'lucide-react'
import type { BookingItem } from '../../types/studyPlace'

interface UpcomingBookingsListProps {
  bookings: BookingItem[]
}

function BookingMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label="Booking options"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Reschedule
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function UpcomingBookingsList({
  bookings,
}: UpcomingBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">
          <span aria-hidden>📅 </span>Upcoming Bookings
        </h2>
        <div className="mt-6 flex flex-col items-center py-6 text-center">
          <p className="text-sm text-slate-500">No upcoming sessions yet</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              to="/study/tutors"
              className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
            >
              Browse Tutors
            </Link>
            <Link
              to="/study/speaking-club"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Join a Speaking Club
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">
          <span aria-hidden>📅 </span>Upcoming Bookings
        </h2>
        <Link
          to="/study/bookings"
          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-600"
        >
          View all bookings →
        </Link>
      </div>

      <ol className="relative space-y-0">
        {bookings.map((booking, index) => {
          const isClub = booking.type === 'speaking-club'
          const markerColor = isClub ? 'bg-orange-500' : 'bg-indigo-500'
          const lineColor = isClub ? 'bg-orange-200' : 'bg-indigo-200'
          const showDetails =
            typeof booking.daysUntil === 'number' && booking.daysUntil > 1
          const actionClass = isClub
            ? showDetails
              ? 'border border-orange-200 bg-white text-orange-700 hover:bg-orange-50'
              : 'bg-orange-500 text-white hover:bg-orange-600'
            : showDetails
              ? 'border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'

          return (
            <li key={booking.id} className="relative flex gap-4 pb-6 last:pb-0">
              <div className="flex w-20 shrink-0 flex-col items-start pt-1 sm:w-24">
                <p className="text-[11px] font-bold tracking-wide text-slate-800 uppercase">
                  {booking.date}
                </p>
                <p className="text-xs text-slate-400">{booking.dateSubtext}</p>
              </div>

              <div className="relative flex w-4 shrink-0 flex-col items-center">
                <span
                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${markerColor} ring-4 ring-white`}
                />
                {index < bookings.length - 1 ? (
                  <span
                    className={`absolute top-5 bottom-0 w-0.5 ${lineColor}`}
                  />
                ) : null}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  {booking.avatarUrl ? (
                    <img
                      src={booking.avatarUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-400">
                      <Users className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {booking.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {booking.time}
                      {booking.subtitle ? ` · ${booking.subtitle}` : ''}
                    </p>
                    {booking.spotsInfo ? (
                      <p className="mt-1 text-xs font-medium text-orange-600">
                        {booking.spotsInfo}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${actionClass}`}
                  >
                    {showDetails
                      ? booking.daysUntil
                        ? `In ${booking.daysUntil} days`
                        : 'Details'
                      : 'Join'}
                  </button>
                  <BookingMenu />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
