import {
  isTutorProfileComplete,
  type PublicUser,
  type TutorCertification,
  type TutorPosition,
  type TutorStatus,
  type UserRole,
} from '../types/user'
import type { CefrLevel } from '../types/cefr'
import { setApiToken } from './bookingApi'

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    if (data?.error) return data.error
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`
}

type AuthOk = { user: PublicUser; token?: string }
type AuthErr = { error: string }

async function readAuthResponse(res: Response): Promise<AuthOk | AuthErr> {
  let data: { user?: PublicUser; token?: string; error?: string } = {}
  try {
    data = (await res.json()) as typeof data
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    return { error: data.error || (await parseError(res)) }
  }
  if (!data.user) return { error: 'Invalid server response' }
  if (data.token) setApiToken(data.token)
  return { user: data.user, token: data.token }
}

/** Hydrate session from httpOnly cookie (and refresh Bearer token). */
export async function fetchSessionUser(): Promise<PublicUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
    if (!res.ok) return null
    const result = await readAuthResponse(res)
    if ('error' in result) return null
    return result.user
  } catch {
    return null
  }
}

/**
 * @deprecated Sync localStorage session removed — always returns null.
 * Use fetchSessionUser() or AuthContext.user instead.
 */
export function getSessionUser(): PublicUser | null {
  return null
}

/** @deprecated No-op — session lives in httpOnly cookie + AuthContext. */
export function setSessionUser(_user: PublicUser | null) {
  /* no-op */
}

export function tutorProfilePath(handle: string): string {
  return `/tutor/profile/${handle.replace(/^@/, '')}`
}

export function studentPublicProfilePath(handle: string): string {
  return `/profile/${handle.replace(/^@/, '')}`
}

export async function findTutorByHandle(
  handle: string,
): Promise<PublicUser | null> {
  const normalized = handle.replace(/^@/, '').trim().toLowerCase()
  if (!normalized) return null
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(normalized)}`, {
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { user?: PublicUser }
    if (!data.user || data.user.role !== 'tutor') return null
    return data.user
  } catch {
    return null
  }
}

export async function findStudentByHandle(
  handle: string,
): Promise<PublicUser | null> {
  const normalized = handle.replace(/^@/, '').trim().toLowerCase()
  if (!normalized) return null
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(normalized)}`, {
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { user?: PublicUser }
    if (!data.user || data.user.role !== 'student') return null
    return data.user
  } catch {
    return null
  }
}

export interface CreateStudentInput {
  fullName: string
  email: string
  password: string
  referralCode?: string
  marketingOptIn?: boolean
}

export type CreateTutorInput = CreateStudentInput

export interface CompleteTutorProfileInput {
  yearsOfExperience: number
  certifications: TutorCertification[]
  aboutMe: string
}

export interface UpdateStudentProfileInput {
  fullName: string
  handle: string
  city?: string
  headline?: string
  summary?: string
  avatarUrl?: string
  isPublicProfile?: boolean
}

export interface UpdateTutorProfileInput {
  fullName: string
  handle?: string
  position: TutorPosition
  aboutMe?: string
  yearsOfExperience?: number
  hourlyRateUsd?: number
  avatarUrl?: string
  isPublicProfile?: boolean
  certifications?: TutorCertification[]
}

export interface SaveStudentPlacementInput {
  cefrLevel: CefrLevel
  completedAt: string
}

export async function registerStudent(
  input: CreateStudentInput,
): Promise<{ user: PublicUser } | { error: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        role: 'student',
        fullName: input.fullName,
        email: input.email,
        password: input.password,
        referralCode: input.referralCode || undefined,
        marketingOptIn: Boolean(input.marketingOptIn),
      }),
    })
    return readAuthResponse(res)
  } catch {
    return {
      error:
        'Could not reach auth API. Use vercel dev or a deployed preview with Postgres.',
    }
  }
}

export async function registerTutor(
  input: CreateTutorInput,
): Promise<{ user: PublicUser } | { error: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        role: 'tutor',
        fullName: input.fullName,
        email: input.email,
        password: input.password,
        referralCode: input.referralCode || undefined,
        marketingOptIn: Boolean(input.marketingOptIn),
      }),
    })
    return readAuthResponse(res)
  } catch {
    return {
      error:
        'Could not reach auth API. Use vercel dev or a deployed preview with Postgres.',
    }
  }
}

export async function completeTutorProfile(
  _userId: string,
  input: CompleteTutorProfileInput,
  _options?: { requireModeration?: boolean },
): Promise<{ user: PublicUser } | { error: string }> {
  if (!isTutorProfileComplete(input)) {
    return {
      error:
        'Fill years of experience, at least one certification, and about me (50+ chars)',
    }
  }
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'completeProfile',
        yearsOfExperience: input.yearsOfExperience,
        certifications: input.certifications,
        aboutMe: input.aboutMe,
      }),
    })
    return readAuthResponse(res)
  } catch {
    return { error: 'Could not update tutor profile' }
  }
}

export async function updateStudentProfile(
  _userId: string,
  input: UpdateStudentProfileInput,
): Promise<{ user: PublicUser } | { error: string }> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'update', ...input }),
    })
    return readAuthResponse(res)
  } catch {
    return { error: 'Could not update profile' }
  }
}

export async function saveStudentPlacementResult(
  _userId: string,
  input: SaveStudentPlacementInput,
): Promise<{ user: PublicUser } | { error: string }> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'placement',
        cefrLevel: input.cefrLevel,
        completedAt: input.completedAt,
      }),
    })
    return readAuthResponse(res)
  } catch {
    return { error: 'Could not save placement result' }
  }
}

export async function updateTutorProfile(
  _userId: string,
  input: UpdateTutorProfileInput,
): Promise<{ user: PublicUser } | { error: string }> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'update', ...input }),
    })
    return readAuthResponse(res)
  } catch {
    return { error: 'Could not update tutor profile' }
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ user: PublicUser } | { error: string }> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'changePassword',
        currentPassword,
        newPassword,
      }),
    })
    return readAuthResponse(res)
  } catch {
    return { error: 'Could not update password' }
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: PublicUser } | { error: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    return readAuthResponse(res)
  } catch {
    return {
      error:
        'Could not reach auth API. Use vercel dev or a deployed preview with Postgres.',
    }
  }
}

export async function logoutSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    /* ignore */
  }
}

/** Merge Postgres moderation status onto an in-memory tutor user. */
export function applyTutorServerStatus(
  status: TutorStatus,
  current: PublicUser | null = null,
): PublicUser | null {
  if (!current || current.role !== 'tutor') return current
  if (current.status === status) return current
  return { ...current, status }
}

export function dashboardPathForRole(
  role: UserRole,
  user?: PublicUser | null,
): string {
  if (role === 'tutor') {
    return '/tutor'
  }
  if (role === 'student') {
    return '/study'
  }
  return '/start'
}
