import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function PlacementTestCTA() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <section id="placement" className="relative z-10 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[1.75rem] bg-brand px-5 py-5 shadow-lg shadow-brand/25 sm:flex-row sm:items-center sm:gap-8 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-4 sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {t('placement.ctaTitle')}
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/90 sm:text-[15px]">
                {t('placement.ctaBody')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/placement', { state: { returnTo: '/' } })}
            className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-white/25 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/35 sm:w-auto"
          >
            {t('placement.ctaButton')}
          </button>
        </div>
      </div>
    </section>
  )
}
