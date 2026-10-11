import { useState, type ReactNode } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import LeaveSectionModal from '../shared/LeaveSectionModal'

interface TestShellProps {
  title: string
  subtitle?: string
  progressLabel: string
  progressPercent: number
  timer?: ReactNode
  children: ReactNode
  onExit: () => void
  /** Ask before leaving an in-progress attempt. Full test handles this itself. */
  confirmExit?: boolean
}

export default function TestShell({
  title,
  subtitle,
  progressLabel,
  progressPercent,
  timer,
  children,
  onExit,
  confirmExit = false,
}: TestShellProps) {
  const { t } = useLanguage()
  const [leaveOpen, setLeaveOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col bg-[#f7f9fc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-wide text-brand uppercase">
              {title}
            </p>
            {subtitle ? (
              <p className="text-sm font-medium text-ink">{subtitle}</p>
            ) : null}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {timer}
            <button
              type="button"
              onClick={() => {
                if (confirmExit) setLeaveOpen(true)
                else onExit()
              }}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
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
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-10">
        {children}
      </div>
      {leaveOpen ? (
        <LeaveSectionModal
          title={t('toefl.leaveTitle')}
          message={t('toefl.leaveBody')}
          onStay={() => setLeaveOpen(false)}
          onLeave={onExit}
        />
      ) : null}
    </div>
  )
}
