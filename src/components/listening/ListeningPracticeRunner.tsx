import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getListeningPractice } from '../../mocks/listeningMock'
import { practiceToItems, taskTypeLabel } from '../../types/listening'
import {
  blanksCorrect,
  scoreObjectiveSection,
} from '../../scoring/readingListeningScoring'
import { incrementPracticeSolved } from '../../utils/listeningSolved'
import ListeningItemView, {
  type ListeningAnswerPayload,
} from './ListeningItemView'
import TestShell from '../toefl/TestShell'
import { useLanguage } from '../../i18n/LanguageContext'

export default function ListeningPracticeRunner() {
  const { practiceId } = useParams<{ practiceId: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const practice = practiceId ? getListeningPractice(practiceId) : undefined

  const items = useMemo(
    () => (practice ? practiceToItems(practice) : []),
    [practice],
  )

  const [qIndex, setQIndex] = useState(0)
  const [correctFlags, setCorrectFlags] = useState<boolean[]>([])
  const [done, setDone] = useState(false)

  if (!practice) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-ink">Practice not found</p>
          <button
            type="button"
            onClick={() => navigate('/listening')}
            className="mt-4 text-sm font-semibold text-brand hover:underline"
          >
            Back to library
          </button>
        </div>
      </div>
    )
  }

  const current = items[qIndex]

  const grade = (payload: ListeningAnswerPayload): boolean => {
    if (!current) return false
    if (payload.type === 'fill-in-blank') {
      return blanksCorrect(payload.blanks, current.blankAnswers ?? [])
    }
    if (payload.type === 'multiple-choice') {
      return payload.optionIndex === current.correctOptionIndex
    }
    const expected = current.correctHotspotMapping ?? {}
    return Object.keys(expected).every((k) => payload.mapping[k] === expected[k])
  }

  const handleSubmit = (payload: ListeningAnswerPayload) => {
    const ok = grade(payload)
    const nextFlags = [...correctFlags, ok]
    setCorrectFlags(nextFlags)

    if (qIndex + 1 < items.length) {
      setQIndex((i) => i + 1)
      return
    }

    incrementPracticeSolved(practice.id)
    setDone(true)
  }

  if (done) {
    const score = scoreObjectiveSection(
      correctFlags.map((correct) => ({
        correct,
        tier: practice.difficultyTier,
      })),
    )
    return (
      <TestShell
        title={practice.numberLabel}
        subtitle={taskTypeLabel(practice.taskType)}
        progressLabel="Complete"
        progressPercent={100}
        onExit={() => navigate('/listening')}
      >
        <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">
            {t('listening.practiceComplete')}
          </h2>
          <p className="mt-2 text-sm text-muted">{practice.title}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-brand-light p-3">
              <p className="text-xl font-bold">
                {correctFlags.filter(Boolean).length}/{items.length}
              </p>
              <p className="text-xs text-muted">{t('listening.correct')}</p>
            </div>
            <div className="rounded-2xl bg-brand-light p-3">
              <p className="text-xl font-bold text-brand">
                {score.bandScore.toFixed(1)}
              </p>
              <p className="text-xs text-muted">{t('common.band')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/listening')}
            className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
          >
            {t('listening.backLibrary')}
          </button>
        </div>
      </TestShell>
    )
  }

  if (!current) return null

  return (
    <TestShell
      title={practice.numberLabel}
      subtitle={practice.title}
      progressLabel={`Question ${qIndex + 1} of ${items.length}`}
      progressPercent={(qIndex / Math.max(items.length, 1)) * 100}
      onExit={() => navigate('/listening')}
    >
      <ListeningItemView
        key={current.id}
        item={current}
        playAudio={qIndex === 0}
        onSubmit={handleSubmit}
      />
    </TestShell>
  )
}
