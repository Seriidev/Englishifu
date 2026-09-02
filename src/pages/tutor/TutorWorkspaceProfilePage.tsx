import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import AccountPanel from '../../components/profile/AccountPanel'
import AvatarUpload from '../../components/profile/AvatarUpload'
import VerifiedBadge from '../../components/profile/VerifiedBadge'
import { StatusBadge } from '../../components/shared/StatusBadge'
import AvailabilitySettings from '../../components/tutor-profile/AvailabilitySettings'
import SendResumeButton from '../../components/tutor/SendResumeButton'
import CertificationUploadInput from '../../components/tutor/CertificationUploadInput'
import ReferralWidget from '../../components/study/ReferralWidget'
import { useOwnTutorProfile } from '../../hooks/useOwnTutorProfile'
import { TUTOR_POSITIONS, type TutorPosition } from '../../types/tutorProfile'
import { fileToAvatarDataUrl } from '../../utils/avatarUpload'
import { normalizeCertifications } from '../../utils/certifications'
import { fetchTutorReviews } from '../../utils/platformApi'
import {
  canSendTutorResume,
  validateTutorEditProfileForm,
  type TutorEditProfileFormData,
} from '../../utils/validation'

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15'

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-800'

function RequiredMark() {
  return <span className="text-red-500">*</span>
}

