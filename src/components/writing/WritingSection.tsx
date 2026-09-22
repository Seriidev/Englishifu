import { useMemo, useState } from 'react'
import toeflWritingJson from '../../data/toefl-writing.json'
import type {
  ToeflWritingBank,
  WriteAnEmailItem,
  WriteForAcademicDiscussionItem,
  WritingSession,
} from './types'
import {
  getRandomWritingSession,
  writingStepLabel,
} from './getRandomWritingSession'
import {
  aggregateWritingBand,
  heuristicWritingScore,
  scoreWritingWithAI,
  taskScoreFromWritingRubric,
} from '../../scoring/writingScoring'
import type { WritingRubricScore } from '../../types/aiRubric'
import type { SectionScore } from '../../scoring/overallScoring'
import TestShell from '../toefl/TestShell'
import BuildSentence from './BuildSentence'
import WriteEmail from './WriteEmail'
import AcademicDiscussion from './AcademicDiscussion'

const writingBank = toeflWritingJson as ToeflWritingBank

type Stage = 'intro' | 'task' | 'analyzing' | 'results'

type SessionStep =
  | { kind: 'build_a_sentence'; id: string }
  | { kind: 'write_an_email'; id: string }
  | { kind: 'write_for_academic_discussion'; id: string }

interface TaskResult {
  taskId: string
  label: string
  score: number
  ai?: WritingRubricScore
  usedHeuristic?: boolean
  sentenceCorrect?: boolean
}

interface Props {
  onExit: () => void
  onComplete?: (score: SectionScore) => void
}

function emailPrompt(item: WriteAnEmailItem): string {
  return [
    item.scenario,
    `To: ${item.to}`,
    `Subject: ${item.subject}`,
    ...item.instructions,
  ].join('\n')
}

function discussionPrompt(item: WriteForAcademicDiscussionItem): string {
  return [
    item.course,
    `${item.professor}: ${item.question}`,
    ...item.student_posts.map((post) => `${post.name}: ${post.text}`),
    ...item.instructions,
  ].join('\n')
}

