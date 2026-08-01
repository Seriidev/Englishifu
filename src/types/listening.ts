import type { DifficultyTier } from '../engine/adaptiveEngine'

export type ListeningTaskType =
  | 'listen-and-choose-response'
  | 'listen-to-conversation'
  | 'listen-to-announcement'
  | 'listen-to-academic-talk'

export type ListeningQuestionType =
  | 'fill-in-blank'
  | 'multiple-choice'
  | 'map-matching'

export type MCSubtype =
  | 'main-idea'
  | 'detail'
  | 'inference'
  | 'speaker-purpose'
  | 'speaker-attitude'

export interface ListeningTaskConfig {
  type: ListeningTaskType
  label: string
  shortLabel: string
  description: string
  /** Typical questions per audio item */
  questionsPerItem: number
  navCode: string
}

export const LISTENING_TASK_TYPES: ListeningTaskConfig[] = [
  {
    type: 'listen-and-choose-response',
    label: 'Listen and Choose a Response',
    shortLabel: 'Choose a Response',
    description:
      'Select the best response to a short statement or question.',
    questionsPerItem: 1,
    navCode: '#07',
  },
  {
    type: 'listen-to-conversation',
    label: 'Listen to a Conversation',
    shortLabel: 'Conversation',
    description:
      'Answer questions about a short conversation between two speakers.',
    questionsPerItem: 2,
    navCode: '#08',
  },
  {
    type: 'listen-to-announcement',
    label: 'Listen to an Announcement',
    shortLabel: 'Announcement',
    description: 'Answer questions about a campus or radio announcement.',
    questionsPerItem: 2,
    navCode: '#09',
  },
  {
    type: 'listen-to-academic-talk',
    label: 'Listen to an Academic Talk',
    shortLabel: 'Academic Talk',
    description: 'Answer questions about a lecture excerpt.',
    questionsPerItem: 4,
    navCode: '#10',
  },
]

export interface ListeningHotspot {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
}

export interface ListeningPracticeQuestion {
  id: string
  prompt: string
  questionType: ListeningQuestionType
  mcSubtype?: MCSubtype
  options?: string[]
  correctOptionIndex?: number
  transcriptWithBlanks?: string
  blankAnswers?: string[]
  imageUrl?: string
  hotspots?: ListeningHotspot[]
  correctHotspotMapping?: Record<string, string>
  mapCues?: string[]
}

/** One practice card in the library (1 audio + N questions). */
export interface ListeningPractice {
  id: string
  numberLabel: string
  title: string
  taskType: ListeningTaskType
  dateAdded: string
  /** Base solved count (social proof); local completions are added at runtime */
  solvedCount: number
  difficultyTier: DifficultyTier
  audioUrl: string
  speakText: string
  questions: ListeningPracticeQuestion[]
}

/** Flattened item used by the adaptive ListeningSection (1 audio → 1 question). */
export interface ListeningItem {
  id: string
  audioUrl: string
  speakText: string
  difficultyTier: DifficultyTier
  taskType: ListeningTaskType
  contentType: 'lecture' | 'conversation' | 'announcement'
  questionType: ListeningQuestionType
  mcSubtype?: MCSubtype
  prompt: string
  transcriptWithBlanks?: string
  blankAnswers?: string[]
  options?: string[]
  correctOptionIndex?: number
  imageUrl?: string
  hotspots?: ListeningHotspot[]
  correctHotspotMapping?: Record<string, string>
  mapCues?: string[]
}

export interface ListeningSectionConfig {
  stage1Items: ListeningItem[]
  stage2EasyItems: ListeningItem[]
  stage2HardItems: ListeningItem[]
  sectionTimeSeconds: number
}

export function taskTypeLabel(type: ListeningTaskType): string {
  return LISTENING_TASK_TYPES.find((t) => t.type === type)?.label ?? type
}

export function taskTypeToContentType(
  type: ListeningTaskType,
): ListeningItem['contentType'] {
  if (type === 'listen-to-academic-talk') return 'lecture'
  if (type === 'listen-to-announcement') return 'announcement'
  return 'conversation'
}

export function practiceToItems(practice: ListeningPractice): ListeningItem[] {
  return practice.questions.map((q) => ({
    id: q.id,
    audioUrl: practice.audioUrl,
    speakText: practice.speakText,
    difficultyTier: practice.difficultyTier,
    taskType: practice.taskType,
    contentType: taskTypeToContentType(practice.taskType),
    questionType: q.questionType,
    mcSubtype: q.mcSubtype,
    prompt: q.prompt,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex,
    transcriptWithBlanks: q.transcriptWithBlanks,
    blankAnswers: q.blankAnswers,
    imageUrl: q.imageUrl,
    hotspots: q.hotspots,
    correctHotspotMapping: q.correctHotspotMapping,
    mapCues: q.mapCues,
  }))
}
