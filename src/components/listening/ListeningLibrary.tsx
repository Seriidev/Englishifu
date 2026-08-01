import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  LISTENING_TASK_TYPES,
  taskTypeLabel,
  type ListeningTaskType,
} from '../../types/listening'
import { listeningPractices } from '../../mocks/listeningMock'
import {
  formatSolvedCount,
  getLocalSolvedBonus,
} from '../../utils/listeningSolved'
import { useLanguage } from '../../i18n/LanguageContext'
import LangSwitcher from '../shared/LangSwitcher'

const PAGE_SIZE = 10

type FilterTab = 'all' | ListeningTaskType

const TASK_TABS = LISTENING_TASK_TYPES.map((t) => ({
  id: t.type as FilterTab,
  label: t.shortLabel,
}))

export default function ListeningLibrary() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const filter = (params.get('type') as FilterTab) || 'all'
  const page = Math.max(1, Number(params.get('page') || '1') || 1)

  const filtered = useMemo(() => {
    const list =
      filter === 'all'
        ? listeningPractices
        : listeningPractices.filter((p) => p.taskType === filter)
    return [...list].sort(
      (a, b) =>
        b.solvedCount - a.solvedCount ||
        a.numberLabel.localeCompare(b.numberLabel),
    )
  }, [filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const setFilter = (next: FilterTab) => {
    const p = new URLSearchParams()
    if (next !== 'all') p.set('type', next)
    p.set('page', '1')
    setParams(p)
  }

  const setPage = (next: number) => {
    const p = new URLSearchParams(params)
    p.set('page', String(next))
    setParams(p)
  }

  return (
    <div className="min-h-svh bg-[#f7f9fc]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/toefl')}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {t('listening.backHub')}
          </button>
          <LangSwitcher />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink">
          {t('listening.libraryTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t('listening.libraryBody')}{' '}
          <button
            type="button"
            onClick={() => navigate('/listening/adaptive')}
            className="font-semibold text-brand hover:underline"
          >
            {t('listening.adaptiveLink')}
          </button>
          .
        </p>
        <p className="mt-1 text-xs font-medium text-brand">
          {t('toefl.questionsInEnglish')}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {([{ id: 'all' as FilterTab, label: t('listening.all') }, ...TASK_TABS]).map(
            (tab) => {
              const active = filter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-brand text-white'
                      : 'bg-white text-muted ring-1 ring-gray-200 hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              )
            },
          )}
        </div>

        <ul className="mt-8 space-y-3">
          {slice.map((practice) => {
            const solved =
              practice.solvedCount + getLocalSolvedBonus(practice.id)
            return (
              <li
                key={practice.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-brand">
                    {practice.numberLabel}
                  </p>
                  <h2 className="mt-1 text-base font-bold text-ink">
                    {practice.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {taskTypeLabel(practice.taskType)} ·{' '}
                    {t('listening.done', {
                      count: formatSolvedCount(solved),
                    })}{' '}
                    ·{' '}
                    {t(
                      practice.questions.length === 1
                        ? 'listening.question'
                        : 'listening.questions',
                      { count: practice.questions.length },
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/listening/practice/${practice.id}`)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  {t('listening.start')}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>

        {slice.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">
            No practices in this category yet.
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              {t('listening.prev')}
            </button>
            <span className="text-sm text-muted">
              {t('listening.page', { current: safePage, total: totalPages })}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              {t('listening.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
