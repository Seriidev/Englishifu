import { useCallback, useMemo, useState } from 'react'
import type { ReadingPassage, ReadingSectionConfig } from './types'
import {
  countCorrect,
  DEFAULT_ADAPTIVE_CONFIG,
  determineNextTier,
  type DifficultyTier,
} from '../../engine/adaptiveEngine'
import {
  answersEqual,
  scoreObjectiveSection,
  type ObjectiveItemResult,
} from '../../scoring/readingListeningScoring'
import type { SectionScore } from '../../scoring/overallScoring'
import TestShell from '../toefl/TestShell'
import SectionTimer from '../toefl/SectionTimer'
import ReadingQuestionView from './ReadingQuestionView'

type Stage = 'intro' | 'stage1' | 'bridge' | 'stage2' | 'results'

interface FlatQuestion {
  passage: ReadingPassage
  questionIndex: number
  globalIndex: number
}

interface ReadingSectionProps {
  config: ReadingSectionConfig
  onExit: () => void
  /** When set, skips the results screen and reports score to the parent (full test). */
  onComplete?: (score: SectionScore) => void
}

export default function ReadingSection({
  config,
  onExit,
  onComplete,
}: ReadingSectionProps) {
  const [stage, setStage] = useState<Stage>('intro')
  const [stage2Tier, setStage2Tier] = useState<DifficultyTier>('easy')
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState<string | Record<string, string> | null>(null)
  const [results, setResults] = useState<ObjectiveItemResult[]>([])
  const [timerRunning, setTimerRunning] = useState(false)

  const stage1Queue = useMemo(() => flatten(config.stage1Passages), [config])
  const stage2Queue = useMemo(() => {
    const passages =
      stage2Tier === 'hard' ? config.stage2HardPassages : config.stage2EasyPassages
    return flatten(passages)
  }, [config, stage2Tier])

  const queue = stage === 'stage2' ? stage2Queue : stage1Queue
  const current = queue[qIndex]
  const totalInStage = queue.length
  const totalAll =
    stage1Queue.length +
    (stage2Tier === 'hard'
      ? config.stage2HardPassages
      : config.stage2EasyPassages
    ).reduce((n, p) => n + p.questions.length, 0)

  const answeredCount =
    stage === 'stage2' ? stage1Queue.length + qIndex : qIndex
  const progressPercent = (answeredCount / Math.max(totalAll, 1)) * 100

  const finishSection = useCallback(
    (finalResults: ObjectiveItemResult[]) => {
      const scored = scoreObjectiveSection(finalResults)
      if (onComplete) {
        onComplete({ rawScore: scored.rawScore, bandScore: scored.bandScore })
        return
      }
      setResults(finalResults)
      setStage('results')
    },
    [onComplete],
  )

  const submitCurrent = useCallback(() => {
    if (!current || answer == null) return
    const q = current.passage.questions[current.questionIndex]
    const correct = answersEqual(answer, q.correctAnswer)
    const item: ObjectiveItemResult = {
      correct,
      tier: current.passage.difficultyTier,
    }
    const nextResults = [...results, item]

    if (stage === 'stage1') {
      if (qIndex + 1 < stage1Queue.length) {
        setResults(nextResults)
        setQIndex((i) => i + 1)
        setAnswer(null)
      } else {
        const stage1Only = nextResults
        const { correctCount, totalCount } = countCorrect(
          stage1Only.map((r) => r.correct),
        )
        const tier = determineNextTier(
          { stage: 1, tier: 'baseline', correctCount, totalCount },
          {
            ...DEFAULT_ADAPTIVE_CONFIG,
            stage1ItemCount: stage1Queue.length,
          },
        )
        setResults(nextResults)
        setStage2Tier(tier)
        setStage('bridge')
        setAnswer(null)
      }
      return
    }

    // stage 2
    setResults(nextResults)
    if (qIndex + 1 < stage2Queue.length) {
      setQIndex((i) => i + 1)
      setAnswer(null)
    } else {
      setTimerRunning(false)
      finishSection(nextResults)
    }
  }, [
    answer,
    current,
    finishSection,
    qIndex,
    results,
    stage,
    stage1Queue.length,
    stage2Queue.length,
  ])

  const score = scoreObjectiveSection(results)

  if (stage === 'intro') {
    return (
      <TestShell
        title="TOEFL Reading"
        subtitle="Adaptive 2026 format"
        progressLabel="Ready"
        progressPercent={0}
        onExit={onExit}
      >
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Reading Section</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Stage 1 is the same for everyone. Stage 2 difficulty adapts to your
            Stage 1 performance. You cannot go back after submitting an answer.
            Section time: about 27 minutes.
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setStage('stage1')
              setQIndex(0)
              setResults([])
              setTimerRunning(true)
            }}
          >
            Begin Reading
          </button>
        </div>
      </TestShell>
    )
  }

  if (stage === 'bridge') {
    return (
      <TestShell
        title="TOEFL Reading"
        subtitle="Stage transition"
        progressLabel={`Stage 1 complete → Stage 2 (${stage2Tier})`}
        progressPercent={(stage1Queue.length / Math.max(totalAll, 1)) * 100}
        timer={<SectionTimer totalSeconds={config.sectionTimeSeconds} running={timerRunning} />}
        onExit={onExit}
      >
        <div className="mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Stage 2</h2>
          <p className="mt-3 text-sm text-muted">
            Based on Stage 1, you will receive the{' '}
            <strong className="text-brand">{stage2Tier.toUpperCase()}</strong>{' '}
            module.
            {stage2Tier === 'hard'
              ? ' Expect more academic passages.'
              : ' Expect more everyday topics.'}
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setQIndex(0)
              setStage('stage2')
            }}
          >
            Continue
          </button>
        </div>
      </TestShell>
    )
  }

  if (stage === 'results') {
    return (
      <TestShell
        title="TOEFL Reading"
        subtitle="Results"
        progressLabel="Complete"
        progressPercent={100}
        onExit={onExit}
      >
        <ResultsCard
          score={score}
          stage2Tier={stage2Tier}
          onExit={onExit}
          onRetry={() => {
            setStage('intro')
            setResults([])
            setQIndex(0)
            setAnswer(null)
            setTimerRunning(false)
          }}
        />
      </TestShell>
    )
  }

  if (!current) return null
  const q = current.passage.questions[current.questionIndex]
  const stageLabel = stage === 'stage1' ? 'Stage 1' : `Stage 2 · ${stage2Tier}`

  return (
    <TestShell
      title="TOEFL Reading"
      subtitle={stageLabel}
      progressLabel={`Question ${answeredCount + 1} of ~${totalAll} · ${stageLabel}`}
      progressPercent={progressPercent}
      timer={
        <SectionTimer
          totalSeconds={config.sectionTimeSeconds}
          running={timerRunning}
          onExpire={() => {
            setTimerRunning(false)
            finishSection(results)
          }}
        />
      }
      onExit={onExit}
    >
      <div className="grid flex-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-bold text-ink">{current.passage.title}</h3>
          <p className="mt-1 text-xs font-semibold tracking-wide text-brand uppercase">
            {current.passage.topicType} · {current.passage.difficultyTier}
          </p>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/90">
            {current.passage.paragraphs.map((p, i) => (
              <p key={p.id}>
                <span className="mr-2 text-xs font-bold text-brand">[{i + 1}]</span>
                {p.text}
              </p>
            ))}
            {q.type === 'match-sentence-ending' && (
              <p className="rounded-xl bg-brand-light/60 p-3 font-medium">
                Delivery fees may be waived ________.
              </p>
            )}
          </div>
        </article>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <ReadingQuestionView
            key={q.id}
            question={q}
            value={answer}
            onChange={setAnswer}
            onSubmit={submitCurrent}
          />
        </div>
      </div>
      {/* hide unused */}
      <span className="hidden">{totalInStage}</span>
    </TestShell>
  )
}

