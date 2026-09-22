import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'

export default function FullTestCTA() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-lg shadow-brand/20 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg">
          <p className="text-xs font-bold tracking-[0.2em] text-white/80 uppercase">
            {t('fullTest.eyebrow')}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t('fullTest.title')}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/full-test')}
          className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
        >
          {t('fullTest.start')}
        </button>
      </div>
    </div>
  )
}
