import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { Crown, Star, Trophy, Zap } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { studentPublicProfilePath } from '../utils/authStorage'
import {
  fetchStudentLeaderboard,
  fetchStudentXpStats,
  subscribeStudentXp,
  type StudentXpStats,
} from '../utils/studentXp'
import { pollWhenVisible } from '../utils/pollWhenVisible'
import { CEFR_BADGE_STYLES, isCefrLevel, type CefrLevel } from '../types/cefr'
import type { LeaderboardEntry } from '../types/studyContent'

const PERIODS = [
  { id: 'all', label: 'All students' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
] as const

type Period = (typeof PERIODS)[number]['id']

function crownClass(rank: number) {
  if (rank === 1) return 'text-amber-400'
  if (rank === 2) return 'text-slate-400'
  if (rank === 3) return 'text-orange-400'
  return 'text-slate-400'
}

function Avatar({
  name,
  url,
  size,
}: {
  name: string
  url?: string
  size: string
}) {
  const initial = name.charAt(0).toUpperCase() || 'S'
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    )
  }
  return (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-700`}
    >
      {initial}
    </span>
  )
}

function CefrHex({ level }: { level: CefrLevel }) {
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center text-[10px] font-bold text-white ${CEFR_BADGE_STYLES[level].bg}`}
      style={{
        clipPath:
          'polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
      }}
      title={level}
    >
      {level}
    </span>
  )
}

export default function StudyLeaderboardPage() {
  const { user } = useAuth()
  const student = user?.role === 'student' ? user : null
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('all')
  const [stats, setStats] = useState<StudentXpStats | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchStudentLeaderboard()
      setRows(data.entries)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const studentId = student?.id
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
  }, [load, student?.id])

  useEffect(() => {
    if (!student) return
    let cancelled = false
    void fetchStudentXpStats()
      .then((next) => {
        if (!cancelled) setStats(next)
      })
      .catch(() => {
        if (!cancelled) setStats(null)
      })
    return () => {
      cancelled = true
    }
  }, [student, rows])

  const me = rows.find((entry) => entry.isCurrentUser)
  const meXp = stats?.xp ?? me?.xp ?? student?.xp ?? 0
  const meName = me?.fullName || student?.fullName || 'Student'
  const meHandle = me?.handle || student?.handle
  const meAvatar = me?.avatarUrl || student?.avatarUrl

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
              <Trophy className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Leaderboard
              </h2>
              <p className="text-sm text-slate-500">
                Real students. Real progress. Compete, learn, grow.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  period === item.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading && rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-10 text-center text-sm text-slate-500">
            Loading students…
          </div>
        ) : error && rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-10 text-center text-sm text-slate-500">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No students yet. Rankings appear as soon as people sign up.
          </div>
        ) : (
          <ol className="space-y-2">
            {rows.map((entry) => {
              const profilePath = entry.handle
                ? studentPublicProfilePath(entry.handle)
                : null
              const cefr = isCefrLevel(entry.cefrLevel)
                ? entry.cefrLevel
                : undefined
              const highlighted = entry.rank === 1 || entry.isCurrentUser
              return (
                <li
                  key={entry.id}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 sm:px-4 ${
                    highlighted
                      ? 'border-indigo-400/40 bg-indigo-500/15'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <span className="flex w-8 shrink-0 justify-center">
                    {entry.rank <= 3 ? (
                      <Crown
                        className={`h-5 w-5 ${crownClass(entry.rank)}`}
                        aria-label={`Rank ${entry.rank}`}
                      />
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">
                        {entry.rank}
                      </span>
                    )}
                  </span>
                  <Avatar
                    name={entry.fullName}
                    url={entry.avatarUrl}
                    size="h-10 w-10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {entry.fullName}
                      {entry.isCurrentUser ? (
                        <span className="ml-2 text-xs font-semibold text-indigo-300">
                          You
                        </span>
                      ) : null}
                    </p>
                    {profilePath ? (
                      <Link
                        to={profilePath}
                        className="text-xs text-slate-400 hover:text-indigo-300"
                      >
                        @{entry.handle}
                      </Link>
                    ) : (
                      <p className="text-xs text-slate-400">Student</p>
                    )}
                  </div>
                  <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-slate-900 sm:inline-flex">
                    <Star
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                    {entry.xp.toLocaleString()} XP
                  </span>
                  {cefr ? <CefrHex level={cefr} /> : null}
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {student ? (
        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="relative h-28 bg-gradient-to-br from-indigo-600 via-slate-800 to-slate-950">
            {meAvatar ? (
              <img
                src={meAvatar}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center">
              <Avatar name={meName} url={meAvatar} size="h-16 w-16 ring-4 ring-[#1e293b]" />
            </div>
          </div>
          <div className="px-4 pt-12 pb-5 text-center">
            <p className="text-base font-bold text-slate-900">{meName}</p>
            {meHandle ? (
              <p className="text-sm text-slate-400">@{meHandle}</p>
            ) : null}
            <div className="mt-4 grid grid-cols-3 gap-2 text-left">
              <div className="rounded-xl bg-slate-100 px-2 py-2">
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  XP
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {meXp.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 px-2 py-2">
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  Daily
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {stats?.dailyBonusClaimedToday ? '+5' : '0'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 px-2 py-2">
                <p className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  <Zap className="h-3 w-3" aria-hidden />
                  Boost
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {stats?.boostCount ?? 0}
                </p>
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </section>
  )
}
