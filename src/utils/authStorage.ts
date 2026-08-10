import {
  isTutorProfileComplete,
  type PublicUser,
  type StudentProfile,
  type TutorCertification,
  type TutorPosition,
  type TutorProfile,
  type UserProfile,
  type UserRole,
} from '../types/user'
import type { CefrLevel } from '../types/cefr'
import { normalizeCertifications } from './certifications'

const USERS_KEY = 'englishifu_users_v1'
const SESSION_KEY = 'englishifu_session_v1'

/** Legacy shape before fullName migration */
type LegacyNameFields = {
  firstName?: string
  lastName?: string
  fullName?: string
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function slugifyHandle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 20)
}

function collectTakenHandles(users: UserProfile[]): Set<string> {
  const taken = new Set<string>()
  for (const u of users) {
    if ('handle' in u && u.handle) {
      taken.add(u.handle.toLowerCase())
    }
  }
  return taken
}

function makeHandle(fullName: string, email: string, taken: Set<string>): string {
  const base =
    slugifyHandle(fullName.replace(/\s+/g, '')) ||
    slugifyHandle(email.split('@')[0] ?? '') ||
    'user'

  if (!taken.has(base) && base.length >= 3) return base
  let i = 2
  while (taken.has(`${base}${i}`) || `${base}${i}`.length < 3) i++
  return `${base}${i}`.slice(0, 20)
}

function resolveFullName(user: LegacyNameFields): string {
  if (user.fullName?.trim()) return user.fullName.trim()
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
}

function migrateUser(
  raw: UserProfile & LegacyNameFields,
  taken: Set<string>,
): UserProfile {
  const fullName = resolveFullName(raw) || 'User'
  const withoutLegacy = { ...raw } as UserProfile & LegacyNameFields
  delete withoutLegacy.firstName
  delete withoutLegacy.lastName

  if (raw.role === 'tutor') {
    const legacy = withoutLegacy as TutorProfile & {
      position?: TutorPosition
      isPublicProfile?: boolean
      dailyStreak?: number
    }
    const handle = raw.handle || makeHandle(fullName, raw.email, taken)
    if (!raw.handle) taken.add(handle)
    return {
      ...legacy,
      role: 'tutor',
      fullName,
      handle,
      status: raw.status,
      position: legacy.position ?? 'Teacher',
      isPublicProfile: legacy.isPublicProfile ?? true,
      dailyStreak: legacy.dailyStreak ?? 0,
      certifications: normalizeCertifications(legacy.certifications),
    }
  }

  const student = withoutLegacy as StudentProfile & {
    handle?: string
    isPublicProfile?: boolean
  }
  const handle =
    student.handle || makeHandle(fullName, raw.email, taken)
  if (!student.handle) taken.add(handle)

  return {
    ...student,
    role: 'student',
    fullName,
    handle,
    isPublicProfile: student.isPublicProfile ?? true,
  }
}

function readUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<UserProfile & LegacyNameFields>
    const taken = collectTakenHandles(parsed as UserProfile[])

    let changed = false
    const users = parsed.map((user) => {
      const before = JSON.stringify(user)
      const next = migrateUser(user, taken)
      if (JSON.stringify(next) !== before) changed = true
      return next
    })

    if (changed) writeUsers(users)
    return users
  } catch {
    return []
  }
}

function writeUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function toPublic(user: UserProfile): PublicUser {
  const { passwordHash: _hash, ...rest } = user
  return rest
}

export async function hashPassword(password: string): Promise<string> {
  return sha256Hex(password)
}

export function getSessionUser(): PublicUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as PublicUser & LegacyNameFields
    const fresh = findUserByEmail(session.email)
    if (!fresh) return session as PublicUser
    const publicUser = toPublic(fresh)
    if (!('fullName' in session) || !session.fullName || !session.handle) {
      setSessionUser(publicUser)
    }
    return publicUser
  } catch {
    return null
  }
}

export function setSessionUser(user: PublicUser | null) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function findUserByEmail(email: string): UserProfile | undefined {
  const normalized = email.trim().toLowerCase()
  return readUsers().find((u) => u.email.toLowerCase() === normalized)
}

