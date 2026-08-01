import type { PlacementQuestion } from '../data/placementQuestions'
import { PLACEMENT_QUESTIONS } from '../data/placementQuestions'

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

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
}

export function scoreToLevel(rawScore: number): {
  cefr: CefrLevel
  label: string
} {
  if (rawScore <= 11) return { cefr: 'A1', label: 'Beginner' }
  if (rawScore <= 19) return { cefr: 'A2', label: 'Elementary' }
  if (rawScore <= 27) return { cefr: 'B1', label: 'Intermediate' }
  if (rawScore <= 34) return { cefr: 'B2', label: 'Upper Intermediate' }
  return { cefr: 'C1', label: 'Advanced' }
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
