import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import CefrLevelBadge from '../components/profile/CefrLevelBadge'

export default function StudyBadgesPage() {
  const { user } = useAuth()
  const student = user?.role === 'student' ? user : null
  const cefrLevel = student?.cefrLevel

  if (cefrLevel) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Badges</h2>
        <p className="mt-1 text-sm text-slate-500">
          Achievements unlocked from your learning journey.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-6">
          <p className="text-sm font-semibold text-slate-500">Placement rank</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CefrLevelBadge level={cefrLevel} size="lg" />
            <p className="text-sm text-slate-700">
              Earned from your Level Test
              {student?.placementCompletedAt
                ? ` · ${new Date(student.placementCompletedAt).toLocaleDateString()}`
                : ''}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:p-12">
      <h2 className="text-lg font-bold text-slate-900">No badges yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Take the Level Test to unlock your CEFR rank badge.
      </p>
      <Link
        to="/study/level-test"
        className="mt-6 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        Take Level Test
      </Link>
    </section>
  )
}
