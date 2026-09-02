import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Camera,
  Clock,
  Globe2,
  GraduationCap,
  Mail,
  MessageCircle,
  Music2,
  Send,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { submitConsultation } from '../utils/adminPanelApi'
import { useLanguage } from '../i18n/LanguageContext'

type Goal = '' | 'TOEFL' | 'Speaking' | 'IELTS' | 'General English'

interface ConsultationForm {
  name: string
  email: string
  phone: string
  toeflScore: string
  goal: Goal
  message: string
}

const goals: Exclude<Goal, ''>[] = [
  'TOEFL',
  'Speaking',
  'IELTS',
  'General English',
]

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@englishcore.com',
    href: 'mailto:support@englishcore.com',
  },
  {
    icon: Send,
    label: 'Telegram',
    value: '@englishcore',
    href: 'https://t.me/englishcore',
  },
  {
    icon: Camera,
    label: 'Instagram',
    value: '@englishcore',
    href: 'https://instagram.com/englishcore',
  },
  {
    icon: Music2,
    label: 'TikTok',
    value: '@englishcore',
    href: 'https://tiktok.com/@englishcore',
  },
  {
    icon: Globe2,
    label: 'Worldwide',
    value: 'Available in every country',
    href: undefined,
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Usually within 30 minutes',
    href: undefined,
  },
] as const

const inputClass =
  'w-full rounded-2xl border border-gray-200/80 bg-gray-50/80 px-4 py-3.5 text-[15px] text-ink outline-none transition placeholder:text-gray-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15'

