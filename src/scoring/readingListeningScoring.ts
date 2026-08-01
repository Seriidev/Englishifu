import type { DifficultyTier } from '../engine/adaptiveEngine'

const WEIGHT: Record<DifficultyTier, number> = {
  baseline: 1,
  easy: 0.8,
  hard: 1.2,
}

export interface ObjectiveItemResult {
  correct: boolean
  tier: DifficultyTier
}

export interface ObjectiveSectionScore {
  rawScore: number
  maxRaw: number
  bandScore: number
  cefr: string
  accuracyPercent: number
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
 * Weighted objective scoring: hard-tier correct answers count more than easy-tier.
 */
export function scoreObjectiveSection(items: ObjectiveItemResult[]): ObjectiveSectionScore {
  const rawScore = items.reduce(
    (sum, item) => sum + (item.correct ? WEIGHT[item.tier] : 0),
    0,
  )
  const maxRaw = items.reduce((sum, item) => sum + WEIGHT[item.tier], 0) || 1
  const bandRaw = (rawScore / maxRaw) * 6
  const bandScore = Math.max(0, Math.min(6, Math.round(bandRaw * 2) / 2))
  const correct = items.filter((i) => i.correct).length
  const accuracyPercent =
    items.length === 0 ? 0 : Math.round((correct / items.length) * 100)

  return {
    rawScore: Math.round(rawScore * 10) / 10,
    maxRaw: Math.round(maxRaw * 10) / 10,
    bandScore,
    cefr: CEFR_MAP[String(bandScore)] ?? 'N/A',
    accuracyPercent,
  }
}

export function answersEqual(
  user: string | Record<string, string> | null | undefined,
  correct: string | Record<string, string>,
): boolean {
  if (user == null) return false
  if (typeof correct === 'string') {
    return normalize(String(user)) === normalize(correct)
  }
  if (typeof user !== 'object') return false
  const keys = Object.keys(correct)
  return keys.every((k) => normalize(user[k] ?? '') === normalize(correct[k] ?? ''))
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function blanksCorrect(user: string[], expected: string[]): boolean {
  if (user.length !== expected.length) return false
  return expected.every((ans, i) => normalize(user[i] ?? '') === normalize(ans))
}