export default function WritingSection({ onExit, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('intro')
  const [session, setSession] = useState<WritingSession | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [taskResults, setTaskResults] = useState<TaskResult[]>([])
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const steps = useMemo<SessionStep[]>(() => {
    if (!session) return []
    return [
      ...session.build_a_sentence.map((item) => ({
        kind: 'build_a_sentence' as const,
        id: item.id,
      })),
      ...session.write_an_email.map((item) => ({
        kind: 'write_an_email' as const,
        id: item.id,
      })),
      ...session.write_for_academic_discussion.map((item) => ({
        kind: 'write_for_academic_discussion' as const,
        id: item.id,
      })),
    ]
  }, [session])

  const current = steps[stepIndex]

  const finishWithResults = (next: TaskResult[]) => {
    const band = aggregateWritingBand(next.map((result) => result.score))
    if (onComplete) {
      onComplete({ rawScore: band.rawScore, bandScore: band.bandScore })
      return
    }
    setTaskResults(next)
    setStage('results')
  }

  const advance = (result: TaskResult) => {
    setTaskResults((prev) => {
      const next = [...prev, result]
      queueMicrotask(() => {
        if (next.length < steps.length) {
          setStepIndex(next.length)
          setStage('task')
          setAnalyzeError(null)
        } else {
          finishWithResults(next)
        }
      })
      return next
    })
  }

  const begin = () => {
    setSession(getRandomWritingSession(writingBank))
    setStepIndex(0)
    setTaskResults([])
    setAnalyzeError(null)
    setStage('task')
  }

  const handleFreeResponse = async (
    currentStep: SessionStep,
    prompt: string,
    text: string,
    minWords: number,
  ) => {
    setStage('analyzing')
    setAnalyzeError(null)

    if (!text.trim()) {
      advance({
        taskId: currentStep.id,
        label: writingStepLabel(currentStep.kind),
        score: 0,
        usedHeuristic: true,
      })
      return
    }

    try {
      const ai = await scoreWritingWithAI(
        currentStep.kind === 'write_an_email' ? 'write-email' : 'academic-discussion',
        prompt,
        text,
      )
      advance({
        taskId: currentStep.id,
        label: writingStepLabel(currentStep.kind),
        score: taskScoreFromWritingRubric(ai),
        ai,
      })
    } catch {
      setAnalyzeError(
        'AI scoring unavailable — using a length-based estimate for this task.',
      )
      advance({
        taskId: currentStep.id,
        label: writingStepLabel(currentStep.kind),
        score: heuristicWritingScore(text, minWords),
        usedHeuristic: true,
      })
    }
  }

  if (stage === 'intro') {
    return (
      <TestShell
        title="TOEFL Writing"
        subtitle={writingBank.meta.title}
        progressLabel="Ready"
        progressPercent={0}
        onExit={onExit}
      >
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Writing Section</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Each attempt draws a new set from the practice bank: eight Build a
            Sentence items, one email, and one academic discussion. Free-response
            tasks use AI rubrics when available.
          </p>
          <button
            type="button"
            className="mt-8 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
            onClick={begin}
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
        progressLabel={`Task ${stepIndex + 1} of ${steps.length}`}
        progressPercent={((stepIndex + 0.5) / Math.max(steps.length, 1)) * 100}
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

  if (stage === 'results' || !session || !current) {
    const band = aggregateWritingBand(taskResults.map((result) => result.score))
    const sentenceResults = taskResults.filter(
      (result) => result.sentenceCorrect !== undefined,
    )
    const sentenceCorrect = sentenceResults.filter((result) => result.sentenceCorrect).length
    const aiTasks = taskResults.filter((result) => result.ai)

    return (
      <TestShell
        title="TOEFL Writing"
        subtitle="Results"
        progressLabel="Complete"
        progressPercent={100}
        onExit={onExit}
      >
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Writing Complete</h2>
            <p className="mt-2 text-sm text-muted">
              Sentence checks plus ETS-style writing dimensions mapped to a 1–6 band.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat
                label="Sentences"
                value={`${sentenceCorrect}/${sentenceResults.length}`}
              />
              <Stat label="Band" value={band.bandScore.toFixed(1)} />
              <Stat label="CEFR" value={band.cefr} />
            </div>
          </div>

          {aiTasks.map((result) => (
            <div
              key={result.taskId}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold text-ink">{result.label}</h3>
                <p className="text-sm font-semibold text-brand">
                  Band {result.ai!.overallBand.toFixed(1)} · Task {result.score}/5
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    ['Grammar', result.ai!.grammar],
                    ['Vocabulary', result.ai!.vocabulary],
                    ['Organization', result.ai!.organization],
                    ['Task', result.ai!.taskAchievement],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-gray-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-ink">{value}</p>
                    <p className="text-[11px] text-muted">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink">{result.ai!.feedback}</p>
            </div>
          ))}

          {taskResults.some((result) => result.usedHeuristic) && (
            <p className="text-center text-xs text-amber-700">
              Some tasks used heuristic scoring because the AI endpoint was unavailable.
            </p>
          )}

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Exit
            </button>
            <button
              type="button"
              onClick={begin}
              className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
            >
              Retry
            </button>
          </div>
        </div>
      </TestShell>
    )
  }

  const sentenceItem = session.build_a_sentence.find((item) => item.id === current.id)
  const emailItem = session.write_an_email.find((item) => item.id === current.id)
  const discussionItem = session.write_for_academic_discussion.find(
    (item) => item.id === current.id,
  )

  return (
    <TestShell
      title="TOEFL Writing"
      subtitle={writingStepLabel(current.kind)}
      progressLabel={`Task ${stepIndex + 1} of ${steps.length}`}
      progressPercent={(stepIndex / Math.max(steps.length, 1)) * 100}
      onExit={onExit}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        {current.kind === 'build_a_sentence' && sentenceItem && (
          <BuildSentence
            key={sentenceItem.id}
            item={sentenceItem}
            onContinue={(ok) =>
              advance({
                taskId: sentenceItem.id,
                label: writingStepLabel('build_a_sentence'),
                score: ok ? 5 : 0,
                sentenceCorrect: ok,
              })
            }
          />
        )}
        {current.kind === 'write_an_email' && emailItem && (
          <WriteEmail
            key={emailItem.id}
            item={emailItem}
            onSubmit={(text) => {
              void handleFreeResponse(
                current,
                emailPrompt(emailItem),
                text,
                emailItem.min_words ?? 60,
              )
            }}
          />
        )}
        {current.kind === 'write_for_academic_discussion' && discussionItem && (
          <AcademicDiscussion
            key={discussionItem.id}
            item={discussionItem}
            onSubmit={(text) => {
              void handleFreeResponse(
                current,
                discussionPrompt(discussionItem),
                text,
                discussionItem.min_words,
              )
            }}
          />
        )}
      </div>
    </TestShell>
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
