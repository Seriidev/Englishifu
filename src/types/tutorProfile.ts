import type { TutorCertification, TutorPosition } from './user'

export type { TutorCertification, TutorPosition }

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

/** Display model for tutor public profile UI */
export interface TutorPublicProfile {
  id: string
  handle: string
  fullName: string
  position: TutorPosition
  avatarUrl?: string
  aboutMe: string
  yearsOfExperience: number
  certifications: TutorCertification[]
  isPublicProfile: boolean
  dailyStreak: number
  studentsCount: number
  reviewsCount: number
  averageRating: number
  specializations: TutorSpecialization[]
  teachingActivity: TeachingActivityDay[]
  classesStats: TutorClassesStats
  kpis: TutorKPI[]
  kpiChart: TutorKpiChart
}

export interface TutorClassesStats {
  totalStudents: number
  totalClasses: number
  speakingClubSessions: number
}

export interface TutorKPI {
  id: string
  label: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
}

/** Dual-series area chart point for KPI tab */
export interface TutorKpiChartPoint {
  date: string
  primary: number
  secondary: number
}

export interface TutorKpiChart {
  title: string
  primaryLabel: string
  secondaryLabel: string
  /** Unit suffix for Y-axis / tooltip, e.g. "" or "h" */
  primaryUnit?: string
  secondaryUnit?: string
  points: TutorKpiChartPoint[]
}

export const TUTOR_POSITIONS: TutorPosition[] = [
  'Teacher',
  'Speaker',
  'Specialist',
]

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
