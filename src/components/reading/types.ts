import type { DifficultyTier } from '../../engine/adaptiveEngine'

export type ReadingQuestionType =
  | 'multiple-choice'
  | 'match-heading'
  | 'match-main-idea'
  | 'match-sentence-ending'
  | 'complete-words'

export interface ReadingParagraph {
  id: string
  text: string
}

export interface ReadingQuestion {
  id: string
  type: ReadingQuestionType
  prompt: string
  options: string[]
  paragraphRefs?: string[]
  /** complete-words: text with ___ placeholders for missing endings */
  blankTemplate?: string
  blankAnswers?: string[]
  /** MC: option index as string; matching: map paragraphId -> option; complete-words: index -> ending */
  correctAnswer: string | Record<string, string>
}

export interface ReadingPassage {
  id: string
  title: string
  paragraphs: ReadingParagraph[]
  difficultyTier: DifficultyTier
  topicType: 'academic' | 'daily-life'
  questions: ReadingQuestion[]
}

export interface ReadingSectionConfig {
  stage1Passages: ReadingPassage[]
  stage2EasyPassages: ReadingPassage[]
  stage2HardPassages: ReadingPassage[]
  sectionTimeSeconds: number
}
