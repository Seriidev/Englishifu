import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GraduationCap, LogOut, Pencil, Share2, Briefcase } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { isTutorProfileComplete } from '../../types/user'
import { getTutorProfileByHandle } from '../../mocks/tutorProfileMock'
import {
  getSessionUser,
  tutorProfilePath,
} from '../../utils/authStorage'
import { normalizeCertifications } from '../../utils/certifications'
import { fileToAvatarDataUrl } from '../../utils/avatarUpload'
import AvatarUpload from '../profile/AvatarUpload'
import VerifiedBadge from '../profile/VerifiedBadge'
import IncompleteProfileBanner from '../tutor/IncompleteProfileBanner'
import CertificationsTab from './CertificationsTab'
import ClassesTab from './ClassesTab'
import KPITab from './KPITab'
import TutorTabs, { type TutorTabId } from './TutorTabs'

function normalizeHandle(h: string) {
  return h.replace(/^@/, '').trim().toLowerCase()
}

export default function TutorProfilePage() {
  const { handle = '' } = useParams()
  const { user, logout, updateTutor } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<TutorTabId>('classes')
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const routeHandle = normalizeHandle(handle)
  const rawSession = user ?? getSessionUser()
  const sessionTutor = rawSession?.role === 'tutor' ? rawSession : null
  const stored = getTutorProfileByHandle(routeHandle)

  const isOwnProfile = Boolean(
    sessionTutor &&
      stored &&
      (sessionTutor.id === stored.id ||
        normalizeHandle(sessionTutor.handle) === routeHandle ||
        normalizeHandle(sessionTutor.handle) ===
          normalizeHandle(stored.handle)),
  )

  if (!stored) {
    return (
      <div className="landing-shell flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Tutor not found</h1>
        <p className="mt-2 text-muted">
          We couldn&apos;t find a profile for @{routeHandle}.
        </p>
        <Link
          to={sessionTutor ? tutorProfilePath(sessionTutor.handle) : '/'}
          className="mt-6 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          {sessionTutor ? 'Go to my profile' : 'Back home'}
        </Link>
      </div>
    )
  }

  const liveOwner = isOwnProfile ? sessionTutor : null
  const profile = stored

  const fullName = liveOwner?.fullName ?? profile.fullName
  const position = liveOwner?.position ?? profile.position ?? 'Teacher'
  const avatarUrl = liveOwner?.avatarUrl ?? profile.avatarUrl
  const aboutMe = liveOwner?.aboutMe ?? profile.aboutMe
  const yearsOfExperience = isOwnProfile
    ? liveOwner?.yearsOfExperience
    : profile.yearsOfExperience
  const isPublic = liveOwner?.isPublicProfile ?? profile.isPublicProfile ?? true
  const certifications = normalizeCertifications(
    liveOwner?.certifications ?? profile.certifications,
  )

  if (!isPublic && !isOwnProfile) {
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

  const showIncompleteBanner =
    isOwnProfile &&
    liveOwner &&
    (liveOwner.status === 'incomplete' || !isTutorProfileComplete(liveOwner))

  const onAvatarChange = async (file: File) => {
    if (!liveOwner) return
    setAvatarError(null)
    try {
      const nextAvatar = await fileToAvatarDataUrl(file)
      const result = await updateTutor({
        fullName: liveOwner.fullName,
        position: liveOwner.position ?? 'Teacher',
        aboutMe: liveOwner.aboutMe,
        avatarUrl: nextAvatar,
        isPublicProfile: liveOwner.isPublicProfile,
      })
      if (!result.ok) setAvatarError(result.error)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const togglePublic = () => {
    if (!liveOwner) return
    void updateTutor({
      fullName: liveOwner.fullName,
      position: liveOwner.position ?? 'Teacher',
      aboutMe: liveOwner.aboutMe,
      avatarUrl: liveOwner.avatarUrl,
      isPublicProfile: !liveOwner.isPublicProfile,
    })
  }

  const shareProfile = async () => {
    const slug = liveOwner?.handle ?? profile.handle
    const url = `${window.location.origin}${tutorProfilePath(slug)}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* ignore */
    }
  }

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
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/', { replace: true })
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
        {showIncompleteBanner ? <IncompleteProfileBanner /> : null}

        <section className="rounded-3xl border border-[#c7d7f5]/70 bg-white/90 p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                onAvatarChange={(file) => void onAvatarChange(file)}
                editable={isOwnProfile}
                displayName={fullName}
                size="lg"
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {fullName}
                  </h1>
                  <VerifiedBadge size="lg" />
                </div>
                <p className="mt-1.5 text-base font-semibold text-brand">
                  {position}
                </p>
                {typeof yearsOfExperience === 'number' ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                    <Briefcase className="h-4 w-4 text-muted" aria-hidden />
                    {yearsOfExperience}{' '}
                    {yearsOfExperience === 1 ? 'year' : 'years'} experience
                  </p>
                ) : isOwnProfile ? (
                  <p className="mt-2 text-sm text-muted">
                    Add your years of experience in{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/tutor/profile/edit')}
                      className="font-semibold text-brand hover:underline"
                    >
                      Edit Profile
                    </button>
                  </p>
                ) : null}
                {aboutMe ? (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/90 sm:text-[15px]">
                    {aboutMe}
                  </p>
                ) : isOwnProfile ? (
                  <p className="mt-3 text-sm text-muted">
                    Add a short summary about your teaching.{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/tutor/profile/edit')}
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
              {isOwnProfile ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/tutor/profile/edit')}
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
                        isPublic ? 'bg-brand' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition ${
                          isPublic ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </span>
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => void shareProfile()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-muted transition hover:bg-gray-50"
                aria-label="Copy profile link"
              >
                <Share2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <TutorTabs active={tab} onChange={setTab} />
            <div className="mt-5" role="tabpanel">
              {tab === 'classes' ? (
                <ClassesTab stats={profile.classesStats} />
              ) : null}
              {tab === 'kpi' ? (
                <KPITab kpis={profile.kpis} chart={profile.kpiChart} />
              ) : null}
              {tab === 'certifications' ? (
                <CertificationsTab certifications={certifications} />
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
