import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import BrandMark from '../shared/BrandMark'
import { type TutorPosition } from '../../types/tutorProfile'
import { normalizeCertifications } from '../../utils/certifications'
import {
  validateTutorEditProfileForm,
  type TutorEditProfileFormData,
} from '../../utils/validation'
import { errorClass, fieldClass, labelClass } from '../auth/formStyles'
import { dashboardPathForRole } from '../../utils/authStorage'
import CertificationUploadInput from '../tutor/CertificationUploadInput'
import {
  SpecializationAdd,
  SpecializationChips,
  specializationsFromProfile,
} from '../tutor/SpecializationAdd'
import AvailabilitySettings from './AvailabilitySettings'
import CreateSpeakingClubSessionForm from './CreateSpeakingClubSessionForm'

export default function EditTutorProfileForm() {
  const { user, updateTutor } = useAuth()
  const navigate = useNavigate()

  const initial = useMemo<TutorEditProfileFormData>(() => {
    if (!user || user.role !== 'tutor') {
      return {
        fullName: '',
        handle: '',
        position: 'Teacher',
        specializations: ['Teacher'],
        yearsOfExperience: '',
        hourlyRateUsd: '',
        certifications: [],
      }
    }
    return {
      fullName: user.fullName,
      handle: user.handle,
      position: user.position,
      specializations: specializationsFromProfile(user),
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
  const [saving, setSaving] = useState(false)

  if (!user || user.role !== 'tutor') return null

  const setField = <K extends keyof TutorEditProfileFormData>(
    key: K,
    value: TutorEditProfileFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const onCancel = () => navigate('/tutor/profile')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const validation = validateTutorEditProfileForm(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation as Record<string, string>)
      return
    }

    setErrors({})
    setSaving(true)
    const result = await updateTutor({
      fullName: form.fullName.trim(),
      handle: form.handle.replace(/^@/, '').trim().toLowerCase(),
      position: (form.specializations[0] || form.position) as TutorPosition,
      specializations: form.specializations,
      yearsOfExperience: Number(form.yearsOfExperience),
      hourlyRateUsd: Number(form.hourlyRateUsd),
      aboutMe: form.aboutMe?.trim(),
      isPublicProfile: user.isPublicProfile,
      certifications: form.certifications,
    })
    setSaving(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    navigate('/tutor/profile')
  }

  return (
    <div className="landing-shell min-h-svh">
      <header className="border-b border-[#c7d7f5]/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to={user ? dashboardPathForRole(user.role, user) : '/'}
            className="text-ink"
          >
            <BrandMark />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <form onSubmit={(e) => void onSubmit(e)} noValidate>
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-ink">
            Edit Profile
          </h1>

          <div className="space-y-5 rounded-3xl border border-[#c7d7f5]/70 bg-white/90 p-5 shadow-sm sm:p-8">
            <div>
              <label className={labelClass} htmlFor="tutor-edit-name">
                Full Name *
              </label>
              <input
                id="tutor-edit-name"
                className={fieldClass}
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                autoComplete="name"
              />
              {errors.fullName ? (
                <p className={errorClass}>{errors.fullName}</p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="tutor-edit-handle">
                Username *
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
                  @
                </span>
                <input
                  id="tutor-edit-handle"
                  className={`${fieldClass} pl-8`}
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
                <p className={errorClass}>{errors.handle}</p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="tutor-edit-email">
                Email
              </label>
              <input
                id="tutor-edit-email"
                className={`${fieldClass} bg-gray-100 text-muted`}
                value={user.email}
                readOnly
                autoComplete="email"
              />
              <p className="mt-1.5 text-xs text-muted">
                Used to log in. Change your password on your profile under
                Account.
              </p>
            </div>

            <div>
              <p className={labelClass}>Specialization *</p>
              <SpecializationAdd
                selected={form.specializations}
                onAdd={(value) => {
                  const next = form.specializations.includes(value)
                    ? form.specializations
                    : [...form.specializations, value]
                  setForm((prev) => ({
                    ...prev,
                    specializations: next,
                    position: next[0] ?? '',
                  }))
                }}
              />
              {form.specializations.length > 0 ? (
                <div className="mt-3">
                  <SpecializationChips
                    selected={form.specializations}
                    onRemove={(value) => {
                      const next = form.specializations.filter(
                        (item) => item !== value,
                      )
                      setForm((prev) => ({
                        ...prev,
                        specializations: next,
                        position: next[0] ?? '',
                      }))
                    }}
                  />
                </div>
              ) : null}
              {errors.position ? (
                <p className={errorClass}>{errors.position}</p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="tutor-edit-years">
                Years of Experience *
              </label>
              <input
                id="tutor-edit-years"
                type="number"
                min={0}
                max={60}
                step={1}
                inputMode="numeric"
                className={fieldClass}
                value={
                  form.yearsOfExperience === '' ? '' : form.yearsOfExperience
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setField(
                    'yearsOfExperience',
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                placeholder="e.g. 5"
              />
              {errors.yearsOfExperience ? (
                <p className={errorClass}>{errors.yearsOfExperience}</p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="tutor-edit-rate">
                Hourly rate (USD) *
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold text-muted">
                  $
                </span>
                <input
                  id="tutor-edit-rate"
                  type="number"
                  min={20}
                  max={500}
                  step={1}
                  inputMode="numeric"
                  className={`${fieldClass} pl-8`}
                  value={form.hourlyRateUsd === '' ? '' : form.hourlyRateUsd}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setField(
                      'hourlyRateUsd',
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  placeholder="20"
                />
              </div>
              {errors.hourlyRateUsd ? (
                <p className={errorClass}>{errors.hourlyRateUsd}</p>
              ) : (
                <p className="mt-1.5 text-xs text-muted">
                  Minimum $20 per hour. Students will see this on your profile.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="tutor-edit-summary">
                Summary
              </label>
              <textarea
                id="tutor-edit-summary"
                className={`${fieldClass} min-h-32 resize-y`}
                value={form.aboutMe ?? ''}
                onChange={(e) => setField('aboutMe', e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Certifications</label>
              <CertificationUploadInput
                certifications={form.certifications}
                onChange={(certs) => setField('certifications', certs)}
              />
            </div>

            {submitError ? <p className={errorClass}>{submitError}</p> : null}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 space-y-8">
          <AvailabilitySettings />
          <CreateSpeakingClubSessionForm onCreated={() => undefined} />
        </div>
      </main>
    </div>
  )
}
