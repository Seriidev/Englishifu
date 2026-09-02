import { useEffect, useMemo, useState } from 'react'
import type { ItemRecording, SpeakingSectionConfig } from '../types'
import {
  calculateSpeakingScore,
  itemScoreFromSpeakingRubric,
  scoreSpeakingWithAI,
} from '../speakingScoring'
import type { SpeakingRubricScore } from '../../types/aiRubric'

interface SpeakingResultsProps {
  config: SpeakingSectionConfig
  recordings: ItemRecording[]
  onRestart: () => void
  onExit: () => void
}

type ScoreStatus = 'analyzing' | 'ready' | 'partial'

interface ItemAiResult {
  itemId: string
  label: string
  prompt: string
  score: number
  ai?: SpeakingRubricScore
  error?: string
}

export default function SpeakingResults({
  config,
  recordings,
  onRestart,
  onExit,
}: SpeakingResultsProps) {
  const allItems = useMemo(
    () => [
      ...config.listenRepeatItems.map((i) => ({
        id: i.id,
        label: 'Listen & Repeat',
        prompt: i.transcript,
        taskType: 'listen-and-repeat' as const,
      })),
      ...config.interviewItems.map((i) => ({
        id: i.id,
        label: 'Interview',
        prompt: i.questionText,
        taskType: 'interview' as const,
      })),
    ],
    [config],
  )

  const [status, setStatus] = useState<ScoreStatus>('analyzing')
  const [itemResults, setItemResults] = useState<ItemAiResult[]>([])
  const [progress, setProgress] = useState({ done: 0, total: allItems.length })

  const audioUrls = useMemo(() => {
    const map: Record<string, string> = {}
    for (const rec of recordings) {
      if (rec.blob) map[rec.itemId] = URL.createObjectURL(rec.blob)
    }
    return map
  }, [recordings])

  useEffect(() => {
    return () => {
      Object.values(audioUrls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [audioUrls])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setStatus('analyzing')
      setProgress({ done: 0, total: allItems.length })
      const next: ItemAiResult[] = []
      let failures = 0

      for (let i = 0; i < allItems.length; i++) {
        if (cancelled) return
        const item = allItems[i]
        const rec = recordings.find((r) => r.itemId === item.id)

        if (!rec?.blob) {
          failures += 1
          next.push({
            itemId: item.id,
            label: item.label,
            prompt: item.prompt,
            score: 0,
            error: 'No audio captured',
          })
        } else {
          try {
            const ai = await scoreSpeakingWithAI(
              rec.blob,
              item.prompt,
              item.taskType,
            )
            next.push({
              itemId: item.id,
              label: item.label,
              prompt: item.prompt,
              score: itemScoreFromSpeakingRubric(ai),
              ai,
            })
          } catch {
            failures += 1
            next.push({
              itemId: item.id,
              label: item.label,
              prompt: item.prompt,
              score: 3,
              error: 'AI scoring unavailable — provisional mid score used.',
            })
          }
        }

        if (!cancelled) {
          setProgress({ done: i + 1, total: allItems.length })
          setItemResults([...next])
        }
      }

      if (!cancelled) {
        setStatus(failures > 0 ? 'partial' : 'ready')
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [allItems, recordings])

  const result = useMemo(() => {
    const ordered = allItems.map((item) => {
      const found = itemResults.find((r) => r.itemId === item.id)
      return found?.score ?? 0
    })
    if (itemResults.length < allItems.length) {
      return calculateSpeakingScore(Array(allItems.length).fill(0))
    }
    return calculateSpeakingScore(ordered)
  }, [allItems, itemResults])

  if (status === 'analyzing' && itemResults.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent"
          aria-hidden
        />
        <h2 className="mt-6 text-2xl font-bold text-ink">Analyzing your responses…</h2>
        <p className="mt-2 text-sm text-muted">
          Transcribing speech and applying TOEFL-style speaking rubrics. This can
          take under a minute.
        </p>
        <p className="mt-4 text-xs text-muted">
          {progress.done} / {progress.total} items
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">
          Results
        </p>
        <h2 className="mt-2 text-3xl font-bold text-ink">Speaking Complete</h2>
        <p className="mt-2 text-sm text-muted">
          AI rubric scores for fluency, language use, and topic development.
        </p>
        {status === 'analyzing' && (
          <p className="mt-2 text-xs font-medium text-brand">
            Still scoring… {progress.done}/{progress.total}
          </p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 rounded-3xl bg-brand-light p-6 text-center">
        <div>
          <p className="text-2xl font-bold text-ink">
            {status === 'analyzing' ? '—' : result.rawScore}
          </p>
          <p className="text-xs text-muted">Raw / {result.maxRaw}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-brand">
            {status === 'analyzing' ? '—' : result.bandScore.toFixed(1)}
          </p>
          <p className="text-xs text-muted">Band (1–6)</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-ink">
            {status === 'analyzing' ? '—' : result.cefr}
          </p>
          <p className="text-xs text-muted">CEFR</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-muted">
        Pronunciation isn&apos;t assessed by text-based AI scoring — this estimate
        focuses on fluency, grammar, and content.
      </p>

      <ul className="mt-8 space-y-4">
        {allItems.map((item, index) => {
          const url = audioUrls[item.id]
          const scored = itemResults.find((r) => r.itemId === item.id)

          return (
            <li
              key={item.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-brand">
                    Q{index + 1} · {item.label}
                  </p>
                  <p className="mt-1 text-sm text-ink">{item.prompt}</p>
                </div>
                <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-ink">
                  {scored ? `${scored.score}/5` : '…'}
                </p>
              </div>

              {url ? (
                <audio className="mt-3 w-full" controls src={url} />
              ) : (
                <p className="mt-3 text-xs text-muted">No audio captured</p>
              )}

              {scored?.ai && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ['Fluency', scored.ai.fluencyCoherence],
                        ['Language', scored.ai.languageUse],
                        ['Topic', scored.ai.topicDevelopment],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-brand-light/60 px-2 py-2 text-center"
                      >
                        <p className="text-base font-bold text-ink">{value}</p>
                        <p className="text-[11px] text-muted">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-ink">
                    {scored.ai.feedback}
                  </p>
                  {scored.ai.transcript && (
                    <details className="rounded-xl bg-gray-50 px-3 py-2">
                      <summary className="cursor-pointer text-xs font-semibold text-muted">
                        Transcript
                      </summary>
                      <p className="mt-2 text-sm text-ink">{scored.ai.transcript}</p>
                    </details>
                  )}
                </div>
              )}

              {scored?.error && (
                <p className="mt-3 text-xs text-amber-700">{scored.error}</p>
              )}
            </li>
          )
        })}
      </ul>

      {status === 'partial' && (
        <p className="mt-6 text-center text-xs text-amber-700">
          Some items could not be scored by AI. Check API keys and try again later.
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-ink hover:bg-gray-50"
        >
          Exit
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Practice Again
        </button>
      </div>
    </div>
  )
}
