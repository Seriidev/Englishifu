import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  LogOut,
  Pencil,
  Flame,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { mockStudentGamification } from '../../mocks/studentDashboardMock'
import {
  mockStudentLearningStats,
} from '../../mocks/studentProfileMock'
import type { PublicStudent } from '../../types/user'
import {
  findStudentByHandle,
  studentPublicProfilePath,
} from '../../utils/authStorage'
import { fileToAvatarDataUrl } from '../../utils/avatarUpload'
import AccountPanel from './AccountPanel'
import AvatarUpload from './AvatarUpload'
import CefrLevelBadge from './CefrLevelBadge'
import ProfileTabs, { type ProfileTabId } from './ProfileTabs'
import StatCard from './StatCard'

export default function StudentProfilePage() {
  const { handle = '' } = useParams()
  const { user, logout, updateStudent, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ProfileTabId>('learning')
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [stored, setStored] = useState<PublicStudent | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const routeHandle = handle.replace(/^@/, '').trim().toLowerCase()
  const isOwnRoute =
    user?.role === 'student' && user.handle.toLowerCase() === routeHandle

  useEffect(() => {
    if (isOwnRoute) {
      setStored(null)
      setProfileLoading(false)
      return
    }
    let cancelled = false
    setProfileLoading(true)
    void findStudentByHandle(routeHandle).then((found) => {
      if (cancelled) return
      setStored(found?.role === 'student' ? found : null)
      setProfileLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [routeHandle, isOwnRoute])

  const profile: PublicStudent | null = isOwnRoute
    ? (user as PublicStudent)
    : stored

  if (authLoading || profileLoading) {
    return (
      <div className="landing-shell flex min-h-svh items-center justify-center text-sm text-muted">
        Loading…
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="landing-shell flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Profile not found</h1>
        <p className="mt-2 text-muted">
          We couldn&apos;t find a student for @{handle.replace(/^@/, '')}.
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
    user?.role === 'student' &&
    user.handle.toLowerCase() === profile.handle.toLowerCase()

  if (!profile.isPublicProfile && !isOwner) {
    return (
      <div className="landing-shell flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-ink">This profile is private</h1>
        <p className="mt-2 text-muted">
          The owner has turned off public visibility.
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

  const gamification = mockStudentGamification(profile.id)
  const stats = mockStudentLearningStats(profile.id)
  const displayName = profile.fullName
  const cefrLevel = profile.cefrLevel
  const needsPlacement = isOwner && !cefrLevel

  const onAvatarChange = async (file: File) => {
    if (!isOwner || !user || user.role !== 'student') return
    setAvatarError(null)
    try {
      const avatarUrl = await fileToAvatarDataUrl(file)
      const result = await updateStudent({
        fullName: user.fullName,
        handle: user.handle,
        city: user.city,
        headline: user.headline,
        summary: user.summary,
        avatarUrl,
        isPublicProfile: user.isPublicProfile,
      })
      if (!result.ok) setAvatarError(result.error)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const live = profile

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
            <Link
              to="/"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50"
            >
              Back home
            </Link>
            {isOwner ? (
              <button
                type="button"
                onClick={() => {
                  void logout().then(() => navigate('/', { replace: true }))
                }}
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
        {needsPlacement ? (
          <div className="mb-6 overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-r from-brand-light/80 to-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
                  <ClipboardList className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-base font-bold text-ink">
                    Take your Placement Test
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    Get your CEFR rank badge (A1–C2) — about 5 minutes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate('/placement', {
                    state: {
                      returnTo: studentPublicProfilePath(live.handle),
                    },
                  })
                }
                className="shrink-0 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Start Placement Test
              </button>
            </div>
          </div>
        ) : null}

        <section className="rounded-3xl border border-[#c7d7f5]/70 bg-white/90 p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
              <AvatarUpload
                currentAvatarUrl={live.avatarUrl}
                onAvatarChange={(file) => void onAvatarChange(file)}
                editable={isOwner}
                displayName={displayName}
                size="lg"
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {live.fullName}
                  </h1>
                  {cefrLevel ? (
                    <CefrLevelBadge level={cefrLevel} size="lg" />
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm font-semibold text-brand">
                  @{live.handle}
                </p>
                {isOwner ? (
                  <p className="mt-1 text-sm text-muted">{live.email}</p>
                ) : null}
                <p className="mt-1.5 text-sm text-muted">
                  {live.city || 'Student on Englishcore'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-ink">
                    <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden />
                    Streak {gamification.weeklyStreak}
                  </div>
                  {!cefrLevel && isOwner ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/placement', {
                          state: {
                            returnTo: studentPublicProfilePath(live.handle),
                          },
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand/40 bg-brand-light/50 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-light"
                    >
                      No rank yet — take Placement
                    </button>
                  ) : null}
                  {!cefrLevel && !isOwner ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-muted">
                      CEFR not set
                    </div>
                  ) : null}
                </div>
                {live.summary ? (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/90 sm:text-[15px]">
                    {live.summary}
                  </p>
                ) : isOwner ? (
                  <p className="mt-3 text-sm text-muted">
                    Add a short summary so others know what you&apos;re working
                    on.{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/profile/edit')}
                      className="font-semibold text-brand hover:underline"
                    >
                      Edit Profile
                    </button>
                  </p>
                ) : null}
                {avatarError ? (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {avatarError}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => navigate('/profile/edit')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit Profile
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-8">
            <ProfileTabs
              active={tab}
              onChange={setTab}
              showAccount={isOwner}
            />

            <div className="mt-5" role="tabpanel">
              {tab === 'learning' ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon={BookOpen}
                    value={stats.learningHours}
                    label="Learning Hours"
                  />
                  <StatCard
                    icon={Pencil}
                    value={stats.coursesCompleted}
                    label="Courses Completed"
                  />
                  <StatCard
                    icon={FlaskConical}
                    value={stats.practiceCompleted}
                    label="Practice Completed"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    value={stats.testsCompleted}
                    label="Tests Completed"
                  />
                </div>
              ) : null}
              {tab === 'account' && isOwner ? (
                <AccountPanel user={live} />
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

