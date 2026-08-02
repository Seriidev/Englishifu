import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  LogOut,
  Pencil,
  Share2,
  Star,
  Flame,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { mockStudentGamification } from '../../mocks/studentDashboardMock'
import {
  mockStudentLearningStats,
  mockStudentProfileTabCounts,
} from '../../mocks/studentProfileMock'
import type { PublicStudent } from '../../types/user'
import {
  findStudentByHandle,
  studentPublicProfilePath,
} from '../../utils/authStorage'
import { fileToAvatarDataUrl } from '../../utils/avatarUpload'
import AvatarUpload from './AvatarUpload'
import ProfileTabs, { type ProfileTabId } from './ProfileTabs'
import StatCard from './StatCard'
import VerifiedBadge from './VerifiedBadge'

export default function StudentProfilePage() {
  const { handle = '' } = useParams()
  const { user, logout, updateStudent } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ProfileTabId>('learning')
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const stored = findStudentByHandle(handle) as PublicStudent | null
  const profile =
    user?.role === 'student' &&
    user.handle.toLowerCase() === handle.replace(/^@/, '').toLowerCase()
      ? user
      : stored

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
  const counts = mockStudentProfileTabCounts(profile.id)
  const displayName = profile.fullName

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

  const togglePublic = () => {
    if (!isOwner || !user || user.role !== 'student') return
    void updateStudent({
      fullName: user.fullName,
      handle: user.handle,
      city: user.city,
      headline: user.headline,
      summary: user.summary,
      avatarUrl: user.avatarUrl,
      isPublicProfile: !user.isPublicProfile,
    })
  }

  const shareProfile = async () => {
    const url = `${window.location.origin}${studentPublicProfilePath(profile.handle)}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* ignore */
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
                <p className="text-sm font-semibold text-brand">
                  @{live.handle}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {live.fullName}
                  </h1>
                  <VerifiedBadge size="lg" />
                </div>
                <p className="mt-1.5 text-sm text-muted">
                  {[live.headline, live.city].filter(Boolean).join(' · ') ||
                    'Student on Englishifu'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-ink">
                    <Star className="h-3.5 w-3.5 text-brand" aria-hidden />
                    Level {gamification.level}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-ink">
                    <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden />
                    Streak {gamification.weeklyStreak}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-muted">
                    CEFR {gamification.cefrLevel}
                  </div>
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
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/profile/edit')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={togglePublic}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-muted"
                    title="Toggle public profile"
                  >
                    Public
                    <span
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                        live.isPublicProfile ? 'bg-brand' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition ${
                          live.isPublicProfile
                            ? 'translate-x-4'
                            : 'translate-x-1'
                        }`}
                      />
                    </span>
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => void shareProfile()}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-muted transition hover:bg-gray-50"
                aria-label="Copy profile link"
              >
                <Share2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <ProfileTabs
              active={tab}
              onChange={setTab}
              badgesLabel={`(${counts.badgesEarned}/${counts.badgesTotal})`}
              certificationsCount={counts.certifications}
              certificatesCount={counts.certificatesOfCompletion}
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

              {tab === 'badges' ? (
                <EmptyTab
                  title="No badges yet"
                  body="Earn badges by keeping streaks and finishing lessons."
                />
              ) : null}

              {tab === 'certifications' ? (
                <EmptyTab
                  title="No certifications yet"
                  body="Course certifications will show up here when available."
                />
              ) : null}

              {tab === 'certificates' ? (
                <EmptyTab
                  title="No certificates of completion"
                  body="Finish a TOEFL Full Test to earn a certificate of completion."
                />
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function EmptyTab({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  )
}
