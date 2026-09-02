import { useState, type FormEvent } from 'react'
import { Check, Copy, Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import type { PublicUser } from '../../types/user'
import { errorClass, fieldClass, labelClass } from '../auth/formStyles'

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  const [visible, setVisible] = useState(false)

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
          onClick={() => setVisible((v) => !v)}
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

function CopyableValue({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Mail
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-ink"
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  )
}

export default function AccountPanel({ user }: { user: PublicUser }) {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const roleLabel = user.role === 'tutor' ? 'Teacher' : 'Student'
  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!currentPassword) {
      setError('Enter your current password')
      return
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setSaving(true)
    const result = await changePassword(currentPassword, newPassword)
    setSaving(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setSuccess('Password updated')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-base font-bold text-ink">Login details</h3>
        <p className="text-sm text-muted">
          Only you can see this. Your password is encrypted, so it cannot be
          shown — you can reveal what you type when you change it.
        </p>
        <CopyableValue label="Email" value={user.email} icon={Mail} />
        <CopyableValue
          label="Username"
          value={`@${user.handle}`}
          icon={UserRound}
        />
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
            <Lock className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              Password
            </p>
            <p className="mt-0.5 font-mono text-sm font-semibold tracking-widest text-ink">
              ••••••••
            </p>
            <p className="mt-1 text-xs text-muted">
              Hidden for security. Use the form to set a new one.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted">
          Account type: {roleLabel}
          {Number.isNaN(Date.parse(user.createdAt))
            ? ''
            : ` · Member since ${memberSince}`}
        </p>
      </div>

      <form
        id="tutor-change-password-form"
        className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void onSubmit(e)
        }}
        noValidate
      >
        <h3 className="text-base font-bold text-ink">Change password</h3>
        <PasswordField
          id="account-current-password"
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
        <PasswordField
          id="account-new-password"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <PasswordField
          id="account-confirm-password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        {error ? <p className={errorClass}>{error}</p> : null}
        {success ? (
          <p className="text-xs font-medium text-emerald-600">{success}</p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
