import type { UserRole } from '../types/user'

export interface SignupFormInput {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface SignupValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export interface TutorProfileFormInput {
  yearsOfExperience: number | ''
  certifications: string[]
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
  _role: UserRole,
): SignupValidationErrors {
  const errors: SignupValidationErrors = {}

  if (!data.firstName.trim()) errors.firstName = 'First name is required'
  if (!data.lastName.trim()) errors.lastName = 'Last name is required'

  if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
    errors.email = 'Enter a valid email'
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (!/\d/.test(data.password)) {
    errors.password = 'Password must include at least one number'
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export function validateTutorProfileForm(
  data: TutorProfileFormInput,
): TutorProfileValidationErrors {
  const errors: TutorProfileValidationErrors = {}
  const years = data.yearsOfExperience

  if (years === '' || years == null || Number.isNaN(Number(years)) || Number(years) < 0) {
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
