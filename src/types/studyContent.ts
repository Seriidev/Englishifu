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
  level: LibraryLevel
  rating?: number
  minutes: number
  description: string
  coverHeadline?: string
  coverImageUrl?: string
  coverBrand?: string
  coverSeries?: string
  coverByline?: string
  pdfUrl?: string
  pdfFileName?: string
}
