import type { CefrLevel } from './cefr'

export type { CefrLevel }

export interface StudentGamificationState {
  userId: string
  level: number
  currentXP: number
  xpToNextLevel: number
  /** From Placement Test result when available */
  cefrLevel: CefrLevel
  weeklyStreak: number
  weeklyXP: number
  weeklyXPGoal: number
  streakFreezesAvailable: number
  lastActivityDate: string
  tokens: number
}

export type CourseStatus = 'in-progress' | 'not-started' | 'completed'
export type CourseDifficulty = 'Fundamental' | 'Intermediate' | 'Advanced'
export type SectionType =
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'theory'
export type SectionStatus = 'completed' | 'in-progress' | 'locked'

export interface CourseSectionProgress {
  id: string
  type: SectionType
  title: string
  status: SectionStatus
}

export interface CurrentCourseProgress {
  courseId: string
  courseTitle: string
  status: CourseStatus
  difficultyTag: CourseDifficulty
  estimatedMinutes: number
  overallProgressPercent: number
  sections: CourseSectionProgress[]
  thumbnailUrl?: string
}
