import type { LucideIcon } from 'lucide-react'

export interface ContinueSelfStudyData {
  courseName: string
  unitLabel: string
  progressPercent: number
  estimatedMinutes: number
}

export interface QuickActionData {
  title: string
  description: string
  avatarStack?: string[]
  metaText: string
  metaColor: 'indigo' | 'orange'
  ctaLabel: string
  ctaPath: string
  accentBg: string
}

export type BookingMeetingStatus = 'link-available' | 'spots-info' | 'upcoming'

export interface BookingItem {
  id: string
  date: string
  dateSubtext: string
  time: string
  type: 'tutor-lesson' | 'speaking-club'
  title: string
  subtitle?: string
  avatarUrl?: string
  meetingStatus: BookingMeetingStatus
  spotsInfo?: string
  canJoin: boolean
  daysUntil?: number
}

export interface StudyStatData {
  id: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  trend: string
  trendPositive: boolean
  sparkline: number[]
}

export interface StudyPlaceHeaderData {
  firstName: string
  xp: number
  streakDays: number
  level: number
  hasNotifications: boolean
  avatarUrl?: string
  isOnline?: boolean
}
