import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Users, Zap } from 'lucide-react'
import type { TutorStudent } from '../../types/tutorStudent'
import type { CefrLevel } from '../../types/cefr'
import { studentPublicProfilePath } from '../../utils/authStorage'
import { fetchTutorStudents } from '../../utils/adminApi'
import { syncApiSession } from '../../utils/bookingApi'
import { sendStudentBoost } from '../../utils/studentXp'
import { useAuth } from '../../auth/AuthContext'
import CefrLevelBadge from '../profile/CefrLevelBadge'

interface StudentsTabProps {
  tutorId: string
}

export default function StudentsTab({ tutorId }: StudentsTabProps) {
  const { user } = useAuth()
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [boostingId, setBoostingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (user) await syncApiSession(user)
      const rows = await fetchTutorStudents(tutorId)
      setStudents(
        rows.map((r) => ({
          id: r.id,
          fullName: r.fullName,
          avatarUrl: r.avatarUrl,
          handle: r.handle,
          cefrLevel: r.cefrLevel as CefrLevel | undefined,
          xp: r.xp ?? 0,
          canDailyBoost: Boolean(r.canDailyBoost),
          lessonsCompleted: r.lessonsCompleted,
          nextLessonDate: r.nextLessonDate,
          status: r.status,
        })),
      )
    } catch (err) {
      setStudents([])
      setError(err instanceof Error ? err.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [tutorId, user])

  useEffect(() => {
    void load()
  }, [load])

  const onBoost = async (student: TutorStudent) => {
    if (!user || !student.canDailyBoost) return
    setBoostingId(student.id)
    setError(null)
    try {
      await syncApiSession(user)
      await sendStudentBoost({ studentId: student.id, kind: 'daily' })
      setStudents((prev) =>
        prev.map((row) =>
          row.id === student.id
            ? {
                ...row,
                xp: row.xp + 30,
                canDailyBoost: false,
              }
            : row,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send boost')
      await load()
    } finally {
      setBoostingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (error && students.length === 0) {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {error}
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
        <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" aria-hidden />
        <p className="text-base font-semibold text-ink">No students yet</p>
        <p className="mt-1 text-sm text-muted">
          Students appear here after they book a lesson with you.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500">
        Send a daily boost (+30 XP) once per student per day. After each
        completed lesson they also get +30 XP automatically.
      </p>
      {error ? (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}
      {students.map((student, index) => (
        <div
          key={student.id}
          className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {index + 1}
            </span>
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                <User className="h-4 w-4" aria-hidden />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={studentPublicProfilePath(student.handle)}
                  className="truncate font-medium text-ink hover:text-brand"
                >
                  {student.fullName}
                </Link>
                {student.cefrLevel ? (
                  <CefrLevelBadge level={student.cefrLevel} size="sm" />
                ) : null}
              </div>
              <p className="text-xs text-slate-400">
                {student.lessonsCompleted} lessons · {student.xp} XP
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
            {student.nextLessonDate ? (
              <span className="text-xs text-slate-400">
                Next: {student.nextLessonDate}
              </span>
            ) : (
              <span className="text-xs text-slate-300">No upcoming lesson</span>
            )}
            <button
              type="button"
              disabled={!student.canDailyBoost || boostingId === student.id}
              onClick={() => void onBoost(student)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed ${
                student.canDailyBoost
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
              title={
                student.canDailyBoost
                  ? 'Send a daily +30 XP boost'
                  : 'Already boosted today — you can boost again tomorrow'
              }
            >
              <Zap
                className={`h-3.5 w-3.5 ${student.canDailyBoost ? 'fill-current' : ''}`}
                aria-hidden
              />
              {boostingId === student.id
                ? 'Sending…'
                : student.canDailyBoost
                  ? 'Boost +30'
                  : 'Boosted today'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