export default function ContactSection() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState<ConsultationForm>({
    name: '',
    email: '',
    phone: '',
    toeflScore: '',
    goal: '',
    message: '',
  })

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const [submitState, setSubmitState] = useState<
    'idle' | 'sending' | 'ok' | 'error'
  >('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitState('sending')
    setSubmitError(null)
    try {
      await submitConsultation({
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        toeflScore: form.toeflScore,
        learningGoal: form.goal,
        message: form.message,
      })
      setSubmitState('ok')
      setForm({
        name: '',
        email: '',
        phone: '',
        toeflScore: '',
        goal: '',
        message: '',
      })
    } catch (err) {
      setSubmitState('error')
      setSubmitError(err instanceof Error ? err.message : 'Could not submit')
    }
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-transparent via-[#eef3ff]/80 to-[#e8f1ff]/40"
    >
      {/* Soft blurred circles */}
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-brand/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 bottom-10 h-80 w-80 rounded-full bg-brand/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-1/3 left-0 h-56 w-56 rounded-full bg-brand/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1280px] px-6 py-[100px] lg:py-[140px]">
        {/* Header */}
        <div
          className={`mx-auto max-w-2xl text-center ${visible ? 'animate-fade-up' : 'opacity-0'}`}
        >
          <p className="text-xs font-bold tracking-[0.22em] text-brand uppercase">
            Connect With Us
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {t('contact.title')}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
            {t('contact.body')}
          </p>
        </div>

        {/* Cards */}
        <div className="relative mt-14 lg:mt-16">
          {/* Floating badges — desktop */}
          <div
            className={`pointer-events-none absolute -top-5 left-[8%] z-20 hidden animate-float lg:block ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg shadow-brand/10">
              <GraduationCap className="h-4 w-4 text-brand" aria-hidden />
              {t('contact.badgeExperts')}
            </span>
          </div>
          <div
            className={`pointer-events-none absolute top-[28%] -left-2 z-20 hidden animate-float xl:block ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: '1.1s' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg shadow-brand/10">
              <Zap className="h-4 w-4 text-brand" aria-hidden />
              {t('contact.badgeResponse')}
            </span>
          </div>
          <div
            className={`pointer-events-none absolute top-[12%] right-[2%] z-20 hidden animate-float lg:block ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.6s' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg shadow-brand/10">
              <Star className="h-4 w-4 fill-brand text-brand" aria-hidden />
              {t('contact.badgeRating')}
            </span>
          </div>
          <div
            className={`pointer-events-none absolute right-[6%] bottom-[18%] z-20 hidden animate-float xl:block ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: '1.6s' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg shadow-brand/10">
              <Globe2 className="h-4 w-4 text-brand" aria-hidden />
              {t('contact.labelWorldwide')}
            </span>
          </div>
          <div
            className={`pointer-events-none absolute bottom-[-12px] left-[42%] z-20 hidden -translate-x-1/2 animate-float lg:block ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.9s' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg shadow-brand/10">
              <Sparkles className="h-4 w-4 text-brand" aria-hidden />
              {t('contact.badgeTutors')}
            </span>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-[1.65fr_1fr] lg:gap-12 xl:gap-14">
            {/* Left — consultation form */}
            <div
              className={`relative rounded-[32px] border border-gray-100/80 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(79,124,255,0.25)] sm:p-8 lg:p-10 ${
                visible ? 'animate-fade-up' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.12s' }}
            >
              {/* Corner badge */}
              <span className="absolute -top-3 right-6 inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand/35 sm:right-8">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                TOEFL Experts
              </span>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="consult-name"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      {t('contact.name')}
                    </label>
                    <input
                      id="consult-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="consult-email"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      {t('contact.email')}
                    </label>
                    <input
                      id="consult-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="consult-phone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      {t('contact.phone')}
                    </label>
                    <input
                      id="consult-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputClass}
                      placeholder="+1 555 000 0000"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="consult-score"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      {t('contact.score')}
                    </label>
                    <input
                      id="consult-score"
                      type="text"
                      value={form.toeflScore}
                      onChange={(e) =>
                        setForm({ ...form, toeflScore: e.target.value })
                      }
                      className={inputClass}
                      placeholder="e.g. 100+"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="consult-goal"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    {t('contact.goal')}
                  </label>
                  <select
                    id="consult-goal"
                    required
                    value={form.goal}
                    onChange={(e) =>
                      setForm({ ...form, goal: e.target.value as Goal })
                    }
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" disabled>
                      Select your goal
                    </option>
                    {goals.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="consult-message"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="consult-message"
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us about your goals, timeline, or questions…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitState === 'sending'}
                  className="group mt-2 w-full rounded-2xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/35 disabled:opacity-60"
                >
                  {submitState === 'sending'
                    ? 'Sending…'
                    : submitState === 'ok'
                      ? 'Request sent'
                      : t('contact.submit')}
                </button>
                {submitError ? (
                  <p className="text-center text-sm text-red-600">{submitError}</p>
                ) : null}

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1 font-medium text-ink">
                    <span className="tracking-tight text-brand" aria-hidden>
                      ★★★★★
                    </span>
                    4.9 Rating
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                  <span>2500+ students</span>
                </div>
              </form>
            </div>

            {/* Right — contact card */}
            <div
              className={`relative flex flex-col overflow-hidden rounded-[32px] bg-gradient-to-br from-brand via-brand to-brand-dark p-6 text-white shadow-[0_24px_60px_-18px_rgba(79,124,255,0.55)] sm:p-8 ${
                visible ? 'animate-fade-up' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.28s' }}
            >
              <div
                className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-10 -left-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
                aria-hidden
              />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <MessageCircle className="h-8 w-8" aria-hidden />
              </div>

              <h3 className="relative mt-6 text-2xl font-bold tracking-tight">
                {t('contact.infoTitle')}
              </h3>
              <p className="relative mt-2 text-sm text-white/75">
                {t('contact.infoBody')}
              </p>

              <ul className="relative mt-6 flex flex-1 flex-col gap-2.5">
                {contactItems.map((item) => {
                  const Icon = item.icon
                  const label =
                    item.label === 'Worldwide'
                      ? t('contact.labelWorldwide')
                      : item.label === 'Response Time'
                        ? t('contact.labelResponse')
                        : item.label
                  const value =
                    item.label === 'Worldwide'
                      ? t('contact.worldwide')
                      : item.label === 'Response Time'
                        ? t('contact.response')
                        : item.value
                  const content = (
                    <>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block text-xs font-medium text-white/65">
                          {label}
                        </span>
                        <span className="block truncate text-sm font-semibold">
                          {value}
                        </span>
                      </span>
                    </>
                  )

                  return (
                    <li key={item.label}>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5 transition hover:bg-white/15"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5">
                          {content}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="relative mt-6 border-t border-white/15 pt-5">
                <p className="text-sm font-semibold">Need immediate help?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href="https://t.me/englishcore"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Telegram →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
