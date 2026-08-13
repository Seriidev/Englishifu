import type { CefrLevel } from './cefr'

export type UserRole = 'student' | 'tutor'

export type TutorStatus = 'incomplete' | 'pending' | 'approved'

export type TutorPosition = 'Teacher' | 'Speaker' | 'Specialist'

export type { CefrLevel }

export interface TutorCertification {
  id: string
  name: string
  imageUrl?: string
  uploadedAt?: string
}

export interface BaseUser {
  id: string
  fullName: string
  email: string
  /** SHA-256 hex — never store plain password */
  passwordHash: string
  role: UserRole
  createdAt: string
}

export interface StudentProfile extends BaseUser {
  role: 'student'
  /** Public URL slug: /profile/{handle} */
  handle: string
  avatarUrl?: string
  city?: string
  headline?: string
  summary?: string
  isPublicProfile: boolean
  /** Set after Placement Test — student rank badge */
  cefrLevel?: CefrLevel
  placementCompletedAt?: string
}

export interface TutorProfile extends BaseUser {
  role: 'tutor'
  /** Public URL slug: /tutor/profile/{handle} */
  handle: string
  status: TutorStatus
  position: TutorPosition
  avatarUrl?: string
  isPublicProfile: boolean
  dailyStreak: number
  /** Filled on Complete Profile step / shown as Summary */
  yearsOfExperience?: number
  /** Hourly lesson rate in USD — minimum $20 */
  hourlyRateUsd?: number
  certifications?: TutorCertification[]
  aboutMe?: string
}

export type UserProfile = StudentProfile | TutorProfile

export type PublicStudent = Omit<StudentProfile, 'passwordHash'>
export type PublicTutor = Omit<TutorProfile, 'passwordHash'>
export type PublicUser = PublicStudent | PublicTutor

export function isTutorProfileComplete(
  tutor: Pick<
    TutorProfile,
    'yearsOfExperience' | 'certifications' | 'aboutMe'
  >,
): boolean {
  return (
    tutor.yearsOfExperience !== undefined &&
    tutor.yearsOfExperience >= 0 &&
    (tutor.certifications?.length ?? 0) >= 1 &&
    (tutor.aboutMe?.trim().length ?? 0) >= 50
  )
}
