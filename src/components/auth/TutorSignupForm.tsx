import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import {
  hasSignupErrors,
  validateSignupForm,
  type SignupFormInput,
  type SignupValidationErrors,
} from '../../utils/validation'
import { tutorProfilePath } from '../../utils/authStorage'
import AuthShell from './AuthShell'
import { errorClass, fieldClass, labelClass, primaryBtnClass } from './formStyles'

const initial: SignupFormInput = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function TutorSignupForm() {
  const navigate = useNavigate()
  const { registerAsTutor } = useAuth()
  const [form, setForm] = useState<SignupFormInput>(initial)
  const [errors, setErrors] = useState<SignupValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set =
    (key: keyof SignupFormInput) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const nextErrors = validateSignupForm(form, 'tutor')
    setErrors(nextErrors)
    if (hasSignupErrors(nextErrors)) return

    setSubmitting(true)
    const result = await registerAsTutor({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
    })
    setSubmitting(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }
    if (result.user.role === 'tutor') {
      navigate(tutorProfilePath(result.user.handle), { replace: true })
    }
  }

  return (
    <AuthShell
      title="Create tutor account"
      subtitle="Sign up first — you can complete your teaching profile next."
    >
      <button
        type="button"
        onClick={() => navigate('/signup')}
        className="mb-4 inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-gray-50"
      >
        Back
      </button>

      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="tutor-first">
              First Name
            </label>
            <input
              id="tutor-first"
              className={fieldClass}
              value={form.firstName}
              onChange={set('firstName')}
              autoComplete="given-name"
            />
            {errors.firstName ? (
              <p className={errorClass}>{errors.firstName}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="tutor-last">
              Last Name
            </label>
            <input
              id="tutor-last"
              className={fieldClass}
              value={form.lastName}
              onChange={set('lastName')}
              autoComplete="family-name"
            />
            {errors.lastName ? (
              <p className={errorClass}>{errors.lastName}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="tutor-email">
            Email
          </label>
          <input
            id="tutor-email"
            type="email"
            className={fieldClass}
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
          />
          {errors.email ? <p className={errorClass}>{errors.email}</p> : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="tutor-password">
            Password
          </label>
          <input
            id="tutor-password"
            type="password"
            className={fieldClass}
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
          />
          {errors.password ? (
            <p className={errorClass}>{errors.password}</p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="tutor-confirm">
            Confirm Password
          </label>
          <input
            id="tutor-confirm"
            type="password"
            className={fieldClass}
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            autoComplete="new-password"
          />
          {errors.confirmPassword ? (
            <p className={errorClass}>{errors.confirmPassword}</p>
          ) : null}
        </div>

        {submitError ? <p className={errorClass}>{submitError}</p> : null}

        <button type="submit" className={primaryBtnClass} disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Tutor Account'}
        </button>

        <p className="text-center text-sm text-muted">
          Want to learn instead?{' '}
          <Link
            to="/signup/student"
            className="font-semibold text-brand hover:underline"
          >
            Sign up as Student
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
