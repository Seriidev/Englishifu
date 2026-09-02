import type { WritingRubricScores, WritingTask } from '../components/writing/types'
import type {
  WritingAiTaskType,
  WritingRubricScore,
} from '../types/aiRubric'

export type { WritingRubricScore }

/** Placeholder LLM rubric prompt (kept for docs / offline reference) */
export const WRITING_LLM_RUBRIC_PROMPT = `
Score the TOEFL Writing response on four dimensions (0-5 each):
1) Grammar — accuracy of sentence structure and morphology
2) Vocabulary — range and appropriateness
3) Organization — paragraphing, logical flow, task fulfillment
4) Coherence — clarity of ideas and cohesion devices
Return JSON: { grammar, vocabulary, organization, coherence, feedback }
`.trim()

/**
 * Calls Vercel `/api/score-writing` (Claude). Requires ANTHROPIC_API_KEY on the server.
 */
export async function scoreWritingWithAI(
  taskType: WritingAiTaskType | string,
  prompt: string,
  studentResponse: string,
): Promise<WritingRubricScore> {
  const response = await fetch('/api/score-writing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskType, prompt, studentResponse }),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || 'Scoring failed')
  }
  return response.json() as Promise<WritingRubricScore>
}

/** Map AI rubric dimensions to a single 0–5 task score for band aggregation. */
export function taskScoreFromWritingRubric(score: WritingRubricScore): number {
  const avg =
    (score.grammar +
      score.vocabulary +
      score.organization +
      score.taskAchievement) /
    4
  return Math.max(0, Math.min(5, Math.round(avg)))
}

/** Length-based heuristic when AI scoring is unavailable (local / misconfigured). */
export function heuristicWritingScore(text: string, minWords = 60): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words >= minWords + 40) return 4
  if (words >= minWords) return 3
  if (words > 0) return 2
  return 0
}

export function scoreBuildSentence(
  assembled: string[],
  correctSentence: string,
): number {
  const user = assembled.join(' ').trim().toLowerCase().replace(/\s+/g, ' ')
  const correct = correctSentence.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!user) return 0
  if (user === correct) return 5
  // Partial credit: token overlap
  const u = new Set(user.split(' '))
  const c = correct.split(' ')
  const hit = c.filter((t) => u.has(t)).length
  const ratio = hit / Math.max(c.length, 1)
  if (ratio >= 0.9) return 4
  if (ratio >= 0.7) return 3
  if (ratio >= 0.5) return 2
  if (ratio >= 0.3) return 1
  return 0
}

/**
 * MVP self-assessment aggregator → band 1–6.
 * Replace with LLM rubric scoring when backend is available.
 */
export function aggregateWritingBand(
  taskScores: number[],
): { rawScore: number; bandScore: number; cefr: string; maxRaw: number } {
  const maxRaw = Math.max(taskScores.length * 5, 1)
  const rawScore = taskScores.reduce((a, b) => a + Math.max(0, Math.min(5, b)), 0)
  const bandScore = Math.max(0, Math.min(6, Math.round((rawScore / maxRaw) * 6 * 2) / 2))
  const cefrMap: Record<string, string> = {
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
    '0': 'A1',
  }
  return { rawScore, bandScore, cefr: cefrMap[String(bandScore)] ?? 'N/A', maxRaw }
}

export function averageRubric(scores: WritingRubricScores): number {
  const vals = [scores.grammar, scores.vocabulary, scores.organization, scores.coherence]
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

export function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export function taskLabel(task: WritingTask): string {
  if (task.type === 'build-sentence') return 'Build a Sentence'
  if (task.type === 'write-email') return 'Write an Email'
  const map: Record<string, string> = {
    'opinion-essay': 'Academic Discussion · Opinion',
    'two-views': 'Academic Discussion · Two Views',
    'advantages-disadvantages': 'Academic Discussion · Pros & Cons',
    'two-direct-questions': 'Academic Discussion · Two Questions',
  }
  return map[task.subtype ?? ''] ?? 'Academic Discussion'
}
