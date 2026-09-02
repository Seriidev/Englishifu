import { useEffect, useState } from 'react'
import type { WritingSectionConfig, WritingTask } from './types'
import {
  aggregateWritingBand,
  heuristicWritingScore,
  scoreBuildSentence,
  scoreWritingWithAI,
  taskLabel,
  taskScoreFromWritingRubric,
} from '../../scoring/writingScoring'
import type { WritingRubricScore } from '../../types/aiRubric'
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

type Stage = 'intro' | 'task' | 'analyzing' | 'results'

interface TaskResult {
  taskId: string
  label: string
  score: number
  ai?: WritingRubricScore
  usedHeuristic?: boolean
}

interface Props {
  config: WritingSectionConfig
  onExit: () => void
  onComplete?: (score: SectionScore) => void
}

export default function WritingSection({ config, onExit, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [taskResults, setTaskResults] = useState<TaskResult[]>([])
  const [deadline, setDeadline] = useState<number | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

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

  const finishWithResults = (next: TaskResult[]) => {
    const scores = next.map((r) => r.score)
    const band = aggregateWritingBand(scores)
    if (onComplete) {
      onComplete({ rawScore: band.rawScore, bandScore: band.bandScore })
      return
    }
    setTaskResults(next)
    setStage('results')
    setDeadline(null)
  }

  const advance = (result: TaskResult) => {
    setTaskResults((prev) => {
      const next = [...prev, result]
      queueMicrotask(() => {
        if (next.length < config.tasks.length) {
          setIndex(next.length)
          setStage('task')
          setAnalyzeError(null)
        } else {
          finishWithResults(next)
        }
      })
      return next
    })
  }

  useOnDeadlineExpire(deadline, () => {
    if (stage === 'task' && task) {
      void handleTaskSubmit(task, task.type === 'build-sentence' ? [] : '')
    }
  })

  const handleTaskSubmit = async (current: WritingTask, payload: string[] | string) => {
    if (current.type === 'build-sentence' && Array.isArray(payload)) {
      const score = scoreBuildSentence(payload, current.correctSentence ?? '')
      advance({
        taskId: current.id,
        label: taskLabel(current),
        score,
      })
      return
    }

    const text = typeof payload === 'string' ? payload : ''
    const promptParts = [current.prompt, current.contextInfo].filter(Boolean)
    const prompt = promptParts.join('\n\n')

    setDeadline(null)
    setStage('analyzing')
    setAnalyzeError(null)

    try {
      const ai = await scoreWritingWithAI(current.type, prompt, text)
      advance({
        taskId: current.id,
        label: taskLabel(current),
        score: taskScoreFromWritingRubric(ai),
        ai,
      })
    } catch {
      setAnalyzeError(
        'AI scoring unavailable — using a length-based estimate for this task.',
      )
      advance({
        taskId: current.id,
        label: taskLabel(current),
        score: heuristicWritingScore(text, current.minWords ?? 60),
        usedHeuristic: true,
      })
    }
  }

  if (stage === 'intro') {
    return (
      <TestShell title="TOEFL Writing" subtitle="2026 format · 12-style practice set" progressLabel="Ready" progressPercent={0} onExit={onExit}>
        <div className="mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Writing Section</h2>
          <p className="mt-3 text-sm text-muted">
            Build a Sentence, Write an Email, and Academic Discussion subtypes.
            Free-response tasks are scored with AI rubrics (grammar, vocabulary,
            organization, task achievement).
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setIndex(0)
              setTaskResults([])
              setAnalyzeError(null)
              setStage('task')
            }}
          >
            Begin Writing
          </button>
        </div>
      </TestShell>
    )
  }

  if (stage === 'analyzing') {
    return (
      <TestShell
        title="TOEFL Writing"
        subtitle="Scoring"
        progressLabel={`Task ${index + 1} of ${config.tasks.length}`}
        progressPercent={((index + 0.5) / config.tasks.length) * 100}
        onExit={onExit}
      >
        <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent"
            aria-hidden
          />
          <h2 className="mt-6 text-xl font-bold text-ink">Analyzing your response…</h2>
          <p className="mt-2 text-sm text-muted">
            AI rubric scoring usually takes a few seconds. Hang tight.
          </p>
          {analyzeError && (
            <p className="mt-4 text-xs text-amber-700">{analyzeError}</p>
          )}
        </div>
      </TestShell>
    )
  }

  if (stage === 'results') {
    const band = aggregateWritingBand(taskResults.map((r) => r.score))
    const aiTasks = taskResults.filter((r) => r.ai)
    return (
      <TestShell title="TOEFL Writing" subtitle="Results" progressLabel="Complete" progressPercent={100} onExit={onExit}>
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Writing Complete</h2>
            <p className="mt-2 text-sm text-muted">
              Scores follow ETS-style writing dimensions (0–5) mapped to a 1–6 band.
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
          </div>

          {aiTasks.map((r) => (
            <div
              key={r.taskId}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold text-ink">{r.label}</h3>
                <p className="text-sm font-semibold text-brand">
                  Band {r.ai!.overallBand.toFixed(1)} · Task {r.score}/5
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    ['Grammar', r.ai!.grammar],
                    ['Vocabulary', r.ai!.vocabulary],
                    ['Organization', r.ai!.organization],
                    ['Task', r.ai!.taskAchievement],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-gray-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-ink">{value}</p>
                    <p className="text-[11px] text-muted">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink">{r.ai!.feedback}</p>
              {r.ai!.strengths.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Strengths
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink">
                    {r.ai!.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {r.ai!.improvements.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Improvements
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink">
                    {r.ai!.improvements.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {taskResults.some((r) => r.usedHeuristic) && (
            <p className="text-center text-xs text-amber-700">
              Some tasks used heuristic scoring because the AI endpoint was unavailable.
            </p>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={onExit}
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
            >
              Exit
            </button>
          </div>
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
            onSubmit={(ordered) => {
              void handleTaskSubmit(task, ordered)
            }}
          />
        )}
        {task.type === 'write-email' && (
          <WriteEmail
            key={task.id}
            prompt={task.prompt}
            contextInfo={task.contextInfo}
            minWords={task.minWords}
            maxWords={task.maxWords}
            onSubmit={(text) => {
              void handleTaskSubmit(task, text)
            }}
          />
        )}
        {task.type === 'academic-discussion' && (
          <AcademicDiscussion
            key={task.id}
            prompt={task.prompt}
            subtype={task.subtype}
            minWords={task.minWords}
            maxWords={task.maxWords}
            onSubmit={(text) => {
              void handleTaskSubmit(task, text)
            }}
          />
        )}
      </div>
    </TestShell>
  )
}
