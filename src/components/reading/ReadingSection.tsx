import { useCallback, useMemo, useRef, useState } from 'react'
import toeflReadingJson from '../../data/toefl-reading.json'
import type { ReadingSession, ToeflReadingBank } from './types'
import {
  countSessionAnswers,
  getRandomSession,
} from './getRandomSession'
import type { SectionScore } from '../../scoring/overallScoring'
import TestShell from '../toefl/TestShell'
import SectionTimer from '../toefl/SectionTimer'
import CompleteTheWordsView from './CompleteTheWordsView'
import ReadInDailyLifeView from './ReadInDailyLifeView'

const readingBank = toeflReadingJson as ToeflReadingBank
const SECTION_TIME_SECONDS = 27 * 60

type Stage = 'intro' | 'running' | 'results'

type SessionStep =
  | { kind: 'complete_the_words'; id: string }
  | { kind: 'read_in_daily_life'; id: string }

interface ReadingSectionProps {
  onExit: () => void
  /** When set, skips the results screen and reports score to the parent (full test). */
  onComplete?: (score: SectionScore) => void
}

export default function ReadingSection({
  onExit,
  onComplete,
}: ReadingSectionProps) {
  const [stage, setStage] = useState<Stage>('intro')
  const [session, setSession] = useState<ReadingSession | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const correctRef = useRef(0)
  const totalRef = useRef(0)

  const steps = useMemo<SessionStep[]>(() => {
    if (!session) return []
    return [
      ...session.complete_the_words.map((passage) => ({
        kind: 'complete_the_words' as const,
        id: passage.id,
      })),
      ...session.read_in_daily_life.map((item) => ({
        kind: 'read_in_daily_life' as const,
        id: item.id,
      })),
    ]
  }, [session])

  const totalAnswers = session ? countSessionAnswers(session) : 0
  const progressPercent =
    totalAnswers === 0 ? 0 : (answeredCount / totalAnswers) * 100
  const current = steps[stepIndex]
  correctRef.current = correctCount
  totalRef.current = totalAnswers

  const toScore = useCallback(
    (correct: number, total: number): SectionScore => {
      const accuracy = total === 0 ? 0 : correct / total
      const bandScore = Math.max(0, Math.min(6, Math.round(accuracy * 6 * 2) / 2))
      return { rawScore: correct, bandScore }
    },
    [],
  )

  const begin = () => {
    const next = getRandomSession(readingBank)
    setSession(next)
    setStepIndex(0)
    setCorrectCount(0)
    setAnsweredCount(0)
    setTimerRunning(true)
    setStage('running')
  }

  const finish = useCallback(
    (correct: number, total: number) => {
      setTimerRunning(false)
      const score = toScore(correct, total)
      if (onComplete) {
        onComplete(score)
        return
      }
      setStage('results')
    },
    [onComplete, toScore],
  )

  const handleExpire = useCallback(() => {
    finish(correctRef.current, totalRef.current)
  }, [finish])

  const handleStepContinue = (correct: number, total: number) => {
    const nextCorrect = correctCount + correct
    const nextAnswered = answeredCount + total
    setCorrectCount(nextCorrect)
    setAnsweredCount(nextAnswered)

    if (stepIndex + 1 < steps.length) {
      setStepIndex((i) => i + 1)
      return
    }
    finish(nextCorrect, nextAnswered)
  }

  if (stage === 'intro') {
    return (
      <TestShell
        title="TOEFL Reading"
        subtitle={readingBank.meta.title}
        progressLabel="Ready"
        progressPercent={0}
        onExit={onExit}
      >
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Reading Section</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Each attempt draws a new set of passages: complete the missing
            letters, then read everyday emails, announcements, and text chains.
            You cannot go back after submitting. Section time: 27 minutes.
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white"
            onClick={begin}
          >
            Begin Reading
          </button>
        </div>
      </TestShell>
    )
  }

  if (stage === 'results' || !session || !current) {
    return (
      <TestShell
        title="TOEFL Reading"
        subtitle="Results"
        progressLabel="Complete"
        progressPercent={100}
        onExit={onExit}
      >
        <ResultsCard
          correctCount={correctCount}
          totalAnswers={totalAnswers}
          score={toScore(correctCount, totalAnswers)}
          onExit={onExit}
          onRetry={begin}
        />
      </TestShell>
    )
  }

  const partLabel =
    current.kind === 'complete_the_words'
      ? 'Complete the words'
      : 'Read in daily life'
  const partNumber = stepIndex + 1

  return (
    <TestShell
      title="TOEFL Reading"
      subtitle={partLabel}
      progressLabel={`Part ${partNumber} of ${steps.length} · ${answeredCount}/${totalAnswers} answers`}
      progressPercent={progressPercent}
      timer={
        <SectionTimer
          totalSeconds={SECTION_TIME_SECONDS}
          running={timerRunning}
          onExpire={handleExpire}
        />
      }
      onExit={onExit}
    >
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        {current.kind === 'complete_the_words' ? (
          <CompleteTheWordsView
            key={current.id}
            passage={session.complete_the_words.find((p) => p.id === current.id)!}
            onContinue={handleStepContinue}
          />
        ) : (
          <ReadInDailyLifeView
            key={current.id}
            item={session.read_in_daily_life.find((p) => p.id === current.id)!}
            onContinue={handleStepContinue}
          />
        )}
      </div>
    </TestShell>
  )
}

function ResultsCard({
  correctCount,
  totalAnswers,
  score,
  onExit,
  onRetry,
}: {
  correctCount: number
  totalAnswers: number
  score: SectionScore
  onExit: () => void
  onRetry: () => void
}) {
  const accuracy =
    totalAnswers === 0 ? 0 : Math.round((correctCount / totalAnswers) * 100)

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-bold text-ink">Reading Complete</h2>
      <p className="mt-2 text-sm text-muted">
        Score is the number of correct answers in this session.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Correct" value={`${correctCount}/${totalAnswers}`} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Band" value={score.bandScore.toFixed(1)} />
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-full border px-5 py-2.5 text-sm font-semibold"
        >
          Exit
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-brand-light p-3">
      <p className="text-xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}
