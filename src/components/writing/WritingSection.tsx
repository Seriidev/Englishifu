import { useEffect, useState } from 'react'
import type { WritingSectionConfig, WritingTask } from './types'
import {
  aggregateWritingBand,
  scoreBuildSentence,
  taskLabel,
} from '../../scoring/writingScoring'
import type { SectionScore } from '../../scoring/overallScoring'
import {
  createDeadline,
  formatCountdown,
  useDeadlineTimer,
  useOnDeadlineExpire,
} from '../../speaking/hooks/useDeadlineTimer'
import TestShell from '../toefl/TestShell'
import BuildSentence from './BuildSentence'
import WriteEmail from './WriteEmail'
import AcademicDiscussion from './AcademicDiscussion'

type Stage = 'intro' | 'task' | 'results'

interface Props {
  config: WritingSectionConfig
  onExit: () => void
  onComplete?: (score: SectionScore) => void
}

export default function WritingSection({ config, onExit, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [deadline, setDeadline] = useState<number | null>(null)

  const task = config.tasks[index]
  const timer = useDeadlineTimer(
    deadline,
    (task?.timeLimitSeconds ?? 1) * 1000,
  )

  useEffect(() => {
    if (stage !== 'task' || !task) {
      setDeadline(null)
      return
    }
    setDeadline(createDeadline(task.timeLimitSeconds))
  }, [stage, task?.id, task?.timeLimitSeconds])

  const advance = (score: number) => {
    const nextScores = [...scores, score]
    setScores(nextScores)
    if (index + 1 < config.tasks.length) {
      setIndex((i) => i + 1)
    } else {
      const band = aggregateWritingBand(nextScores)
      if (onComplete) {
        onComplete({ rawScore: band.rawScore, bandScore: band.bandScore })
        return
      }
      setStage('results')
      setDeadline(null)
    }
  }

  useOnDeadlineExpire(deadline, () => {
    if (stage === 'task') advance(1)
  })

  const handleTaskSubmit = (task: WritingTask, payload: string[] | string) => {
    if (task.type === 'build-sentence' && Array.isArray(payload)) {
      advance(scoreBuildSentence(payload, task.correctSentence ?? ''))
      return
    }
    // MVP: length-based heuristic self-proxy (replace with LLM later)
    const text = typeof payload === 'string' ? payload : ''
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const min = task.minWords ?? 60
    if (words >= min + 40) advance(4)
    else if (words >= min) advance(3)
    else advance(2)
  }

  if (stage === 'intro') {
    return (
      <TestShell title="TOEFL Writing" subtitle="2026 format · 12-style practice set" progressLabel="Ready" progressPercent={0} onExit={onExit}>
        <div className="mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Writing Section</h2>
          <p className="mt-3 text-sm text-muted">
            Build a Sentence, Write an Email, and Academic Discussion subtypes.
            Each task has its own timer. No backtracking.
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setIndex(0)
              setScores([])
              setStage('task')
            }}
          >
            Begin Writing
          </button>
        </div>
      </TestShell>
    )
  }

  if (stage === 'results') {
    const band = aggregateWritingBand(scores)
    return (
      <TestShell title="TOEFL Writing" subtitle="Results" progressLabel="Complete" progressPercent={100} onExit={onExit}>
        <div className="mx-auto max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Writing Complete</h2>
          <p className="mt-2 text-sm text-muted">
            MVP heuristic scoring (LLM rubric ready in writingScoring.ts)
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-brand-light p-3">
              <p className="text-xl font-bold">{band.rawScore}</p>
              <p className="text-xs text-muted">Raw / {band.maxRaw}</p>
            </div>
            <div className="rounded-2xl bg-brand-light p-3">
              <p className="text-xl font-bold text-brand">{band.bandScore.toFixed(1)}</p>
              <p className="text-xs text-muted">Band</p>
            </div>
            <div className="rounded-2xl bg-brand-light p-3">
              <p className="text-xl font-bold">{band.cefr}</p>
              <p className="text-xs text-muted">CEFR</p>
            </div>
          </div>
          <button type="button" onClick={onExit} className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
            Exit
          </button>
        </div>
      </TestShell>
    )
  }

  if (!task) return null

  return (
    <TestShell
      title="TOEFL Writing"
      subtitle={taskLabel(task)}
      progressLabel={`Task ${index + 1} of ${config.tasks.length}`}
      progressPercent={(index / config.tasks.length) * 100}
      timer={
        <div
          className={`rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
            timer.isUrgent ? 'bg-red-50 text-red-600' : 'bg-brand-light text-brand'
          }`}
        >
          {formatCountdown(timer.remainingMs)}
        </div>
      }
      onExit={onExit}
    >
      <div className="flex flex-1 flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        {task.type === 'build-sentence' && task.wordBank && (
          <BuildSentence
            key={task.id}
            wordBank={task.wordBank}
            onSubmit={(ordered) => handleTaskSubmit(task, ordered)}
          />
        )}
        {task.type === 'write-email' && (
          <WriteEmail
            key={task.id}
            prompt={task.prompt}
            contextInfo={task.contextInfo}
            minWords={task.minWords}
            maxWords={task.maxWords}
            onSubmit={(text) => handleTaskSubmit(task, text)}
          />
        )}
        {task.type === 'academic-discussion' && (
          <AcademicDiscussion
            key={task.id}
            prompt={task.prompt}
            subtype={task.subtype}
            minWords={task.minWords}
            maxWords={task.maxWords}
            onSubmit={(text) => handleTaskSubmit(task, text)}
          />
        )}
      </div>
    </TestShell>
  )
}
