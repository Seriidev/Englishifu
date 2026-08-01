export type SkillTag =
  | 'speaking'
  | 'writing'
  | 'reading'
  | 'listening'
  | 'grammar'
  | 'toefl-full'

export interface TutorSpecialization {
  id: string
  title: string
  description: string
  skillTag: SkillTag
  studentsEnrolled: number
  rating: number
}

export interface TeachingActivityDay {
  date: string
  lessonsCount: number
}

export interface TutorPublicProfile {
  id: string
  handle: string
  firstName: string
  lastName: string
  avatarUrl?: string
  aboutMe: string
  yearsOfExperience: number
  certifications: string[]
  studentsCount: number
  reviewsCount: number
  averageRating: number
  specializations: TutorSpecialization[]
  teachingActivity: TeachingActivityDay[]
}

export const SKILL_COLORS: Record<SkillTag, string> = {
  speaking: '#f59e0b',
  writing: '#8b5cf6',
  reading: '#3b82f6',
  listening: '#10b981',
  grammar: '#ef4444',
  'toefl-full': '#4f7cff',
}

export const SKILL_LABELS: Record<SkillTag, string> = {
  speaking: 'Speaking',
  writing: 'Writing',
  reading: 'Reading',
  listening: 'Listening',
  grammar: 'Grammar',
  'toefl-full': 'TOEFL Full',
}