export function isHandleTaken(handle: string, excludeUserId?: string): boolean {
  const normalized = handle.replace(/^@/, '').toLowerCase()
  return readUsers().some(
    (u) =>
      'handle' in u &&
      u.handle?.toLowerCase() === normalized &&
      u.id !== excludeUserId,
  )
}

export function createUniqueHandle(fullName: string, email: string): string {
  return makeHandle(fullName, email, collectTakenHandles(readUsers()))
}

/** @deprecated use createUniqueHandle(fullName, email) */
export function createUniqueTutorHandle(
  firstName: string,
  lastName: string,
  email: string,
): string {
  return createUniqueHandle(`${firstName} ${lastName}`, email)
}

export function findTutorByHandle(handle: string): PublicUser | null {
  const normalized = handle.replace(/^@/, '').toLowerCase()
  const user = readUsers().find(
    (u) => u.role === 'tutor' && u.handle.toLowerCase() === normalized,
  )
  return user ? toPublic(user) : null
}

export function findStudentByHandle(handle: string): PublicUser | null {
  const normalized = handle.replace(/^@/, '').toLowerCase()
  const user = readUsers().find(
    (u) => u.role === 'student' && u.handle.toLowerCase() === normalized,
  )
  return user ? toPublic(user) : null
}

export function tutorProfilePath(handle: string): string {
  return `/tutor/profile/${handle.replace(/^@/, '')}`
}

export function studentPublicProfilePath(handle: string): string {
  return `/profile/${handle.replace(/^@/, '')}`
}

export interface CreateStudentInput {
  fullName: string
  email: string
  password: string
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
  position: TutorPosition
  aboutMe?: string
  yearsOfExperience?: number
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
  if (findUserByEmail(input.email)) {
    return { error: 'An account with this email already exists' }
  }

  const fullName = input.fullName.trim()
  const email = input.email.trim().toLowerCase()

  const user: StudentProfile = {
    id: crypto.randomUUID(),
    fullName,
    email,
    passwordHash: await hashPassword(input.password),
    role: 'student',
    handle: createUniqueHandle(fullName, email),
    isPublicProfile: true,
    createdAt: new Date().toISOString(),
  }

  const users = readUsers()
  users.push(user)
  writeUsers(users)

  const publicUser = toPublic(user)
  setSessionUser(publicUser)
  return { user: publicUser }
}

export async function registerTutor(
  input: CreateTutorInput,
): Promise<{ user: PublicUser } | { error: string }> {
  if (findUserByEmail(input.email)) {
    return { error: 'An account with this email already exists' }
  }

  const fullName = input.fullName.trim()
  const email = input.email.trim().toLowerCase()

  const user: TutorProfile = {
    id: crypto.randomUUID(),
    fullName,
    email,
    passwordHash: await hashPassword(input.password),
    role: 'tutor',
    handle: createUniqueHandle(fullName, email),
    status: 'incomplete',
    position: 'Teacher',
    isPublicProfile: true,
    dailyStreak: 0,
    createdAt: new Date().toISOString(),
  }

  const users = readUsers()
  users.push(user)
  writeUsers(users)

  const publicUser = toPublic(user)
  setSessionUser(publicUser)
  return { user: publicUser }
}

export function completeTutorProfile(
  userId: string,
  input: CompleteTutorProfileInput,
  options?: { requireModeration?: boolean },
): { user: PublicUser } | { error: string } {
  const users = readUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index < 0) return { error: 'User not found' }

  const existing = users[index]
  if (existing.role !== 'tutor') return { error: 'Not a tutor account' }

  const draft: TutorProfile = {
    ...existing,
    yearsOfExperience: input.yearsOfExperience,
    certifications: normalizeCertifications(input.certifications),
    aboutMe: input.aboutMe.trim(),
  }

  if (!isTutorProfileComplete(draft)) {
    return {
      error:
        'Fill years of experience, at least one certification, and about me (50+ chars)',
    }
  }

  const status = options?.requireModeration ? 'pending' : 'approved'
  const updated: TutorProfile = { ...draft, status }
  users[index] = updated
  writeUsers(users)

  const publicUser = toPublic(updated)
  setSessionUser(publicUser)
  return { user: publicUser }
}

