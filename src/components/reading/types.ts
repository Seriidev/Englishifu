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

/** Segment of a complete-words passage (plain text or letter blank). */
export interface FillInBlankSegment {
  type: 'text' | 'blank'
  /** Plain text content when type === 'text' */
  content?: string
  /** Shown stem before slots when type === 'blank' (e.g. "h", "sto") */
  visiblePrefix?: string
  /** Number of letter slots the student must fill */
  slotCount?: number
  /** Unique id for answer map */
  blankId?: string
  /**
   * Letters the student must type (missing part only).
   * Used when building correctAnswer; optional on the segment itself.
   */
  correctAnswer?: string
}

export interface ReadingQuestion {
  id: string
  type: ReadingQuestionType
  prompt: string
  options: string[]
  paragraphRefs?: string[]
  /** complete-words: ordered text + blank segments */
  segments?: FillInBlankSegment[]
  /** @deprecated prefer segments */
  blankTemplate?: string
  /** @deprecated prefer segments */
  blankAnswers?: string[]
  /**
   * MC: option index as string;
   * matching: map paragraphId -> option;
   * complete-words: blankId -> missing letters
   */
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
