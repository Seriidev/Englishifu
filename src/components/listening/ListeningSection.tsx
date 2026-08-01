import { useCallback, useMemo, useState } from 'react'
import type { ListeningSectionConfig } from './types'
import {
  countCorrect,
  DEFAULT_ADAPTIVE_CONFIG,
  determineNextTier,
  type DifficultyTier,
} from '../../engine/adaptiveEngine'
import {
  blanksCorrect,
  scoreObjectiveSection,
  type ObjectiveItemResult,
} from '../../scoring/readingListeningScoring'
import type { SectionScore } from '../../scoring/overallScoring'
import TestShell from '../toefl/TestShell'
import SectionTimer from '../toefl/SectionTimer'
import ListeningItemView, {
  type ListeningAnswerPayload,
} from './ListeningItemView'

type Stage = 'intro' | 'stage1' | 'bridge' | 'stage2' | 'results'

interface Props {
  config: ListeningSectionConfig
  onExit: () => void
  onComplete?: (score: SectionScore) => void
}

export default function ListeningSection({ config, onExit, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('intro')
  const [stage2Tier, setStage2Tier] = useState<DifficultyTier>('easy')
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<ObjectiveItemResult[]>([])
  const [timerRunning, setTimerRunning] = useState(false)

  const stage1 = config.stage1Items
  const stage2 =
    stage2Tier === 'hard' ? config.stage2HardItems : config.stage2EasyItems
  const queue = stage === 'stage2' ? stage2 : stage1
  const current = queue[index]
  const totalAll = stage1.length + stage2.length
  const answered =
    stage === 'stage2' ? stage1.length + index : index

  const grade = (item = current, payload: ListeningAnswerPayload): boolean => {
    if (!item) return false
    if (payload.type === 'fill-in-blank') {
      return blanksCorrect(payload.blanks, item.blankAnswers ?? [])
    }
    if (payload.type === 'multiple-choice') {
      return payload.optionIndex === item.correctOptionIndex
    }
    const expected = item.correctHotspotMapping ?? {}
    return Object.keys(expected).every((k) => payload.mapping[k] === expected[k])
  }

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

  const handleSubmit = (payload: ListeningAnswerPayload) => {
    if (!current) return
    const correct = grade(current, payload)
    const next = [
      ...results,
      { correct, tier: current.difficultyTier } satisfies ObjectiveItemResult,
    ]

    if (stage === 'stage1') {
      if (index + 1 < stage1.length) {
        setResults(next)
        setIndex((i) => i + 1)
      } else {
        const { correctCount, totalCount } = countCorrect(next.map((r) => r.correct))
        const tier = determineNextTier(
          { stage: 1, tier: 'baseline', correctCount, totalCount },
          { ...DEFAULT_ADAPTIVE_CONFIG, stage1ItemCount: stage1.length },
        )
        setResults(next)
        setStage2Tier(tier)
        setStage('bridge')
      }
      return
    }

    setResults(next)
    if (index + 1 < stage2.length) {
      setIndex((i) => i + 1)
    } else {
      setTimerRunning(false)
      finishSection(next)
    }
  }

  const score = useMemo(() => scoreObjectiveSection(results), [results])

  if (stage === 'intro') {
    return (
      <TestShell title="TOEFL Listening" subtitle="Adaptive 2026 format" progressLabel="Ready" progressPercent={0} onExit={onExit}>
        <div className="mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Listening Section</h2>
          <p className="mt-3 text-sm text-muted">
            Audio plays once. Stage 2 adapts to Stage 1. Fill-in-blank, multiple-choice, and map matching included.
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setStage('stage1')
              setIndex(0)
              setResults([])
              setTimerRunning(true)
            }}
          >
            Begin Listening
          </button>
        </div>
      </TestShell>
    )
  }

  if (stage === 'bridge') {
    return (
      <TestShell
        title="TOEFL Listening"
        subtitle="Stage transition"
        progressLabel={`Stage 2 → ${stage2Tier}`}
        progressPercent={(stage1.length / Math.max(totalAll, 1)) * 100}
        timer={<SectionTimer totalSeconds={config.sectionTimeSeconds} running={timerRunning} />}
        onExit={onExit}
      >
        <div className="mx-auto max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Stage 2 ({stage2Tier})</h2>
          <button
            type="button"
            className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setIndex(0)
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
      <TestShell title="TOEFL Listening" subtitle="Results" progressLabel="Complete" progressPercent={100} onExit={onExit}>
        <div className="mx-auto max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Listening Complete</h2>
          <p className="mt-2 text-sm text-muted">Stage 2: {stage2Tier}</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-brand-light p-3">
              <p className="text-xl font-bold">{score.rawScore}</p>
              <p className="text-xs text-muted">Weighted</p>
            </div>
            <div className="rounded-2xl bg-brand-light p-3">
              <p className="text-xl font-bold text-brand">{score.bandScore.toFixed(1)}</p>
              <p className="text-xs text-muted">Band</p>
            </div>
            <div className="rounded-2xl bg-brand-light p-3">
              <p className="text-xl font-bold">{score.cefr}</p>
              <p className="text-xs text-muted">CEFR</p>
            </div>
          </div>
          <button type="button" onClick={onExit} className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white">
            Exit
          </button>
        </div>
      </TestShell>
    )
  }

  if (!current) return null
  const stageLabel = stage === 'stage1' ? 'Stage 1' : `Stage 2 · ${stage2Tier}`

  return (
    <TestShell
      title="TOEFL Listening"
      subtitle={stageLabel}
      progressLabel={`Question ${answered + 1} of ~${totalAll}`}
      progressPercent={(answered / Math.max(totalAll, 1)) * 100}
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
      <ListeningItemView key={current.id} item={current} onSubmit={handleSubmit} />
    </TestShell>
  )
}
