export type WritingTaskType = 'build-sentence' | 'write-email' | 'academic-discussion'

export type AcademicDiscussionSubtype =
  | 'opinion-essay'
  | 'two-views'
  | 'advantages-disadvantages'
  | 'two-direct-questions'

export interface WritingTask {
  id: string
  type: WritingTaskType
  subtype?: AcademicDiscussionSubtype
  prompt: string
  contextInfo?: string
  wordBank?: string[]
  /** Correct sentence for Build a Sentence scoring */
  correctSentence?: string
  minWords?: number
  maxWords?: number
  timeLimitSeconds: number
}

export interface WritingSectionConfig {
  tasks: WritingTask[]
}

export interface WritingRubricScores {
  grammar: number
  vocabulary: number
  organization: number
  coherence: number
}