export function updateStudentProfile(
  userId: string,
  input: UpdateStudentProfileInput,
): { user: PublicUser } | { error: string } {
  const users = readUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index < 0) return { error: 'User not found' }

  const existing = users[index]
  if (existing.role !== 'student') return { error: 'Not a student account' }

  const handle = input.handle.replace(/^@/, '').trim().toLowerCase()
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    return {
      error:
        'Username must be 3-20 characters, lowercase letters, numbers, and underscores only',
    }
  }
  if (isHandleTaken(handle, userId)) {
    return { error: 'Username is already taken' }
  }

  const updated: StudentProfile = {
    ...existing,
    fullName: input.fullName.trim(),
    handle,
    city: input.city?.trim() || undefined,
    headline: input.headline?.trim() || undefined,
    summary: input.summary?.trim() || undefined,
    avatarUrl: input.avatarUrl ?? existing.avatarUrl,
    isPublicProfile: input.isPublicProfile ?? existing.isPublicProfile,
    cefrLevel: existing.cefrLevel,
    placementCompletedAt: existing.placementCompletedAt,
  }

  users[index] = updated
  writeUsers(users)

  const publicUser = toPublic(updated)
  setSessionUser(publicUser)
  return { user: publicUser }
}

/** Persist Placement Test CEFR rank on the student profile */
export function saveStudentPlacementResult(
  userId: string,
  input: SaveStudentPlacementInput,
): { user: PublicUser } | { error: string } {
  const users = readUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index < 0) return { error: 'User not found' }

  const existing = users[index]
  if (existing.role !== 'student') return { error: 'Not a student account' }

  const updated: StudentProfile = {
    ...existing,
    cefrLevel: input.cefrLevel,
    placementCompletedAt: input.completedAt,
  }

  users[index] = updated
  writeUsers(users)

  const publicUser = toPublic(updated)
  setSessionUser(publicUser)
  return { user: publicUser }
}

export function updateTutorProfile(
  userId: string,
  input: UpdateTutorProfileInput,
): { user: PublicUser } | { error: string } {
  const users = readUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index < 0) return { error: 'User not found' }

  const existing = users[index]
  if (existing.role !== 'tutor') return { error: 'Not a tutor account' }

  if (!input.fullName.trim()) {
    return { error: 'Full name is required' }
  }
  if (!input.position) {
    return { error: 'Please select a position' }
  }

  const updated: TutorProfile = {
    ...existing,
    fullName: input.fullName.trim(),
    position: input.position,
    aboutMe: input.aboutMe?.trim() || existing.aboutMe,
    yearsOfExperience:
      input.yearsOfExperience !== undefined
        ? input.yearsOfExperience
        : existing.yearsOfExperience,
    avatarUrl: input.avatarUrl ?? existing.avatarUrl,
    isPublicProfile: input.isPublicProfile ?? existing.isPublicProfile,
    certifications:
      input.certifications !== undefined
        ? normalizeCertifications(input.certifications)
        : existing.certifications,
  }

  users[index] = updated
  writeUsers(users)

  const publicUser = toPublic(updated)
  setSessionUser(publicUser)
  return { user: publicUser }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: PublicUser } | { error: string }> {
  const existing = findUserByEmail(email)
  if (!existing) {
    return { error: 'No account found with this email' }
  }

  const hash = await hashPassword(password)
  if (existing.passwordHash !== hash) {
    return { error: 'Incorrect email or password' }
  }

  const publicUser = toPublic(existing)
  setSessionUser(publicUser)
  return { user: publicUser }
}

export function logoutSession() {
  setSessionUser(null)
}

export function dashboardPathForRole(
  role: UserRole,
  user?: PublicUser | null,
): string {
  if (role === 'tutor') {
    if (user?.role === 'tutor' && user.handle) {
      return tutorProfilePath(user.handle)
    }
    return '/tutor/profile/sarahchen'
  }
  if (role === 'student') {
    return '/study'
  }
  return '/start'
}
