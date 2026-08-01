import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Ear, Mic, PenLine } from 'lucide-react'
import FullTestCTA from './FullTestCTA'
import { registerToeflTryOnce } from '../../utils/toeflTryCounter'
import { useLanguage } from '../../i18n/LanguageContext'
import LangSwitcher from '../shared/LangSwitcher'

export default function ToeflHub() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  useEffect(() => {
    void registerToeflTryOnce()
  }, [])

  const sections = [
    {
      titleKey: 'toefl.reading',
      descKey: 'toefl.readingDesc',
      href: '/reading',
      icon: BookOpen,
    },
    {
      titleKey: 'toefl.listening',
      descKey: 'toefl.listeningDesc',
      href: '/listening',
      icon: Ear,
    },
    {
      titleKey: 'toefl.speaking',
      descKey: 'toefl.speakingDesc',
      href: '/speaking',
      icon: Mic,
    },
    {
      titleKey: 'toefl.writing',
      descKey: 'toefl.writingDesc',
      href: '/writing',
      icon: PenLine,
    },
  ] as const

  return (
    <div className="min-h-svh bg-[#f7f9fc]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {t('toefl.back')}
          </button>
          <LangSwitcher />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {t('toefl.hubTitle')}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t('toefl.hubBody')}</p>
        <p className="mt-2 text-xs font-medium text-brand">
          {t('toefl.questionsInEnglish')}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.href}
                type="button"
                onClick={() => navigate(s.href)}
                className="flex items-start gap-4 rounded-3xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <Icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-lg font-bold text-ink">
                    {t(s.titleKey)}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {t(s.descKey)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <FullTestCTA />
      </div>
    </div>
  )
}
