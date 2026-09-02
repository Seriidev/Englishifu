import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import {
  hasProfileErrors,
  validateTutorProfileForm,
  type TutorProfileFormInput,
  type TutorProfileValidationErrors,
} from '../../utils/validation'
import { normalizeCertifications } from '../../utils/certifications'
import AuthShell from '../auth/AuthShell'
import CertificationUploadInput from './CertificationUploadInput'
import {
  errorClass,
  fieldClass,
  labelClass,
  primaryBtnClass,
} from '../auth/formStyles'

export default function CompleteProfileForm() {
  const navigate = useNavigate()
  const { user, completeProfile } = useAuth()

  const [form, setForm] = useState<TutorProfileFormInput>(() => {
    if (user?.role === 'tutor') {
      return {
        yearsOfExperience: user.yearsOfExperience ?? '',
        certifications: normalizeCertifications(user.certifications),
        aboutMe: user.aboutMe ?? '',
      }
    }
    return {
      yearsOfExperience: '',
      certifications: [],
      aboutMe: '',
    }
  })
  const [errors, setErrors] = useState<TutorProfileValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const aboutLen = form.aboutMe.trim().length

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const nextErrors = validateTutorProfileForm(form)
    setErrors(nextErrors)
    if (hasProfileErrors(nextErrors)) return

    setSubmitting(true)
    const result = await completeProfile({
      yearsOfExperience: Number(form.yearsOfExperience),
      certifications: form.certifications,
      aboutMe: form.aboutMe,
    })
    setSubmitting(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }
    if (result.user.role === 'tutor') {
      navigate('/tutor', { replace: true })
    }
  }

  const goToProfile = () => {
    if (user?.role === 'tutor') {
      navigate('/tutor', { replace: true })
    }
  }

  return (
    <AuthShell
      title="Complete Your Tutor Profile"
      subtitle="To start teaching, tell students a bit about your experience."
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label className={labelClass} htmlFor="profile-years">
            Years of Experience
          </label>
          <input
            id="profile-years"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className={fieldClass}
            value={form.yearsOfExperience === '' ? '' : form.yearsOfExperience}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({
                ...prev,
                yearsOfExperience:
                  e.target.value === '' ? '' : Number(e.target.value),
              }))
            }
          />
          {errors.yearsOfExperience ? (
            <p className={errorClass}>{errors.yearsOfExperience}</p>
          ) : null}
        </div>

        <div>
          <label className={labelClass}>Certifications</label>
          <CertificationUploadInput
            certifications={form.certifications}
            onChange={(certs) =>
              setForm((prev) => ({ ...prev, certifications: certs }))
            }
          />
          {errors.certifications ? (
            <p className={errorClass}>{errors.certifications}</p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="profile-about">
            About Me
          </label>
          <textarea
            id="profile-about"
            rows={5}
            className={`${fieldClass} resize-y`}
            placeholder="Tell students about yourself, your teaching style, and experience…"
            value={form.aboutMe}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, aboutMe: e.target.value }))
            }
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            {errors.aboutMe ? (
              <p className={errorClass}>{errors.aboutMe}</p>
            ) : (
              <span />
            )}
            <p
              className={`text-xs ${aboutLen < 50 ? 'text-muted' : 'font-medium text-brand'}`}
            >
              {aboutLen}/50 min
            </p>
          </div>
        </div>

        {submitError ? <p className={errorClass}>{submitError}</p> : null}

        <button type="submit" className={primaryBtnClass} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save & Continue'}
        </button>

        <button
          type="button"
          onClick={goToProfile}
          className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-gray-50"
        >
          Skip for now
        </button>
      </form>
    </AuthShell>
  )
}
