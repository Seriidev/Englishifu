/**
 * Shared AI rubric score shapes used by frontend helpers.
 * Server handlers in /api return the same JSON.
 */

export interface WritingRubricScore {
  grammar: number
  vocabulary: number
  organization: number
  taskAchievement: number
  overallBand: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface SpeakingRubricScore {
  fluencyCoherence: number
  languageUse: number
  topicDevelopment: number
  overallBand: number
  transcript: string
  feedback: string
}

export type WritingAiTaskType =
  | 'build-sentence'
  | 'write-email'
  | 'academic-discussion'