function flatten(passages: ReadingPassage[]): FlatQuestion[] {
  const out: FlatQuestion[] = []
  let globalIndex = 0
  for (const passage of passages) {
    passage.questions.forEach((_, questionIndex) => {
      out.push({ passage, questionIndex, globalIndex })
      globalIndex += 1
    })
  }
  return out
}

function ResultsCard({
  score,
  stage2Tier,
  onExit,
  onRetry,
}: {
  score: ReturnType<typeof scoreObjectiveSection>
  stage2Tier: DifficultyTier
  onExit: () => void
  onRetry: () => void
}) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-bold text-ink">Reading Complete</h2>
      <p className="mt-2 text-sm text-muted">
        Stage 2 module: <strong>{stage2Tier}</strong> (hard answers weighted higher)
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Weighted raw" value={String(score.rawScore)} />
        <Stat label="Band" value={score.bandScore.toFixed(1)} />
        <Stat label="CEFR" value={score.cefr} />
      </div>
      <p className="mt-4 text-sm text-muted">Accuracy: {score.accuracyPercent}%</p>
      <div className="mt-8 flex justify-center gap-3">
        <button type="button" onClick={onExit} className="rounded-full border px-5 py-2.5 text-sm font-semibold">
          Exit
        </button>
        <button type="button" onClick={onRetry} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">
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
