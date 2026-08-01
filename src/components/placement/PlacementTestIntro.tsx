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
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
        >
          {t('placement.exit')}
        </button>
        <LangSwitcher />
      </div>
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <ClipboardList className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {t('placement.introTitle')}
      </h1>
      <p className="mt-2 text-sm font-semibold text-brand">
        {t('placement.introSubtitle')}
      </p>
      <p className="mt-4 text-base leading-relaxed text-muted">
        {t('placement.introBody')}
      </p>
      <p className="mt-2 text-xs font-medium text-brand">
        {t('placement.introNote')}
      </p>

      <ul className="mt-6 w-full space-y-2 rounded-2xl bg-brand-light/50 p-5 text-left text-sm text-ink">
        <li>• {t('placement.bullet1')}</li>
        <li>• {t('placement.bullet2')}</li>
        <li>• {t('placement.bullet3')}</li>
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-ink hover:bg-gray-50"
        >
          {t('placement.back')}
        </button>
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow-md shadow-brand/25 hover:bg-brand-dark"
        >
          {t('placement.start')}
        </button>
      </div>
    </div>
  )
}
