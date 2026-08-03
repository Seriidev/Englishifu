import type { PlacementQuestion } from '../data/placementQuestions'
import { PLACEMENT_QUESTIONS } from '../data/placementQuestions'
import { CEFR_BADGE_STYLES, type CefrLevel } from '../types/cefr'

export type { CefrLevel }

export interface PlacementResult {
  rawScore: number
  cefrLevel: CefrLevel
  levelLabel: string
  completedAt: string
  totalQuestions: number
}

export interface LevelRecommendation {
  message: string
  suggestedPath: string
  ctaLabel: string
}

export const RECOMMENDATIONS: Record<CefrLevel, LevelRecommendation> = {
  A1: {
    message: 'Start with foundational grammar and vocabulary building.',
    suggestedPath: '/#contact',
    ctaLabel: 'Talk to a tutor',
  },
  A2: {
    message: 'Focus on everyday conversation skills.',
    suggestedPath: '/#speaking-club',
    ctaLabel: 'Join Speaking Club',
  },
  B1: {
    message: "You're ready for structured conversation practice.",
    suggestedPath: '/#speaking-club',
    ctaLabel: 'Join Speaking Club',
  },
  B2: {
    message: "You're well-positioned to start TOEFL preparation.",
    suggestedPath: '/toefl',
    ctaLabel: 'Start TOEFL practice',
  },
  C1: {
    message:
      "You're at an advanced level — focus on TOEFL strategy and fine-tuning.",
    suggestedPath: '/toefl',
    ctaLabel: 'Go to TOEFL Hub',
  },
  C2: {
    message:
      'Near-native proficiency — challenge yourself with full TOEFL simulations.',
    suggestedPath: '/toefl',
    ctaLabel: 'Take Full TOEFL Test',
  },
}

/** Map raw score (0–50) to CEFR A1–C2 — Score Breakdown from Placement test.docx */
export function scoreToLevel(rawScore: number): {
  cefr: CefrLevel
  label: string
} {
  if (rawScore <= 12) return { cefr: 'A1', label: CEFR_BADGE_STYLES.A1.label }
  if (rawScore <= 21) return { cefr: 'A2', label: CEFR_BADGE_STYLES.A2.label }
  if (rawScore <= 31) return { cefr: 'B1', label: CEFR_BADGE_STYLES.B1.label }
  if (rawScore <= 40) return { cefr: 'B2', label: CEFR_BADGE_STYLES.B2.label }
  if (rawScore <= 46) return { cefr: 'C1', label: CEFR_BADGE_STYLES.C1.label }
  return { cefr: 'C2', label: CEFR_BADGE_STYLES.C2.label }
}

export function scorePlacementAnswers(
  answers: Record<number, number>,
  questions: PlacementQuestion[] = PLACEMENT_QUESTIONS,
): PlacementResult {
  let rawScore = 0
  for (const q of questions) {
    if (answers[q.id] === q.correctIndex) rawScore += 1
  }
  const { cefr, label } = scoreToLevel(rawScore)
  return {
    rawScore,
    cefrLevel: cefr,
    levelLabel: label,
    completedAt: new Date().toISOString(),
    totalQuestions: questions.length,
  }
}
