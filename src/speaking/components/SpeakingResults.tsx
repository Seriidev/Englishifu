import { useEffect, useMemo, useState } from 'react'
import type { ItemRecording, SpeakingSectionConfig } from '../types'
import {
  INTERVIEW_RUBRIC,
  LISTEN_REPEAT_RUBRIC,
  calculateSpeakingScore,
} from '../speakingScoring'

interface SpeakingResultsProps {
  config: SpeakingSectionConfig
  recordings: ItemRecording[]
  onRestart: () => void
  onExit: () => void
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
        rubric: LISTEN_REPEAT_RUBRIC,
      })),
      ...config.interviewItems.map((i) => ({
        id: i.id,
        label: 'Interview',
        prompt: i.questionText,
        rubric: INTERVIEW_RUBRIC,
      })),
    ],
    [config],
  )

  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(allItems.map((i) => [i.id, 3])),
  )

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

  const result = useMemo(() => {
    const ordered = allItems.map((i) => scores[i.id] ?? 0)
    return calculateSpeakingScore(ordered)
  }, [allItems, scores])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">
          Results
        </p>
        <h2 className="mt-2 text-3xl font-bold text-ink">Speaking Complete</h2>
        <p className="mt-2 text-sm text-muted">
          MVP scoring: listen to your recordings and self-rate each item (0–5).
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 rounded-3xl bg-brand-light p-6 text-center">
        <div>
          <p className="text-2xl font-bold text-ink">{result.rawScore}</p>
          <p className="text-xs text-muted">Raw / {result.maxRaw}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-brand">{result.bandScore.toFixed(1)}</p>
          <p className="text-xs text-muted">Band (1–6)</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-ink">{result.cefr}</p>
          <p className="text-xs text-muted">CEFR</p>
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {allItems.map((item, index) => {
          const url = audioUrls[item.id]
          const score = scores[item.id] ?? 0

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
                <select
                  aria-label={`Score for question ${index + 1}`}
                  value={score}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [item.id]: Number(e.target.value),
                    }))
                  }
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} — {item.rubric[n]}
                    </option>
                  ))}
                </select>
              </div>
              {url ? (
                <audio className="mt-3 w-full" controls src={url} />
              ) : (
                <p className="mt-3 text-xs text-muted">No audio captured</p>
              )}
            </li>
          )
        })}
      </ul>

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
