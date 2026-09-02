import { Link } from 'react-router-dom'
import type { SpeakingClubSession } from '../../../types/speakingClubSession'

interface DashboardSpeakingClubsProps {
  sessions: SpeakingClubSession[]
}

export default function DashboardSpeakingClubs({
  sessions,
}: DashboardSpeakingClubsProps) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">
          Speaking clubs
        </h2>
        <Link
          to="/study/speaking-club"
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          See all
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
          >
            {session.hostAvatarUrl ? (
              <img
                src={session.hostAvatarUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                {session.hostName.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {session.hostName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {session.dateSubtext} / {session.time}
              </p>
              <p className="truncate text-xs text-slate-400">
                {session.topicTags[0] ?? session.title}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Link
                to="/study/speaking-club"
                className="inline-flex rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-600"
              >
                Booking
              </Link>
              <p className="text-[11px] font-medium text-slate-400">
                {session.spotsTotal} / {session.spotsFilled}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
