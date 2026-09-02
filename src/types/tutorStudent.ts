import type { CefrLevel } from './cefr'

export interface TutorStudent {
  id: string
  fullName: string
  avatarUrl?: string
  handle: string
  cefrLevel?: CefrLevel
  xp: number
  canDailyBoost: boolean
  lessonsCompleted: number
  nextLessonDate?: string
  status: 'active' | 'paused'
}
