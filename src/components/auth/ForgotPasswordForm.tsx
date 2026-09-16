import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../../utils/authStorage'
import AuthShell from './AuthShell'
import { errorClass, fieldClass, labelClass, primaryBtnClass } from './formStyles'

export default function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const [email, setEmail] = useState(() => (search.get('email') || '').trim())
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email')
      return
    }
    if (password.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const result = await resetPassword(email.trim(), password, confirmPassword)
      if ('error' in result) {
        setError(result.error)
        return
      }
      navigate('/login?reset=1', { replace: true })
    } catch {
      setError('Could not update password. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Update password"
      subtitle="Enter your email and choose a new password."
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label className={labelClass} htmlFor="reset-email">
            Your email
          </label>
          <input
            id="reset-email"
            type="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <PasswordRow
          id="reset-password"
          label="New password"
          value={password}
          onChange={setPassword}
          visible={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          autoComplete="new-password"
        />

        <PasswordRow
          id="reset-confirm-password"
          label="Repeat new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          autoComplete="new-password"
        />

        {error ? <p className={errorClass}>{error}</p> : null}

        <button type="submit" className={primaryBtnClass} disabled={submitting}>
          {submitting ? 'Saving…' : 'Update password'}
        </button>

        <p className="text-center text-sm text-muted">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

function PasswordRow({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggle: () => void
  autoComplete: string
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${fieldClass} pr-12`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:text-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" aria-hidden />
          ) : (
            <Eye className="h-[18px] w-[18px]" aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}
