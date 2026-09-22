import { useCallback, useMemo, useRef, useState } from 'react'
import toeflListeningJson from '../../data/toefl-listening.json'
import type { ListeningPlayable, ListeningSession, ToeflListeningBank } from './types'
import {
  countSessionAnswers,
  findAcademicTalk,
  findAnnouncement,
  findConversation,
  findListenAndChoose,
  getRandomListeningSession,
  listeningStepLabel,
  questionsForItem,
} from './getRandomListeningSession'
import type { SectionScore } from '../../scoring/overallScoring'
import TestShell from '../toefl/TestShell'
import SectionTimer from '../toefl/SectionTimer'
import ListeningTaskView from './ListeningTaskView'

const listeningBank = toeflListeningJson as ToeflListeningBank
const SECTION_TIME_SECONDS = 36 * 60

type Stage = 'intro' | 'running' | 'results'

type SessionStep =
  | { kind: 'listen_and_choose'; id: string }
  | { kind: 'listen_to_a_conversation'; id: string }
  | { kind: 'listen_to_an_announcement'; id: string }
  | { kind: 'listen_to_an_academic_talk'; id: string }

interface ListeningSectionProps {
  onExit: () => void
  /** When set, skips the results screen and reports score to the parent (full test). */
  onComplete?: (score: SectionScore) => void
}

export default function ListeningSection({
  onExit,
  onComplete,
}: ListeningSectionProps) {
  const [stage, setStage] = useState<Stage>('intro')
  const [session, setSession] = useState<ListeningSession | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const correctRef = useRef(0)
  const totalRef = useRef(0)

  const steps = useMemo<SessionStep[]>(() => {
    if (!session) return []
    return [
      ...session.listen_and_choose.map((item) => ({
        kind: 'listen_and_choose' as const,
        id: item.id,
      })),
      ...session.listen_to_a_conversation.map((item) => ({
        kind: 'listen_to_a_conversation' as const,
        id: item.id,
      })),
      ...session.listen_to_an_announcement.map((item) => ({
        kind: 'listen_to_an_announcement' as const,
        id: item.id,
      })),
      ...session.listen_to_an_academic_talk.map((item) => ({
        kind: 'listen_to_an_academic_talk' as const,
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

  const toScore = useCallback((correct: number, total: number): SectionScore => {
    const accuracy = total === 0 ? 0 : correct / total
    const bandScore = Math.max(0, Math.min(6, Math.round(accuracy * 6 * 2) / 2))
    return { rawScore: correct, bandScore }
  }, [])

  const begin = () => {
    const next = getRandomListeningSession(listeningBank)
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
        title="TOEFL Listening"
        subtitle={listeningBank.meta.title}
        progressLabel="Ready"
        progressPercent={0}
        onExit={onExit}
      >
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Listening Section</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Each attempt draws a new set: five short replies, two conversations,
            two announcements, and one academic talk. Audio plays once. Speakers
            are never announced — listen for the voices. You cannot go back after
            submitting. Section time: 36 minutes.
          </p>
          <button
            type="button"
            className="mt-8 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
            onClick={begin}
          >
            Begin Listening
          </button>
        </div>
      </TestShell>
    )
  }

  if (stage === 'results' || !session || !current) {
    return (
      <TestShell
        title="TOEFL Listening"
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

  const playable = playableForStep(session, current)
  const questions = questionsForItem(current.kind, session, current.id)

  return (
    <TestShell
      title="TOEFL Listening"
      subtitle={listeningStepLabel(current.kind)}
      progressLabel={`Part ${stepIndex + 1} of ${steps.length} · ${answeredCount}/${totalAnswers} answers`}
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
        {playable ? (
          <ListeningTaskView
            key={`${current.kind}-${current.id}`}
            playable={playable}
            questions={questions}
            onContinue={handleStepContinue}
          />
        ) : null}
      </div>
    </TestShell>
  )
}

function playableForStep(
  session: ListeningSession,
  step: SessionStep,
): ListeningPlayable | null {
  if (step.kind === 'listen_and_choose') {
    const item = findListenAndChoose(session, step.id)
    return item ? { kind: 'listen_and_choose', item } : null
  }
  if (step.kind === 'listen_to_a_conversation') {
    const item = findConversation(session, step.id)
    return item ? { kind: 'listen_to_a_conversation', item } : null
  }
  if (step.kind === 'listen_to_an_announcement') {
    const item = findAnnouncement(session, step.id)
    return item ? { kind: 'listen_to_an_announcement', item } : null
  }
  const item = findAcademicTalk(session, step.id)
  return item ? { kind: 'listen_to_an_academic_talk', item } : null
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
      <h2 className="text-2xl font-bold text-ink">Listening Complete</h2>
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
          className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
        >
          Exit
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
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
