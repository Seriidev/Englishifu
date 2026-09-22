import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { submitConsultation } from '../utils/adminPanelApi'

const RULES = [
  'Be respectful. Do not insult, swear at, or bully tutors, students, or staff.',
  'No harassment, spam, or unsolicited messages.',
  'Keep lessons, chats, and speaking clubs on topic.',
  'Follow tutor and admin instructions. Repeat violations can lead to a suspended account.',
]

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15'

export default function StudyHelpPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.fullName ?? '',
    email: user?.email ?? '',
    message: '',
  })
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'ok' | 'error'>(
    'idle',
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitState('sending')
    setSubmitError(null)
    try {
      await submitConsultation({
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: 'n/a',
        learningGoal: 'Help',
        message: form.message.trim() || undefined,
      })
      setSubmitState('ok')
      setForm((prev) => ({ ...prev, message: '' }))
    } catch (err) {
      setSubmitState('error')
      setSubmitError(err instanceof Error ? err.message : 'Could not submit')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Help</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
          EnglishCore support is here for account, lesson, and platform questions.
          Read the community rules first, then write to us if you still need help.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-bold text-slate-900">Community rules</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500">
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
      >
        <h3 className="text-sm font-bold text-slate-900">Contact support</h3>
        <p className="mt-1 text-sm text-slate-500">
          Send a request and we will get back to you.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Full name
            <input
              required
              className={`${fieldClass} mt-1.5`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Email
            <input
              required
              type="email"
              className={`${fieldClass} mt-1.5`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </label>
        </div>

        <label className="mt-3 block text-sm font-semibold text-slate-800">
          Message
          <textarea
            rows={4}
            className={`${fieldClass} mt-1.5 resize-none`}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us what you need help with"
          />
        </label>

        {submitError ? (
          <p className="mt-3 text-sm font-medium text-red-600">{submitError}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitState === 'sending'}
          className="mt-4 w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
        >
          {submitState === 'sending'
            ? 'Sending…'
            : submitState === 'ok'
              ? 'Request sent'
              : 'Send message'}
        </button>
      </form>
    </div>
  )
}