export default function TutorWorkspaceProfilePage() {
  const { user, updateTutor, refreshUser } = useAuth()
  const { tutor, profile } = useOwnTutorProfile()
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avgRating, setAvgRating] = useState(profile?.averageRating ?? 0)
  const [totalReviews, setTotalReviews] = useState(profile?.reviewsCount ?? 0)

  const initial = useMemo<TutorEditProfileFormData>(() => {
    if (!user || user.role !== 'tutor') {
      return {
        fullName: '',
        handle: '',
        position: 'Teacher',
        yearsOfExperience: '',
        hourlyRateUsd: '',
        certifications: [],
      }
    }
    return {
      fullName: user.fullName,
      handle: user.handle,
      position: user.position,
      yearsOfExperience:
        user.yearsOfExperience !== undefined ? user.yearsOfExperience : '',
      hourlyRateUsd:
        user.hourlyRateUsd !== undefined ? user.hourlyRateUsd : '',
      aboutMe: user.aboutMe ?? '',
      certifications: normalizeCertifications(user.certifications),
    }
  }, [user])

  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(initial)
  }, [initial])

  useEffect(() => {
    setAvgRating(profile?.averageRating ?? 0)
    setTotalReviews(profile?.reviewsCount ?? 0)
  }, [profile?.averageRating, profile?.reviewsCount])

  useEffect(() => {
    if (!tutor?.handle) return
    let cancelled = false
    void fetchTutorReviews(tutor.handle)
      .then((data) => {
        if (cancelled) return
        setAvgRating(data.averageRating)
        setTotalReviews(data.totalReviews)
      })
      .catch(() => {
        /* keep mock fallback */
      })
    return () => {
      cancelled = true
    }
  }, [tutor?.handle])

  if (!tutor || !user || user.role !== 'tutor') {
    return <p className="text-sm text-slate-500">Loading…</p>
  }

  const setField = <K extends keyof TutorEditProfileFormData>(
    key: K,
    value: TutorEditProfileFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const years =
    typeof form.yearsOfExperience === 'number' ? form.yearsOfExperience : null
  const rate =
    typeof form.hourlyRateUsd === 'number' ? form.hourlyRateUsd : null
  const aboutLen = (form.aboutMe ?? '').trim().length
  const publicAbout =
    tutor.aboutMe?.trim() ||
    profile?.aboutMe?.trim() ||
    'Add a short bio so students know how you teach.'

  const onAvatarChange = async (file: File) => {
    setAvatarError(null)
    try {
      const nextAvatar = await fileToAvatarDataUrl(file)
      const result = await updateTutor({
        fullName: tutor.fullName,
        handle: tutor.handle,
        position: tutor.position ?? 'Teacher',
        aboutMe: tutor.aboutMe,
        yearsOfExperience: tutor.yearsOfExperience,
        hourlyRateUsd: tutor.hourlyRateUsd,
        avatarUrl: nextAvatar,
        isPublicProfile: tutor.isPublicProfile,
        certifications: tutor.certifications,
      })
      if (!result.ok) setAvatarError(result.error)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const saveProfile = async (): Promise<boolean> => {
    setSubmitError(null)
    setSavedOk(false)
    const validation = validateTutorEditProfileForm(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation as Record<string, string>)
      return false
    }

    setErrors({})
    setSaving(true)
    const result = await updateTutor({
      fullName: form.fullName.trim(),
      handle: form.handle.replace(/^@/, '').trim().toLowerCase(),
      position: form.position as TutorPosition,
      yearsOfExperience: Number(form.yearsOfExperience),
      hourlyRateUsd: Number(form.hourlyRateUsd),
      aboutMe: form.aboutMe?.trim(),
      avatarUrl: tutor.avatarUrl,
      isPublicProfile: tutor.isPublicProfile,
      certifications: form.certifications,
    })
    setSaving(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return false
    }
    setSavedOk(true)
    return true
  }

  const resumeReady = canSendTutorResume(form)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    void saveProfile()
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
            <AvatarUpload
              currentAvatarUrl={tutor.avatarUrl ?? profile?.avatarUrl}
              onAvatarChange={(file) => void onAvatarChange(file)}
              editable
              displayName={form.fullName || tutor.fullName}
              size="lg"
            />
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {form.fullName || tutor.fullName}
                </h2>
                {tutor.status === 'approved' ? (
                  <VerifiedBadge size="lg" title="Verified teacher" />
                ) : null}
                <StatusBadge status={tutor.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                @{form.handle.replace(/^@/, '') || tutor.handle}
              </p>
              <p className="mt-1 text-sm font-medium text-brand">
                {form.position || 'Teacher'}
              </p>
              {years !== null ? (
                <p className="mt-1 text-sm text-slate-400">
                  {years} {years === 1 ? 'year' : 'years'} experience
                </p>
              ) : null}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Star
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    aria-hidden
                  />
                  <span>
                    {avgRating.toFixed(1)} ({totalReviews} reviews)
                  </span>
                </span>
                {rate !== null ? (
                  <span className="text-slate-500">$ {rate}/hour</span>
                ) : null}
              </div>
              {avatarError ? (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {avatarError}
                </p>
              ) : null}
              {tutor.status === 'pending' ? (
                <p className="mt-2 text-xs font-medium text-amber-600">
                  Resume sent — waiting for admin approval.
                </p>
              ) : null}
            </div>
          </div>
          <SendResumeButton
            enabled={resumeReady}
            status={tutor.status}
            onBeforeSend={saveProfile}
            onSent={() => void refreshUser()}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-base font-bold text-slate-900">
            About me
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            {publicAbout}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            id="tutor-profile-form"
            method="post"
            action="/tutor/profile"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="tutor-edit-name">
                  Full Name <RequiredMark />
                </label>
                <input
                  id="tutor-edit-name"
                  className={inputClass}
                  value={form.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  autoComplete="name"
                />
                {errors.fullName ? (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                ) : null}
              </div>

              <div>
                <label className={labelClass} htmlFor="tutor-edit-handle">
                  Username <RequiredMark />
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                    @
                  </span>
                  <input
                    id="tutor-edit-handle"
                    className={`${inputClass} pl-8`}
                    value={form.handle.replace(/^@/, '')}
                    onChange={(e) =>
                      setField(
                        'handle',
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                      )
                    }
                    autoComplete="username"
                  />
                </div>
                {errors.handle ? (
                  <p className="mt-1 text-xs text-red-600">{errors.handle}</p>
                ) : null}
              </div>

              <div>
                <label className={labelClass} htmlFor="tutor-edit-email">
                  Email
                </label>
                <input
                  id="tutor-edit-email"
                  className={`${inputClass} bg-slate-50 text-slate-500`}
                  value={tutor.email}
                  readOnly
                  autoComplete="email"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="tutor-edit-position">
                  Specialization <RequiredMark />
                </label>
                <select
                  id="tutor-edit-position"
                  className={inputClass}
                  value={form.position}
                  onChange={(e) => setField('position', e.target.value)}
                >
                  {TUTOR_POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.position ? (
                  <p className="mt-1 text-xs text-red-600">{errors.position}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="tutor-edit-years">
                    Year of Experience <RequiredMark />
                  </label>
                  <input
                    id="tutor-edit-years"
                    type="number"
                    min={0}
                    max={60}
                    step={1}
                    inputMode="numeric"
                    className={inputClass}
                    value={
                      form.yearsOfExperience === ''
                        ? ''
                        : form.yearsOfExperience
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setField(
                        'yearsOfExperience',
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                  />
                  {errors.yearsOfExperience ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.yearsOfExperience}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass} htmlFor="tutor-edit-rate">
                    Hourly rate
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                      $
                    </span>
                    <input
                      id="tutor-edit-rate"
                      type="number"
                      min={20}
                      max={500}
                      step={1}
                      inputMode="numeric"
                      className={`${inputClass} pl-7`}
                      value={
                        form.hourlyRateUsd === '' ? '' : form.hourlyRateUsd
                      }
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setField(
                          'hourlyRateUsd',
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  {errors.hourlyRateUsd ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.hourlyRateUsd}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-800" htmlFor="tutor-edit-summary">
                    About me
                  </label>
                  <span className="text-xs text-slate-400">{aboutLen} / 50 min</span>
                </div>
                <textarea
                  id="tutor-edit-summary"
                  className={`${inputClass} min-h-32 resize-y`}
                  value={form.aboutMe ?? ''}
                  onChange={(e) => setField('aboutMe', e.target.value)}
                />
              </div>

              <CertificationUploadInput
                variant="profile"
                certifications={form.certifications}
                onChange={(certs) => setField('certifications', certs)}
              />

              {submitError ? (
                <p className="text-sm text-red-600">{submitError}</p>
              ) : savedOk ? (
                <p className="text-sm font-medium text-emerald-600">
                  Profile saved.
                </p>
              ) : null}
            </div>
          </form>

          <div className="flex flex-col">
            <AvailabilitySettings embedded />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveProfile()}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <ReferralWidget />

      <AccountPanel user={user} />
    </div>
  )
}
