import { Link, useParams } from 'react-router-dom'
import { GraduationCap, LogOut } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { isTutorProfileComplete } from '../../types/user'
import { getTutorProfileByHandle } from '../../mocks/tutorProfileMock'
import IncompleteProfileBanner from '../tutor/IncompleteProfileBanner'
import SpecializationCard from './SpecializationCard'
import TeachingActivityHeatmap from './TeachingActivityHeatmap'
import TutorSidebar from './TutorSidebar'

export default function TutorProfilePage() {
  const { handle = '' } = useParams()
  const { user, logout } = useAuth()
  const profile = getTutorProfileByHandle(handle)

  if (!profile) {
    return (
      <div className="landing-shell flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Tutor not found</h1>
        <p className="mt-2 text-muted">
          We couldn&apos;t find a profile for @{handle.replace(/^@/, '')}.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back home
        </Link>
      </div>
    )
  }

  const isOwner =
    user?.role === 'tutor' &&
    user.handle.toLowerCase() === profile.handle.toLowerCase()

  const showIncompleteBanner =
    isOwner &&
    user.role === 'tutor' &&
    (user.status === 'incomplete' || !isTutorProfileComplete(user))

  return (
    <div className="landing-shell min-h-svh">
      <header className="border-b border-[#c7d7f5]/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-bold text-ink">Englishifu</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50"
            >
              Back home
            </Link>
            {isOwner ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Log out
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {showIncompleteBanner ? <IncompleteProfileBanner /> : null}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
          <TutorSidebar profile={profile} isOwner={isOwner} />

          <div className="min-w-0 space-y-6">
            <section>
              <h2 className="text-base font-bold text-ink">
                Featured Specializations
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Courses and focus areas students book most often
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {profile.specializations.map((spec) => (
                  <SpecializationCard key={spec.id} specialization={spec} />
                ))}
              </div>
            </section>

            <TeachingActivityHeatmap data={profile.teachingActivity} />
          </div>
        </div>
      </main>
    </div>
  )
}
