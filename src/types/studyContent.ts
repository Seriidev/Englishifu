import type { CefrLevel } from './cefr'

export interface LeaderboardEntry {
  id: string
  rank: number
  fullName: string
  handle?: string
  avatarUrl?: string
  xp: number
  cefrLevel?: CefrLevel
  isCurrentUser?: boolean
}

export interface VocabWord {
  id: string
  word: string
  phonetic: string
  partOfSpeech: string
  definition: string
  example: string
  topic: VocabTopic
}

export type VocabTopic =
  | 'academic'
  | 'environment'
  | 'history'
  | 'campus'
  | 'science'
  | 'conversation'
  | 'toefl'

export type LibraryCategory =
  | 'literature'
  | 'grammar'
  | 'classics'
  | 'academic'
  | 'essays'
  | 'study'
  | 'business'
  | 'history'

export type LibraryLevel = Extract<CefrLevel, 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>

export interface LibraryItem {
  id: string
  title: string
  author: string
  category: LibraryCategory
  /** Shown on the card when the catalog topic is not one of the built-in labels. */
  topicLabel?: string
  level: LibraryLevel
  rating?: number
  /** Public download count, shown as readers when the catalog provides one. */
  readerCount?: number
  minutes: number
  description: string
  coverHeadline?: string
  coverImageUrl?: string
  coverBrand?: string
  coverSeries?: string
  coverByline?: string
  /** Public-domain text or HTML copy that the reader can open. */
  readUrl?: string
  /** True when a PDF exists; never a direct downloadable URL. */
  hasPdf?: boolean
  pdfUrl?: string
  pdfFileName?: string
}
