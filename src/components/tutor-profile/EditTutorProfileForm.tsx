import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { TUTOR_POSITIONS, type TutorPosition } from '../../types/tutorProfile'
import { tutorProfilePath } from '../../utils/authStorage'
import { normalizeCertifications } from '../../utils/certifications'
import {
  validateTutorEditProfileForm,
  type TutorEditProfileFormData,
} from '../../utils/validation'
import { errorClass, fieldClass, labelClass } from '../auth/formStyles'
import CertificationUploadInput from '../tutor/CertificationUploadInput'

export default function EditTutorProfileForm() {
  const { user, updateTutor } = useAuth()
  const navigate = useNavigate()

  const initial = useMemo<TutorEditProfileFormData>(() => {
    if (!user || user.role !== 'tutor') {
      return {
        fullName: '',
        position: 'Teacher',
        yearsOfExperience: '',
        hourlyRateUsd: '',
        certifications: [],
      }
    }
    return {
      fullName: user.fullName,
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
  const [saving, setSaving] = useState(false)

  if (!user || user.role !== 'tutor') return null

  const setField = <K extends keyof TutorEditProfileFormData>(
    key: K,
    value: TutorEditProfileFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const onCancel = () => navigate(tutorProfilePath(user.handle))

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
      position: form.position as TutorPosition,
      yearsOfExperience: Number(form.yearsOfExperience),
      hourlyRateUsd: Number(form.hourlyRateUsd),
      aboutMe: form.aboutMe?.trim(),
      avatarUrl: user.avatarUrl,
      isPublicProfile: user.isPublicProfile,
      certifications: form.certifications,
    })
    setSaving(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    const handle =
      result.user.role === 'tutor' ? result.user.handle : user.handle
    navigate(tutorProfilePath(handle))
  }

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
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <form onSubmit={(e) => void onSubmit(e)} noValidate>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-ink">
              Edit Profile
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <button
                type="button"
                onClick={onCancel}
                className="font-semibold text-muted transition hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="font-semibold text-ink transition hover:text-brand disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
          <p className="mb-8 text-sm text-muted">
            Required fields are marked with an *
          </p>

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
              <label className={labelClass} htmlFor="tutor-edit-position">
                Position *
              </label>
              <select
                id="tutor-edit-position"
                className={fieldClass}
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
          </div>
        </form>
      </main>
    </div>
  )
}
