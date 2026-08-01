import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChartColumn } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function PlacementTestCTA() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <section
      id="placement"
      className="relative z-10 -mt-2 border-y border-[#c7d7f5]/50 bg-gradient-to-br from-[#e8f1ff]/70 via-[#eef0ff]/40 to-transparent py-6 sm:py-8"
    >
      {/* Same width as header: max-w-6xl + side padding */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[#c7d7f5]/80 bg-white/90 p-6 shadow-sm shadow-brand/5 backdrop-blur-sm sm:flex-row sm:items-center sm:p-8">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <ChartColumn className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {t('placement.ctaTitle')}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                {t('placement.ctaBody')}
              </p>
            </div>
          </div>

          <div className="w-full shrink-0 sm:w-auto sm:text-right">
            <button
              type="button"
              onClick={() => navigate('/placement')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark sm:w-auto"
            >
              {t('placement.ctaButton')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <p className="mt-2 text-xs text-muted">{t('placement.ctaMeta')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
