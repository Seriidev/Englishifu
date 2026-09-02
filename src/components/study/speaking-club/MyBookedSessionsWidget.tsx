import { Link } from 'react-router-dom'
import { mockUpcomingBookings } from '../../../mocks/studyPlaceMock'

export default function MyBookedSessionsWidget() {
  const sessions = mockUpcomingBookings.filter((b) => b.type === 'speaking-club')

  return (
    <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">My booked sessions</h3>
        <Link
          to="/study/bookings"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-600"
        >
          View all
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="mt-4 text-xs text-slate-500">
          No speaking club bookings yet. Join a session below.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
            >
              <p className="text-[11px] font-bold tracking-wide text-orange-600 uppercase">
                {s.date} · {s.time}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 line-clamp-2">
                {s.title}
              </p>
              {s.subtitle ? (
                <p className="mt-0.5 text-xs text-slate-500">{s.subtitle}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
