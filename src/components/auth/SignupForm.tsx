import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import type { UserRole } from '../../types/user'
import {
  hasSignupErrors,
  validateSignupForm,
  type SignupValidationErrors,
} from '../../utils/validation'
import AuthShell from './AuthShell'
import { errorClass, fieldClass, labelClass, primaryBtnClass } from './formStyles'

interface SignupFormProps {
  role: UserRole
}

export default function SignupForm({ role }: SignupFormProps) {
  const navigate = useNavigate()
  const { registerAsStudent, registerAsTutor } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<SignupValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isStudent = role === 'student'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const nextErrors = validateSignupForm({ fullName, email, password }, role)
    setErrors(nextErrors)
    if (hasSignupErrors(nextErrors)) return

    setSubmitting(true)
    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    }
    const result = isStudent
      ? await registerAsStudent(payload)
      : await registerAsTutor(payload)
    setSubmitting(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    navigate(isStudent ? '/profile/edit' : '/tutor/complete-profile', {
      replace: true,
    })
  }

  return (
    <AuthShell
      title={isStudent ? 'Create student account' : 'Create tutor account'}
      subtitle={
        isStudent
          ? 'Learn with tutors, speaking clubs, and TOEFL practice.'
          : 'Teach students and grow your tutoring presence.'
      }
    >
      <button
        type="button"
        onClick={() => navigate('/signup')}
        className="mb-4 inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-gray-50"
      >
        Back
      </button>

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

        {submitError ? <p className={errorClass}>{submitError}</p> : null}

        <button type="submit" className={primaryBtnClass} disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-muted">
          {isStudent ? 'Want to teach instead? ' : 'Want to learn instead? '}
          <Link
            to={isStudent ? '/signup/tutor' : '/signup/student'}
            className="font-semibold text-brand hover:underline"
          >
            {isStudent ? 'Sign up as Tutor' : 'Sign up as Student'}
          </Link>
        </p>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
