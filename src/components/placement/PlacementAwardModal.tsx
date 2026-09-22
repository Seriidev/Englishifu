import { useNavigate } from 'react-router-dom'
import CefrLevelBadge from '../profile/CefrLevelBadge'
import { useLanguage } from '../../i18n/LanguageContext'
import type { PlacementResult } from '../../scoring/placementScoring'

interface Props {
  result: PlacementResult
  awarded: boolean
  onClose: () => void
}

export default function PlacementAwardModal({ result, awarded, onClose }: Props) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="placement-award-title"
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"
      >
        <h2 id="placement-award-title" className="text-2xl font-bold text-ink">
          {t('placement.awardTitle')}
        </h2>
        <div className="mt-6 flex justify-center">
          <CefrLevelBadge level={result.cefrLevel} size="lg" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {awarded
            ? t('placement.awardStudent', { level: result.cefrLevel })
            : t('placement.awardGuest', { level: result.cefrLevel })}
        </p>
        {awarded ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            {t('placement.awardContinue')}
          </button>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate('/signup/student')}
              className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
            >
              {t('placement.awardRegister')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              {t('placement.awardLogin')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              {t('placement.awardLater')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
