import type { SpeakingScoreResult } from './types'

/** Listen and Repeat rubric labels (0–5) */
export const LISTEN_REPEAT_RUBRIC: Record<number, string> = {
  5: 'Exact repetition, fully intelligible',
  4: 'Meaning preserved; minor word/grammar deviations',
  3: 'Main content present, but meaning is somewhat distorted',
  2: 'Significant portion of the prompt missing',
  1: 'Minimal content, barely intelligible',
  0: 'No response / unintelligible / not in English',
}

/** Take an Interview rubric labels (0–5) */
export const INTERVIEW_RUBRIC: Record<number, string> = {
  5: 'Fluent, clear, on-topic, well developed',
  4: 'Clear and on-topic, but limited cohesion',
  3: 'On-topic with limited development; frequent pauses/fillers',
  2: 'Attempt to answer, weakly supported',
  1: 'Minimal response, barely intelligible',
  0: 'No response / unintelligible / off-topic',
}

const CEFR_MAP: Record<string, string> = {
  '6': 'C2',
  '5.5': 'C1',
  '5': 'C1',
  '4.5': 'B2',
  '4': 'B2',
  '3.5': 'B1',
  '3': 'B1',
  '2.5': 'A2',
  '2': 'A2',
  '1.5': 'A1',
  '1': 'A1',
  '0.5': 'A1',
  '0': 'A1',
}

/**
 * Converts per-item 0–5 scores into TOEFL-style speaking band (1.0–6.0, step 0.5).
 * Max raw = 5 × itemCount (55 for 11 items).
 * MVP: linear mapping; replace with official ETS table when published.
 */
export function calculateSpeakingScore(itemScores: number[]): SpeakingScoreResult {
  const maxRaw = Math.max(itemScores.length * 5, 1)
  const rawScore = itemScores.reduce((sum, s) => sum + clampScore(s), 0)
  const bandRaw = (rawScore / maxRaw) * 6
  const bandScore = Math.max(0, Math.min(6, Math.round(bandRaw * 2) / 2))
  const cefr = CEFR_MAP[String(bandScore)] ?? 'N/A'

  return { rawScore, bandScore, cefr, maxRaw }
}

function clampScore(score: number): number {
  if (Number.isNaN(score)) return 0
  return Math.max(0, Math.min(5, Math.round(score)))
}

export function averageItemScore(itemScores: number[]): number {
  if (itemScores.length === 0) return 0
  const sum = itemScores.reduce((a, b) => a + clampScore(b), 0)
  return Math.round((sum / itemScores.length) * 10) / 10
}
