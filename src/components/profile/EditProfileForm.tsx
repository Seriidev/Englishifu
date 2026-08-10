import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { isHandleTaken, studentPublicProfilePath } from '../../utils/authStorage'
import {
  hasEditProfileErrors,
  validateEditProfileForm,
  type EditProfileFormData,
} from '../../utils/validation'
import {
  errorClass,
  fieldClass,
  labelClass,
} from '../auth/formStyles'

export default function EditProfileForm() {
  const { user, updateStudent } = useAuth()
  const navigate = useNavigate()

  const initial = useMemo<EditProfileFormData>(() => {
    if (!user || user.role !== 'student') {
      return { fullName: '', handle: '' }
    }
    return {
      fullName: user.fullName,
      handle: user.handle,
      city: user.city ?? '',
      headline: user.headline ?? '',
      summary: user.summary ?? '',
    }
  }, [user])

  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!user || user.role !== 'student') {
    return null
  }

  const setField = <K extends keyof EditProfileFormData>(
    key: K,
    value: EditProfileFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onCancel = () => {
    navigate(studentPublicProfilePath(user.handle))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const validation = validateEditProfileForm(form)
    const handle = form.handle.replace(/^@/, '').trim().toLowerCase()

    if (handle && isHandleTaken(handle, user.id)) {
      validation.handle = 'Username is already taken'
    }

    if (hasEditProfileErrors(validation)) {
      setErrors(validation as Record<string, string>)
      return
    }

    setErrors({})
    setSaving(true)
    const result = await updateStudent({
      fullName: form.fullName.trim(),
      handle,
      city: form.city?.trim(),
      headline: form.headline?.trim(),
      summary: form.summary?.trim(),
      avatarUrl: user.avatarUrl,
      isPublicProfile: user.isPublicProfile,
    })
    setSaving(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    const nextHandle =
      result.user.role === 'student' ? result.user.handle : handle
    navigate(studentPublicProfilePath(nextHandle))
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
              <label className={labelClass} htmlFor="edit-fullname">
                Full Name *
              </label>
              <input
                id="edit-fullname"
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
              <label className={labelClass} htmlFor="edit-handle">
                Username *
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
                  @
                </span>
                <input
                  id="edit-handle"
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
              <label className={labelClass} htmlFor="edit-city">
                What city are you located in?
              </label>
              <input
                id="edit-city"
                className={fieldClass}
                value={form.city ?? ''}
                onChange={(e) => setField('city', e.target.value)}
                placeholder="Ashgabat, Turkmenistan"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="edit-headline">
                Headline
              </label>
              <input
                id="edit-headline"
                className={fieldClass}
                value={form.headline ?? ''}
                onChange={(e) => setField('headline', e.target.value)}
                placeholder="A short phrase under your name"
                maxLength={80}
              />
              {errors.headline ? (
                <p className={errorClass}>{errors.headline}</p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="edit-summary">
                Summary
              </label>
              <textarea
                id="edit-summary"
                className={`${fieldClass} min-h-32 resize-y`}
                value={form.summary ?? ''}
                onChange={(e) => setField('summary', e.target.value)}
                maxLength={1000}
              />
              <p className="mt-1.5 text-xs text-muted">
                Add a summary about your learning goals and interests. People
                also talk about achievements or languages they speak.
              </p>
              {errors.summary ? (
                <p className={errorClass}>{errors.summary}</p>
              ) : null}
            </div>

            {submitError ? <p className={errorClass}>{submitError}</p> : null}
          </div>
        </form>
      </main>
    </div>
  )
}
