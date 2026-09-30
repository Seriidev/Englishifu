import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import type { UserRole } from '../../types/user'
import {
  hasSignupErrors,
  validateSignupForm,
  type SignupValidationErrors,
} from '../../utils/validation'
import AuthShell from './AuthShell'
import { claimPendingPlacement } from '../../utils/pendingPlacement'
import {
  errorClass,
  fieldClass,
  labelClass,
  primaryBtnClass,
  quietBtnClass,
  secondaryBtnClass,
} from './formStyles'

interface SignupFormProps {
  role: UserRole
}

export default function SignupForm({ role }: SignupFormProps) {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const referralCode = (search.get('ref') || '').trim()
  const { registerAsStudent, registerAsTutor, refreshUser } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<SignupValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [consentError, setConsentError] = useState<string | null>(null)

  const isStudent = role === 'student'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const nextErrors = validateSignupForm({ fullName, email, password }, role)
    setErrors(nextErrors)
    if (!marketingOptIn) {
      setConsentError('Check the box to create an account.')
    } else {
      setConsentError(null)
    }
    if (hasSignupErrors(nextErrors) || !marketingOptIn) return

    setSubmitting(true)
    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      referralCode: referralCode || undefined,
      marketingOptIn,
    }
    const result = isStudent
      ? await registerAsStudent(payload)
      : await registerAsTutor(payload)
    setSubmitting(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    if (isStudent) {
      await claimPendingPlacement(result.user.id)
      await refreshUser()
    }

    navigate(isStudent ? '/profile/edit' : '/tutor/complete-profile', {
      replace: true,
    })
  }

  return (
    <AuthShell
      title={isStudent ? 'Create student account' : 'Create tutor account'}
      subtitle={
        isStudent ? undefined : 'Teach students and grow your tutoring presence.'
      }
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label className={labelClass} htmlFor="signup-fullname">
            Full Name
          </label>
          <input
            id="signup-fullname"
            className={fieldClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
          />
          {errors.fullName ? (
            <p className={errorClass}>{errors.fullName}</p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
          {errors.email ? <p className={errorClass}>{errors.email}</p> : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="signup-password">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className={`${fieldClass} pr-12`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" aria-hidden />
              ) : (
                <Eye className="h-[18px] w-[18px]" aria-hidden />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className={errorClass}>{errors.password}</p>
          ) : null}
        </div>

        {referralCode ? (
          <p className="rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            Invited with code {referralCode}. Rewards unlock after the first
            completed lesson.
          </p>
        ) : null}

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-1"
            checked={marketingOptIn}
            onChange={(e) => {
              setMarketingOptIn(e.target.checked)
              if (e.target.checked) setConsentError(null)
            }}
          />
          <span>
            I agree to receive optional emails about courses, admissions help,
            and offers. You can unsubscribe anytime. In-app notifications still
            work without this.
          </span>
        </label>
        {consentError ? <p className={errorClass}>{consentError}</p> : null}

        {submitError ? <p className={errorClass}>{submitError}</p> : null}

        <button type="submit" className={primaryBtnClass} disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Account'}
        </button>

        <Link
          to={
            isStudent
              ? `/signup/tutor${referralCode ? `?ref=${encodeURIComponent(referralCode)}` : ''}`
              : `/signup/student${referralCode ? `?ref=${encodeURIComponent(referralCode)}` : ''}`
          }
          className={secondaryBtnClass}
        >
          {isStudent ? 'Sign up as Tutor' : 'Sign up as Student'}
        </Link>

        <Link to="/login" className={quietBtnClass}>
          Log in
        </Link>
      </form>
    </AuthShell>
  )
}
