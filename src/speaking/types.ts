export type SpeakingTaskType = 'listen-and-repeat' | 'interview'

export type ItemPhase =
  | 'idle'
  | 'playing-audio'
  | 'recording'
  | 'processing'
  | 'submitted'

export interface ListenRepeatItem {
  id: string
  /** Use `tts:` prefix to speak transcript via Web Speech API in mocks */
  audioUrl: string
  visualUrl?: string
  /** For scoring comparison — NEVER shown to user during the test */
  transcript: string
  /** 8–12 seconds typically */
  responseSeconds: number
}

export interface InterviewItem {
  id: string
  audioUrl: string
  videoUrl?: string
  /** For scoring/logs — NEVER shown during the test */
  questionText: string
  /** Fixed at 45 in real TOEFL */
  responseSeconds: number
}

export interface SpeakingSectionConfig {
  listenRepeatItems: ListenRepeatItem[]
  interviewItems: InterviewItem[]
}

export interface ItemRecording {
  itemId: string
  taskType: SpeakingTaskType
  blob: Blob | null
  durationMs: number
  selfScore?: number
}

export interface SpeakingScoreResult {
  rawScore: number
  bandScore: number
  cefr: string
  maxRaw: number
}
