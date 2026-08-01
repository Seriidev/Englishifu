import {
  isTutorProfileComplete,
  type PublicUser,
  type StudentProfile,
  type TutorProfile,
  type UserProfile,
  type UserRole,
} from '../types/user'

const USERS_KEY = 'englishifu_users_v1'
const SESSION_KEY = 'englishifu_session_v1'

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
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24)
}

function makeHandle(
  firstName: string,
  lastName: string,
  email: string,
  taken: Set<string>,
): string {
  const base =
    slugifyHandle(`${firstName}${lastName}`) ||
    slugifyHandle(email.split('@')[0] ?? '') ||
    'tutor'

  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}${i}`)) i++
  return `${base}${i}`
}

function readUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as UserProfile[]
    const taken = new Set(
      parsed
        .filter((u): u is TutorProfile => u.role === 'tutor' && Boolean(u.handle))
        .map((u) => u.handle.toLowerCase()),
    )

    let changed = false
    const users = parsed.map((user) => {
      if (user.role !== 'tutor' || user.handle) return user
      const handle = makeHandle(
        user.firstName,
        user.lastName,
        user.email,
        taken,
      )
      taken.add(handle)
      changed = true
      return { ...user, handle }
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
    const session = JSON.parse(raw) as PublicUser
    if (session.role === 'tutor' && !session.handle) {
      const fresh = findTutorByEmail(session.email)
      if (fresh) {
        setSessionUser(fresh)
        return fresh
      }
    }
    return session
  } catch {
    return null
  }
}

function findTutorByEmail(email: string): PublicUser | null {
  const user = findUserByEmail(email)
  return user?.role === 'tutor' ? toPublic(user) : null
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

export function createUniqueTutorHandle(
  firstName: string,
  lastName: string,
  email: string,
): string {
  const users = readUsers()
  const taken = new Set(
    users
      .filter((u): u is TutorProfile => u.role === 'tutor')
      .map((u) => u.handle.toLowerCase()),
  )
  return makeHandle(firstName, lastName, email, taken)
}

export function findTutorByHandle(handle: string): PublicUser | null {
  const normalized = handle.replace(/^@/, '').toLowerCase()
  const user = readUsers().find(
    (u) => u.role === 'tutor' && u.handle.toLowerCase() === normalized,
  )
  return user ? toPublic(user) : null
}

export function tutorProfilePath(handle: string): string {
  return `/tutors/${handle.replace(/^@/, '')}`
}

export interface CreateStudentInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type CreateTutorInput = CreateStudentInput

export interface CompleteTutorProfileInput {
  yearsOfExperience: number
  certifications: string[]
  aboutMe: string
}

export async function registerStudent(
  input: CreateStudentInput,
): Promise<{ user: PublicUser } | { error: string }> {
  if (findUserByEmail(input.email)) {
    return { error: 'An account with this email already exists' }
  }

  const user: StudentProfile = {
    id: crypto.randomUUID(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: await hashPassword(input.password),
    role: 'student',
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

  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const email = input.email.trim().toLowerCase()

  const user: TutorProfile = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    passwordHash: await hashPassword(input.password),
    role: 'tutor',
    handle: createUniqueTutorHandle(firstName, lastName, email),
    status: 'incomplete',
    createdAt: new Date().toISOString(),
  }

  const users = readUsers()
  users.push(user)
  writeUsers(users)

  const publicUser = toPublic(user)
  setSessionUser(publicUser)
  return { user: publicUser }
}

/**
 * Completes tutor profile. Without moderation we set `approved` when complete;
 * otherwise stays `incomplete`. Field `pending` is reserved for future review.
 */
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
    certifications: input.certifications,
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

export function dashboardPathForRole(role: UserRole, user?: PublicUser | null): string {
  if (role === 'tutor') {
    if (user?.role === 'tutor' && user.handle) {
      return tutorProfilePath(user.handle)
    }
    return '/tutors/sarahchen'
  }
  return '/dashboard'
}
