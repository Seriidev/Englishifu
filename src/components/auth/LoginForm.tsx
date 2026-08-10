import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { dashboardPathForRole } from '../../utils/authStorage'
import AuthShell from './AuthShell'
import { errorClass, fieldClass, labelClass, primaryBtnClass } from './formStyles'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Enter email and password')
      return
    }

    setSubmitting(true)
    const result = await login(email.trim(), password)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate(dashboardPathForRole(result.user.role, result.user), {
      replace: true,
    })
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue learning or teaching on Englishcore."
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label className={labelClass} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="login-password">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className={`${fieldClass} pr-12`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
        </div>

        {error ? <p className={errorClass}>{error}</p> : null}

        <button type="submit" className={primaryBtnClass} disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/start" className="font-semibold text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
