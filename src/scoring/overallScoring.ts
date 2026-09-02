export type FullTestSection = 'reading' | 'listening' | 'speaking' | 'writing'

export interface SectionScore {
  rawScore: number
  bandScore: number
}

export interface FullTestResult {
  reading: SectionScore
  listening: SectionScore
  speaking: SectionScore
  writing: SectionScore
  overallBandScore: number
  cefr: string
  completedAt: string
  testDurationMinutes: number
}

export const FULL_TEST_ORDER: FullTestSection[] = [
  'reading',
  'listening',
  'speaking',
  'writing',
]

export const FULL_TEST_RESULT_KEY = 'toefl-full-test-result'

const CEFR_MAP: Record<number, string> = {
  6: 'C2',
  5.5: 'C1',
  5: 'C1',
  4.5: 'B2',
  4: 'B2',
  3.5: 'B1',
  3: 'B1',
  2.5: 'A2',
  2: 'A2',
  1.5: 'A1',
  1: 'A1',
  0.5: 'A1',
  0: 'A1',
}

export function calculateOverallScore(
  result: Pick<FullTestResult, 'reading' | 'listening' | 'speaking' | 'writing'>,
): { overall: number; cefr: string } {
  const scores = [
    result.reading.bandScore,
    result.listening.bandScore,
    result.speaking.bandScore,
    result.writing.bandScore,
  ]
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const overall = Math.round(avg * 2) / 2
  return { overall, cefr: CEFR_MAP[overall] ?? 'N/A' }
}

export function buildFullTestResult(
  sections: Pick<FullTestResult, 'reading' | 'listening' | 'speaking' | 'writing'>,
  startedAt: number,
  completedAt: number = Date.now(),
): FullTestResult {
  const { overall, cefr } = calculateOverallScore(sections)
  return {
    ...sections,
    overallBandScore: overall,
    cefr,
    completedAt: new Date(completedAt).toISOString(),
    testDurationMinutes: Math.max(1, Math.round((completedAt - startedAt) / 60000)),
  }
}

export function saveFullTestResult(result: FullTestResult): void {
  const raw = JSON.stringify(result)
  try {
    sessionStorage.setItem(FULL_TEST_RESULT_KEY, raw)
  } catch {
    /* ignore quota / private mode */
  }
  try {
    localStorage.setItem(FULL_TEST_RESULT_KEY, raw)
  } catch {
    /* ignore */
  }
}

export function loadFullTestResult(): FullTestResult | null {
  try {
    const raw =
      sessionStorage.getItem(FULL_TEST_RESULT_KEY) ??
      localStorage.getItem(FULL_TEST_RESULT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as FullTestResult
  } catch {
    return null
  }
}
