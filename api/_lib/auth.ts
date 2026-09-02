import { createHmac, randomUUID, timingSafeEqual } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'
import { sql } from './db'
import {
  rowToPublicUser,
  type AppUserRow,
  type PublicUserDto,
} from './userMapper'

export type AppRole = 'student' | 'tutor'

export interface AuthUser {
  id: string
  role: AppRole
  handle: string
  fullName: string
  email: string
  avatarUrl?: string | null
}

export type { AppUserRow, PublicUserDto }

const SESSION_COOKIE = 'session_token'
const TOKEN_TTL_SEC = 60 * 60 * 24 * 30 // 30 days
const LEGACY_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14

function sessionSecret(): string | null {
  return (
    process.env.SESSION_SECRET ||
    process.env.JWT_SECRET ||
    process.env.BOOKING_AUTH_SECRET ||
    null
  )
}

function cookieSecure(): boolean {
  // Vercel preview/production are HTTPS; local vercel dev is usually HTTP.
  return Boolean(process.env.VERCEL) && process.env.VERCEL_ENV !== 'development'
}

/**
 * JWT session. Payload is ONLY `{ userId }` — never the full user
 * (avatar data URLs in the cookie caused HTTP 431).
 */
export function signToken(user: AuthUser | string): string {
  const secret = sessionSecret()
  if (!secret) throw new Error('SESSION_SECRET is not configured')
  const userId = typeof user === 'string' ? user : user.id
  return jwt.sign({ userId }, secret, { expiresIn: TOKEN_TTL_SEC })
}

export function readUserIdFromToken(token: string): string | null {
  const secret = sessionSecret()
  if (!secret) return null
  try {
    const payload = jwt.verify(token, secret) as {
      userId?: string
      sub?: string
    }
    const id = payload.userId || payload.sub
    return id || null
  } catch {
    return null
  }
}

/** @deprecated Profile fields are loaded from DB — token only has userId. */
export function verifyToken(token: string): AuthUser | null {
  const id = readUserIdFromToken(token)
  return id ? { id, role: 'student', handle: '', fullName: '', email: '' } : null
}

/** @deprecated Prefer signToken — kept as alias for booking bridge callers. */
export function signSessionToken(user: AuthUser): string {
  return signToken(user)
}

/** Legacy HMAC tokens issued before JWT migration. */
function verifyLegacyHmacToken(token: string): AuthUser | null {
  const secret = sessionSecret()
  if (!secret) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }

  try {
    const pad = body.length % 4 === 0 ? '' : '='.repeat(4 - (body.length % 4))
    const normalized = body.replace(/-/g, '+').replace(/_/g, '/') + pad
    const payload = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8')) as {
      sub?: string
      role?: AppRole
      handle?: string
      fullName?: string
      email?: string
      exp?: number
    }
    if (!payload?.sub || !payload.role || !payload.exp) return null
    if (payload.exp < Date.now()) return null
    if (payload.role !== 'student' && payload.role !== 'tutor') return null
    return {
      id: payload.sub,
      role: payload.role,
      handle: payload.handle || '',
      fullName: payload.fullName || '',
      email: payload.email || '',
    }
  } catch {
    return null
  }
}

function readUserIdFromLegacyHmac(token: string): string | null {
  return verifyLegacyHmacToken(token)?.id ?? null
}

export function verifySessionToken(token: string): AuthUser | null {
  return verifyToken(token) || verifyLegacyHmacToken(token)
}

export function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization
  if (!header || typeof header !== 'string') return null
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token.trim()
}

export function getSessionCookie(req: VercelRequest): string | null {
  const raw = req.headers.cookie
  if (!raw || typeof raw !== 'string') return null
  const parts = raw.split(';')
  for (const part of parts) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const name = part.slice(0, idx).trim()
    if (name !== SESSION_COOKIE) continue
    return decodeURIComponent(part.slice(idx + 1).trim())
  }
  return null
}

