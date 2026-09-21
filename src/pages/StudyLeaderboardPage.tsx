import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { studentPublicProfilePath } from '../utils/authStorage'
import {
  fetchStudentLeaderboard,
  subscribeStudentXp,
} from '../utils/studentXp'
import { pollWhenVisible } from '../utils/pollWhenVisible'
import { isCefrLevel } from '../types/cefr'
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
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchStudentLeaderboard()
      setRows(data.entries)
      setTotal(data.total)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const studentId = user?.role === 'student' ? user.id : undefined
    const unsubscribe = subscribeStudentXp(() => {
      void load()
    }, studentId)
    const stopPoll = pollWhenVisible(() => {
      void load()
    }, 60_000)
    return () => {
      unsubscribe()
      stopPoll()
    }
  }, [load, user])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Leaderboard
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {total > 0
            ? `Real students ranked by XP · ${total} ${total === 1 ? 'student' : 'students'}`
            : 'See how you rank among other students.'}
        </p>
      </div>

      {loading && rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
          Loading students…
        </div>
      ) : error && rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
          No students yet. Rankings appear as soon as people sign up.
        </div>
      ) : (
        <ol className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {rows.map((entry, index) => {
            const previous = index > 0 ? rows[index - 1] : undefined
            const jumpedAhead =
              previous != null && entry.rank > previous.rank + 1
            const profilePath =
              entry.handle && !entry.isCurrentUser
                ? studentPublicProfilePath(entry.handle)
                : entry.isCurrentUser && user?.role === 'student'
                  ? studentPublicProfilePath(user.handle)
                  : null
            const initial = entry.fullName.charAt(0).toUpperCase()
            const cefrLevel = isCefrLevel(entry.cefrLevel)
              ? entry.cefrLevel
              : undefined

            return (
              <li
                key={entry.id}
                className={`flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                  entry.isCurrentUser
                    ? 'bg-indigo-100 dark:bg-indigo-500/35 dark:ring-1 dark:ring-inset dark:ring-indigo-400/50'
                    : ''
                } ${jumpedAhead ? 'border-t-4 border-t-slate-100' : ''}`}
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
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/40 dark:text-indigo-200">
                    {initial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {entry.fullName}
                    {entry.isCurrentUser ? (
                      <span className="ml-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
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
                {cefrLevel ? (
                  <CefrLevelBadge level={cefrLevel} size="sm" />
                ) : null}
                <p className="shrink-0 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                  {entry.xp.toLocaleString()} XP
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
