import type { ReactNode } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import LangSwitcher from '../shared/LangSwitcher'

interface TestShellProps {
  title: string
  subtitle: string
  progressLabel: string
  progressPercent: number
  timer?: ReactNode
  children: ReactNode
  onExit: () => void
}

export default function TestShell({
  title,
  subtitle,
  progressLabel,
  progressPercent,
  timer,
  children,
  onExit,
}: TestShellProps) {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-svh flex-col bg-[#f7f9fc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-bold tracking-wide text-brand uppercase">
              {title}
            </p>
            <p className="text-sm font-medium text-ink">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitcher />
            {timer}
            <button
              type="button"
              onClick={onExit}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
            >
              {t('toefl.exit')}
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>{progressLabel}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted">
            {t('toefl.questionsInEnglish')}
          </p>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
        {children}
      </div>
    </div>
  )
}