export function setSessionCookie(res: VercelResponse, token: string) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${TOKEN_TTL_SEC}`,
  ]
  if (cookieSecure()) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

export function clearSessionCookie(res: VercelResponse) {
  const parts = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ]
  if (cookieSecure()) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

export async function getAuthenticatedUser(
  req: VercelRequest,
): Promise<AuthUser | null> {
  const token = getSessionCookie(req) || getBearerToken(req)
  if (!token) return null
  const userId =
    readUserIdFromToken(token) || readUserIdFromLegacyHmac(token)
  if (!userId) return null
  try {
    const row = await fetchAppUserById(userId)
    if (!row) return null
    if (row.is_suspended) return null
    return authUserFromRow(row)
  } catch {
    return null
  }
}

export async function fetchAppUserById(id: string): Promise<AppUserRow | null> {
  const { rows } = await sql`
    SELECT *
    FROM app_users
    WHERE id = ${id}
    LIMIT 1
  `
  return (rows[0] as AppUserRow) || null
}

export async function fetchAppUserByEmail(
  email: string,
): Promise<AppUserRow | null> {
  const normalized = email.trim().toLowerCase()
  const { rows } = await sql`
    SELECT *
    FROM app_users
    WHERE lower(email) = ${normalized}
    LIMIT 1
  `
  return (rows[0] as AppUserRow) || null
}

export async function fetchAppUserByHandle(
  handle: string,
): Promise<AppUserRow | null> {
  const normalized = handle.replace(/^@/, '').trim().toLowerCase()
  const { rows } = await sql`
    SELECT *
    FROM app_users
    WHERE lower(handle) = ${normalized}
    LIMIT 1
  `
  return (rows[0] as AppUserRow) || null
}

export function authUserFromRow(row: AppUserRow): AuthUser {
  return {
    id: row.id,
    role: row.role,
    handle: row.handle,
    fullName: row.full_name,
    email: row.email,
    avatarUrl: row.avatar_url,
  }
}

export function issueSession(
  res: VercelResponse,
  row: AppUserRow,
): { user: PublicUserDto; token: string } {
  const authUser = authUserFromRow(row)
  const token = signToken(authUser)
  setSessionCookie(res, token)
  return { user: rowToPublicUser(row), token }
}

export async function upsertAppUser(user: AuthUser): Promise<void> {
  await sql`
    INSERT INTO app_users (id, handle, role, full_name, email, avatar_url, updated_at)
    VALUES (
      ${user.id},
      ${user.handle.toLowerCase()},
      ${user.role},
      ${user.fullName},
      ${user.email.toLowerCase()},
      ${user.avatarUrl ?? null},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      handle = EXCLUDED.handle,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      avatar_url = COALESCE(EXCLUDED.avatar_url, app_users.avatar_url),
      updated_at = NOW()
  `
}

export function newUserId(): string {
  return randomUUID()
}

export function slugifyHandle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 20)
}

export async function allocateUniqueHandle(
  fullName: string,
  email: string,
): Promise<string> {
  const base =
    slugifyHandle(fullName.replace(/\s+/g, '')) ||
    slugifyHandle(email.split('@')[0] ?? '') ||
    'user'

  const tryHandle = async (candidate: string) => {
    const existing = await fetchAppUserByHandle(candidate)
    return !existing
  }

  if (base.length >= 3 && (await tryHandle(base))) return base

  let i = 2
  for (;;) {
    const candidate = `${base}${i}`.slice(0, 20)
    if (candidate.length >= 3 && (await tryHandle(candidate))) return candidate
    i++
    if (i > 9999) return `${base}${Date.now()}`.slice(0, 20)
  }
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export function applyCors(res: {
  setHeader: (k: string, v: string) => void
}) {
  const headers = corsHeaders()
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
}

// Silence unused legacy constant (kept for reference if HMAC re-issue needed)
void LEGACY_TOKEN_TTL_MS
