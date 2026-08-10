import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PLACEMENT_QUESTIONS } from '../../data/placementQuestions'
import {
  scorePlacementAnswers,
  type PlacementResult,
} from '../../scoring/placementScoring'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import LangSwitcher from '../shared/LangSwitcher'
import PlacementTestIntro from './PlacementTestIntro'
import PlacementResults from './PlacementResults'

type Stage = 'intro' | 'questions' | 'results'

interface Props {
  onExit: () => void
}

export default function PlacementTestFlow({ onExit }: Props) {
  const { t } = useLanguage()
  const { user, savePlacementResult } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const questions = PLACEMENT_QUESTIONS
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<PlacementResult | null>(null)

  const current = questions[index]
  const selected = current ? answers[current.id] : undefined
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  )

  const returnTo =
    typeof (location.state as { returnTo?: unknown } | null)?.returnTo ===
    'string'
      ? (location.state as { returnTo: string }).returnTo
      : null

  const handleExit = () => {
    if (returnTo && returnTo.startsWith('/')) {
      navigate(returnTo, { replace: true })
      return
    }
    onExit()
  }

  const finish = async () => {
    const scored = scorePlacementAnswers(answers, questions)
    if (user?.role === 'student') {
      await savePlacementResult({
        cefrLevel: scored.cefrLevel,
        completedAt: scored.completedAt,
      })
    }
    setResult(scored)
    setStage('results')
  }

  const goNext = () => {
    if (index + 1 < questions.length) setIndex((i) => i + 1)
    else void finish()
  }

  const goBack = () => {
    if (index > 0) setIndex((i) => i - 1)
  }

  if (stage === 'intro') {
    return (
      <div className="min-h-svh bg-[#f7f9fc]">
        <div className="mx-auto flex min-h-svh max-w-3xl flex-col bg-white shadow-sm sm:my-6 sm:min-h-[640px] sm:rounded-3xl sm:border sm:border-gray-100">
          <PlacementTestIntro
            onStart={() => {
              setIndex(0)
              setAnswers({})
              setResult(null)
              setStage('questions')
            }}
            onExit={handleExit}
          />
        </div>
      </div>
    )
  }

  if (stage === 'results' && result) {
    return (
      <PlacementResults
        result={result}
        onRetake={() => {
          setIndex(0)
          setAnswers({})
          setResult(null)
          setStage('intro')
        }}
        onExit={handleExit}
      />
    )
  }

  if (!current) return null

  const progress = ((index + 1) / questions.length) * 100

  return (
    <div className="min-h-svh bg-[#f7f9fc]">
      <div className="mx-auto flex min-h-svh max-w-3xl flex-col bg-white shadow-sm sm:my-6 sm:min-h-[640px] sm:rounded-3xl sm:border sm:border-gray-100">
        <header className="border-b border-gray-100 px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-wide text-brand uppercase">
                Placement Test
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {t('placement.questionOf', {
                  current: index + 1,
                  total: questions.length,
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LangSwitcher />
              <button
                type="button"
                onClick={handleExit}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
              >
                {t('placement.exit')}
              </button>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {t('placement.answered', { count: answeredCount })}
          </p>
        </header>

        <div className="flex-1 flex flex-col px-5 py-6 sm:px-8">
          {current.context && (
            <p className="rounded-2xl bg-brand-light/60 px-4 py-3 text-sm leading-relaxed text-ink whitespace-pre-wrap">
              {current.context}
            </p>
          )}
          {current.prompt && (
            <p className="mt-4 text-lg font-semibold text-ink">
              {current.prompt === 'Choose the correct option.'
                ? t('placement.chooseOption')
                : current.prompt}
            </p>
          )}

          <div className="mt-6 space-y-2.5">
            {current.options.map((opt, optIndex) => {
              const active = selected === optIndex
              return (
                <button
                  key={`${current.id}-${optIndex}`}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [current.id]: optIndex }))
                  }
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                    active
                      ? 'border-brand bg-brand-light text-ink'
                      : 'border-gray-200 hover:border-brand/40'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active ? 'bg-brand text-white' : 'bg-gray-100 text-ink'
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className="pt-0.5">{opt}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={goBack}
              disabled={index === 0}
              className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-ink hover:bg-gray-50 disabled:opacity-40"
            >
              {t('placement.back')}
            </button>
            <button
              type="button"
              disabled={selected == null}
              onClick={goNext}
              className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {index + 1 === questions.length
                ? t('placement.seeResults')
                : t('placement.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
