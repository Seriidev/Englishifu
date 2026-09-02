import type { TutorCertification, UserRole } from '../types/user'

export interface SignupFormInput {
  fullName: string
  email: string
  password: string
}

export interface SignupValidationErrors {
  fullName?: string
  email?: string
  password?: string
}

export interface TutorProfileFormInput {
  yearsOfExperience: number | ''
  certifications: TutorCertification[]
  aboutMe: string
}

export interface TutorProfileValidationErrors {
  yearsOfExperience?: string
  certifications?: string
  aboutMe?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateSignupForm(
  data: SignupFormInput,
  _role?: UserRole,
): SignupValidationErrors {
  const errors: SignupValidationErrors = {}

  if (!data.fullName?.trim()) {
    errors.fullName = 'Full name is required'
  } else if (data.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
    errors.fullName = 'Please enter your first and last name'
  }

  if (!data.email?.trim() || !emailRegex.test(data.email.trim())) {
    errors.email = 'Enter a valid email'
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  return errors
}

export function validateTutorProfileForm(
  data: TutorProfileFormInput,
): TutorProfileValidationErrors {
  const errors: TutorProfileValidationErrors = {}
  const years = data.yearsOfExperience

  if (
    years === '' ||
    years == null ||
    Number.isNaN(Number(years)) ||
    Number(years) < 0
  ) {
    errors.yearsOfExperience = 'Enter years of experience'
  }
  if ((data.certifications?.length ?? 0) < 1) {
    errors.certifications = 'Add at least one certification'
  }
  if (!data.aboutMe || data.aboutMe.trim().length < 50) {
    errors.aboutMe = 'Please write at least 50 characters about yourself'
  }

  return errors
}

export function hasSignupErrors(errors: SignupValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

export function hasProfileErrors(
  errors: TutorProfileValidationErrors,
): boolean {
  return Object.keys(errors).length > 0
}

export interface EditProfileFormData {
  fullName: string
  handle: string
  city?: string
  headline?: string
  summary?: string
}

export type EditProfileValidationErrors = Partial<
  Record<keyof EditProfileFormData, string>
>

export function validateEditProfileForm(
  data: EditProfileFormData,
): EditProfileValidationErrors {
  const errors: EditProfileValidationErrors = {}

  if (!data.fullName?.trim()) {
    errors.fullName = 'Full name is required'
  } else if (data.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
    errors.fullName = 'Please enter your first and last name'
  }

  const handle = data.handle?.replace(/^@/, '').trim().toLowerCase() ?? ''
  if (!handle) {
    errors.handle = 'Username is required'
  } else if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    errors.handle =
      'Username must be 3-20 characters, lowercase letters, numbers, and underscores only'
  }

  if (data.headline && data.headline.length > 80) {
    errors.headline = 'Headline must be 80 characters or less'
  }
  if (data.summary && data.summary.length > 1000) {
    errors.summary = 'Summary must be 1000 characters or less'
  }

  return errors
}

export function hasEditProfileErrors(
  errors: EditProfileValidationErrors,
): boolean {
  return Object.keys(errors).length > 0
}

export interface TutorEditProfileFormData {
  fullName: string
  handle: string
  position: string
  yearsOfExperience: number | ''
  hourlyRateUsd: number | ''
  aboutMe?: string
  certifications: TutorCertification[]
}

export type TutorEditProfileValidationErrors = Partial<
  Record<keyof TutorEditProfileFormData, string>
>

export function validateTutorEditProfileForm(
  data: TutorEditProfileFormData,
): TutorEditProfileValidationErrors {
  const errors: TutorEditProfileValidationErrors = {}
  if (!data.fullName?.trim()) errors.fullName = 'Full name is required'
  const handle = data.handle?.replace(/^@/, '').trim().toLowerCase() ?? ''
  if (!handle) {
    errors.handle = 'Username is required'
  } else if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    errors.handle =
      'Username must be 3-20 characters, lowercase letters, numbers, and underscores only'
  }
  if (!data.position) errors.position = 'Please select a position'

  const years = data.yearsOfExperience
  if (years === '' || years === undefined || Number.isNaN(Number(years))) {
    errors.yearsOfExperience = 'Enter years of experience'
  } else if (Number(years) < 0 || Number(years) > 60) {
    errors.yearsOfExperience = 'Enter a number between 0 and 60'
  }

  const rate = data.hourlyRateUsd
  if (rate === '' || rate === undefined || Number.isNaN(Number(rate))) {
    errors.hourlyRateUsd = 'Enter your hourly rate'
  } else if (Number(rate) < 20) {
    errors.hourlyRateUsd = 'Minimum rate is $20 per hour'
  } else if (Number(rate) > 500) {
    errors.hourlyRateUsd = 'Enter a rate of $500 or less'
  }

  return errors
}

/** All required profile fields filled — Send resume can be enabled. */
export function canSendTutorResume(data: TutorEditProfileFormData): boolean {
  if (Object.keys(validateTutorEditProfileForm(data)).length > 0) return false
  if ((data.aboutMe?.trim().length ?? 0) < 50) return false
  return data.certifications.length >= 1
}
