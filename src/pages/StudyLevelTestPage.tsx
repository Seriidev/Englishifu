import { useNavigate } from 'react-router-dom'
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import CefrLevelBadge from '../components/profile/CefrLevelBadge'

const PLACEMENT_START_STATE = {
  returnTo: '/study/level-test',
  start: true,
} as const

export default function StudyLevelTestPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const student = user?.role === 'student' ? user : null
  const cefrLevel = student?.cefrLevel

  const startTest = () => {
    navigate('/placement', { state: PLACEMENT_START_STATE })
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <HiOutlineClipboardDocumentList className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {t('placement.introTitle')}
          </h2>
          <p className="mt-1 text-sm font-medium text-indigo-600">
            {t('placement.introSubtitle')}
          </p>
        </div>
      </div>

      {cefrLevel ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-5">
          <p className="text-sm font-semibold text-slate-500">
            Your current level
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CefrLevelBadge level={cefrLevel} size="lg" />
            {student?.placementCompletedAt ? (
              <p className="text-sm text-slate-600">
                {new Date(student.placementCompletedAt).toLocaleDateString()}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="mt-5 text-sm leading-relaxed text-slate-600">
        {t('placement.introBody')}
      </p>
      <p className="mt-2 text-xs font-medium text-indigo-600">
        {t('placement.introNote')}
      </p>

      <ul className="mt-5 space-y-2 rounded-2xl bg-indigo-50 p-5 text-sm text-slate-800">
        <li>• {t('placement.bullet1')}</li>
        <li>• {t('placement.bullet2')}</li>
        <li>• {t('placement.bullet3')}</li>
      </ul>

      <button
        type="button"
        onClick={startTest}
        className="mt-6 inline-flex rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        {cefrLevel ? t('placement.retake') : t('placement.start')}
      </button>
    </section>
  )
}
