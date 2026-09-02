import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { studentPublicProfilePath } from '../../utils/authStorage'
import { firstNameFromFullName } from '../../utils/name'
import {
  mockCurrentCourse,
  mockStudentGamification,
} from '../../mocks/studentDashboardMock'
import CourseStructureList from './CourseStructureList'
import CurrentCourseCard from './CurrentCourseCard'
import GamificationSidebar from './GamificationSidebar'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.fullName
    ? firstNameFromFullName(user.fullName)
    : 'Student'
  const gamification = mockStudentGamification(user?.id ?? 'demo')
  const course = mockCurrentCourse

  const continueHref =
    course.sections.find((s) => s.status === 'in-progress')?.type === 'speaking'
      ? '/speaking'
      : '/toefl'

  return (
    <div className="landing-shell min-h-svh">
      <header className="border-b border-[#c7d7f5]/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-bold text-ink">Englishcore</span>
          </Link>
          <div className="flex items-center gap-2">
            {user?.role === 'student' && user.handle ? (
              <Link
                to={studentPublicProfilePath(user.handle)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50"
              >
                <UserRound className="h-4 w-4" aria-hidden />
                Profile
              </Link>
            ) : null}
            <Link
              to="/placement"
              className="hidden rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 sm:inline-flex"
            >
              Placement Test
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <p className="text-xs font-bold tracking-wide text-brand uppercase">
            Student dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            Welcome, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Keep your streak alive — continue where you left off.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.9fr]">
          <section className="space-y-4">
            <CurrentCourseCard
              course={course}
              onContinue={() => navigate(continueHref)}
            />
            <CourseStructureList sections={course.sections} />

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/toefl"
                className="inline-flex rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-gray-50"
              >
                See Full Course
              </Link>
              <button
                type="button"
                onClick={() => navigate(continueHref)}
                className="inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark"
              >
                Continue Learning →
              </button>
            </div>
          </section>

          <GamificationSidebar
            firstName={firstName}
            gamification={gamification}
          />
        </div>
      </main>
    </div>
  )
}
