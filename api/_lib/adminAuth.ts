import { createHmac, timingSafeEqual } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const COOKIE_NAME = 'englishcore_admin'
const TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

function adminSecret(): string | null {
  return (
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_SECRET ||
    process.env.SESSION_SECRET ||
    null
  )
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createAdminSessionToken(): string {
  const secret = adminSecret()
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured')
  const body = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Date.now() + TTL_MS }),
  ).toString('base64url')
  return `${body}.${sign(body, secret)}`
}

export function verifyAdminToken(token: string): boolean {
  const secret = adminSecret()
  if (!secret) return false
  const [body, sig] = token.split('.')
  if (!body || !sig) return false
  const expected = sign(body, secret)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  } catch {
    return false
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8'),
    ) as { role?: string; exp?: number }
    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now()
  } catch {
    return false
  }
}

export function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie
  if (!header || typeof header !== 'string') return {}
  const out: Record<string, string> = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const key = part.slice(0, idx).trim()
    const val = part.slice(idx + 1).trim()
    out[key] = decodeURIComponent(val)
  }
  return out
}

export function verifyAdminSession(req: VercelRequest): boolean {
  const cookies = parseCookies(req)
  const fromCookie = cookies[COOKIE_NAME]
  if (fromCookie && verifyAdminToken(fromCookie)) return true

  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    return verifyAdminToken(header.slice(7).trim())
  }
  return false
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET
  if (!expected) return false
  try {
    const a = Buffer.from(password)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function setAdminCookie(res: VercelResponse, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(TTL_MS / 1000)}${secure}`,
  )
}

export function clearAdminCookie(res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  )
}

export { COOKIE_NAME }
