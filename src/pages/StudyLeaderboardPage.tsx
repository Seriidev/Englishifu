import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { studentPublicProfilePath } from '../utils/authStorage'
import { mockLeaderboard } from '../mocks/studyContentMock'
import { fetchStudentXpStats } from '../utils/studentXp'
import CefrLevelBadge from '../components/profile/CefrLevelBadge'
import type { LeaderboardEntry } from '../types/studyContent'

function rankTone(rank: number) {
  if (rank === 1) return 'bg-amber-100 text-amber-700'
  if (rank === 2) return 'bg-slate-200 text-slate-700'
  if (rank === 3) return 'bg-orange-100 text-orange-700'
  return 'bg-slate-100 text-slate-500'
}

export default function StudyLeaderboardPage() {
  const { user } = useAuth()
  const [ownXp, setOwnXp] = useState(
    () => (user?.role === 'student' ? user.xp ?? 0 : 0),
  )

  useEffect(() => {
    if (user?.role !== 'student') return
    let cancelled = false
    void fetchStudentXpStats()
      .then((stats) => {
        if (!cancelled) setOwnXp(stats.xp)
      })
      .catch(() => {
        if (!cancelled) setOwnXp(user.xp ?? 0)
      })
    const interval = window.setInterval(() => {
      void fetchStudentXpStats()
        .then((stats) => {
          if (!cancelled) setOwnXp(stats.xp)
        })
        .catch(() => {
          /* keep last */
        })
    }, 4000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [user])

  const rows: LeaderboardEntry[] = mockLeaderboard.map((entry) => {
    if (!entry.isCurrentUser) return entry
    return {
      ...entry,
      fullName: user?.fullName?.trim() || 'You',
      handle: user?.role === 'student' ? user.handle : entry.handle,
      avatarUrl: user?.avatarUrl ?? entry.avatarUrl,
      xp: user?.role === 'student' ? ownXp : entry.xp,
      cefrLevel:
        user?.role === 'student' ? user.cefrLevel ?? entry.cefrLevel : entry.cefrLevel,
    }
  })

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Leaderboard
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          See how you rank among other students this month.
        </p>
      </div>

      <ol className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {rows.map((entry) => {
          const profilePath =
            entry.handle && !entry.isCurrentUser
              ? studentPublicProfilePath(entry.handle)
              : entry.isCurrentUser && user?.role === 'student'
                ? studentPublicProfilePath(user.handle)
                : null
          const initial = entry.fullName.charAt(0).toUpperCase()

          return (
            <li
              key={entry.id}
              className={`flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                entry.isCurrentUser ? 'bg-indigo-100' : ''
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankTone(entry.rank)}`}
              >
                {entry.rank}
              </span>
              {entry.avatarUrl ? (
                <img
                  src={entry.avatarUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                  {initial}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {entry.fullName}
                  {entry.isCurrentUser ? (
                    <span className="ml-2 text-xs font-medium text-indigo-600">
                      You
                    </span>
                  ) : null}
                </p>
                {profilePath ? (
                  <Link
                    to={profilePath}
                    className="text-xs text-slate-400 hover:text-indigo-600"
                  >
                    @{entry.handle}
                  </Link>
                ) : (
                  <p className="text-xs text-slate-400">Student</p>
                )}
              </div>
              {entry.cefrLevel ? (
                <CefrLevelBadge level={entry.cefrLevel} size="sm" />
              ) : null}
              <p className="shrink-0 text-sm font-semibold text-indigo-600">
                {entry.xp.toLocaleString()} XP
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
