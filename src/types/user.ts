export type UserRole = 'student' | 'tutor'

export type TutorStatus = 'incomplete' | 'pending' | 'approved'

export interface BaseUser {
  id: string
  firstName: string
  lastName: string
  email: string
  /** SHA-256 hex — never store plain password */
  passwordHash: string
  role: UserRole
  createdAt: string
}

export interface StudentProfile extends BaseUser {
  role: 'student'
}

export interface TutorProfile extends BaseUser {
  role: 'tutor'
  /** Public URL slug: /tutors/{handle} */
  handle: string
  status: TutorStatus
  /** Filled on Complete Profile step */
  yearsOfExperience?: number
  certifications?: string[]
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
