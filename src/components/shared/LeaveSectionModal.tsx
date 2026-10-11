import { useEffect } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'

interface LeaveSectionModalProps {
  title: string
  message: string
  onStay: () => void
  onLeave: () => void
}

export default function LeaveSectionModal({
  title,
  message,
  onStay,
  onLeave,
}: LeaveSectionModalProps) {
  const { t } = useLanguage()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onStay()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onStay])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 px-4"
      role="presentation"
      onClick={onStay}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-section-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="leave-section-title" className="text-2xl font-bold text-ink">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onStay}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {t('toefl.stay')}
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            {t('toefl.leave')}
          </button>
        </div>
      </div>
    </div>
  )
}
