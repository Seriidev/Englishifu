import { Link } from 'react-router-dom'
import { User, Users, Video } from 'lucide-react'
import type { TutorStudent } from '../../types/tutorStudent'
import { studentPublicProfilePath } from '../../utils/authStorage'
import CefrLevelBadge from '../profile/CefrLevelBadge'

interface StudentsTabProps {
  students: TutorStudent[]
  onSendMeetLink: (student: TutorStudent) => void
  canManage: boolean
}

export default function StudentsTab({
  students,
  onSendMeetLink,
  canManage,
}: StudentsTabProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
        <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" aria-hidden />
        <p className="text-base font-semibold text-ink">No students yet</p>
        <p className="mt-1 text-sm text-muted">
          Students you teach will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
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
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    student.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {student.lessonsCompleted} lessons completed
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
            {canManage ? (
              <button
                type="button"
                onClick={() => onSendMeetLink(student)}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-600"
              >
                <Video className="h-3 w-3" aria-hidden />
                Send Meet Link
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
