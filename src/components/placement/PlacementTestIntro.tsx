import { ClipboardList } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import LangSwitcher from '../shared/LangSwitcher'

interface Props {
  onStart: () => void
  onExit: () => void
}

export default function PlacementTestIntro({ onStart, onExit }: Props) {
  const { t } = useLanguage()

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
        >
          {t('placement.back')}
        </button>
        <LangSwitcher />
      </div>
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <ClipboardList className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {t('placement.introTitle')}
      </h1>

      <ul className="mt-6 w-full space-y-2 rounded-2xl bg-brand-light/50 p-5 text-left text-sm text-ink">
        <li>• {t('placement.bullet1')}</li>
        <li>• {t('placement.bullet2')}</li>
        <li>• {t('placement.bullet3')}</li>
      </ul>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        {t('placement.start')}
      </button>
    </div>
  )
}
