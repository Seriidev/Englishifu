import { useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import type { PlacementResult } from '../../scoring/placementScoring'
import { useLanguage } from '../../i18n/LanguageContext'
import LangSwitcher from '../shared/LangSwitcher'

interface Props {
  result: PlacementResult
  onRetake: () => void
  onExit: () => void
}

const PATHS: Record<string, string> = {
  A1: '/#contact',
  A2: '/#speaking-club',
  B1: '/#speaking-club',
  B2: '/toefl',
  C1: '/toefl',
}

export default function PlacementResults({ result, onRetake, onExit }: Props) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const levelKey = `placement.level.${result.levelLabel}`
  const levelLabel = t(levelKey)

  const goToRecommendation = () => {
    const path = PATHS[result.cefrLevel] ?? '/toefl'
    if (path.startsWith('/#')) {
      navigate('/')
      window.setTimeout(() => {
        document.getElementById(path.slice(2))?.scrollIntoView({
          behavior: 'smooth',
        })
      }, 80)
      return
    }
    navigate(path)
  }

  return (
    <div className="min-h-svh bg-[#f7f9fc]">
      <div className="mx-auto max-w-xl px-6 py-14">
        <div className="mb-6 flex justify-end">
          <LangSwitcher />
        </div>
        <p className="text-center text-xs font-bold tracking-[0.2em] text-brand uppercase">
          {t('placement.resultTitle')}
        </p>
        <h1 className="mt-3 text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {result.cefrLevel} — {levelLabel}
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          {t('placement.score', {
            score: result.rawScore,
            total: result.totalQuestions,
          })}
        </p>

        <div className="mt-8 rounded-3xl border border-brand/15 bg-white p-8 text-center shadow-sm">
          <p className="text-6xl font-bold tracking-tight text-brand">
            {result.cefrLevel}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">{levelLabel}</p>
          <div className="mx-auto mt-6 h-2 max-w-xs overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand"
              style={{
                width: `${(result.rawScore / result.totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold tracking-wide text-brand uppercase">
            {t('placement.nextStep')}
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink">
            {t(`placement.rec.${result.cefrLevel}`)}
          </p>
          <button
            type="button"
            onClick={goToRecommendation}
            className="mt-5 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {t(`placement.cta.${result.cefrLevel}`)}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-ink hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t('placement.retake')}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-ink hover:bg-gray-50"
          >
            {t('placement.backHome')}
          </button>
        </div>
      </div>
    </div>
  )
}
