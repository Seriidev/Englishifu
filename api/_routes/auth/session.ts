import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  applyCors,
  fetchAppUserById,
  issueSession,
  signSessionToken,
  upsertAppUser,
  type AppRole,
  type AuthUser,
} from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured } from '../../_lib/db.js'

/**
 * @deprecated Prefer /api/auth/login and /api/auth/register.
 * Bridge kept for older clients: upserts app_users without password and returns JWT + cookie.
 * POST { id, role, handle, fullName, email, avatarUrl? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  if (
    !process.env.SESSION_SECRET &&
    !process.env.JWT_SECRET &&
    !process.env.BOOKING_AUTH_SECRET
  ) {
    return res.status(503).json({
      error: 'SESSION_SECRET is not configured on the server',
    })
  }

  const body = (req.body ?? {}) as Partial<AuthUser>
  const id = typeof body.id === 'string' ? body.id.trim() : ''
  const role = body.role as AppRole
  const handle =
    typeof body.handle === 'string'
      ? body.handle.replace(/^@/, '').trim().toLowerCase()
      : ''
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const avatarUrl =
    typeof body.avatarUrl === 'string' && body.avatarUrl.trim()
      ? body.avatarUrl.trim()
      : null

  if (!id || !handle || !fullName || !email) {
    return res.status(400).json({ error: 'Missing user fields' })
  }
  if (role !== 'student' && role !== 'tutor') {
    return res.status(400).json({ error: 'Invalid role' })
  }

  const user: AuthUser = { id, role, handle, fullName, email, avatarUrl }

  try {
    await upsertAppUser(user)
    const row = await fetchAppUserById(id)
    if (row) {
      const session = issueSession(res, row)
      return res.status(200).json(session)
    }
    const token = signSessionToken(user)
    return res.status(200).json({ token, user })
  } catch (err) {
    console.error('auth/session error:', err)
    return res.status(500).json({ error: 'Failed to create session' })
  }
}
