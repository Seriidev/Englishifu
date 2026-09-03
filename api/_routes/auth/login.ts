import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import {
  applyCors,
  fetchAppUserByEmail,
  issueSession,
} from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured } from '../../_lib/db'

/**
 * POST { email, password } → Set-Cookie + { user, token }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }
  if (!process.env.SESSION_SECRET && !process.env.JWT_SECRET && !process.env.BOOKING_AUTH_SECRET) {
    return res.status(503).json({ error: 'SESSION_SECRET is not configured on the server' })
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const user = await fetchAppUserByEmail(email)
    if (!user?.password_hash) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }
    if (user.is_suspended) {
      return res.status(403).json({
        error: 'This account is suspended. Contact support if you think this is a mistake.',
      })
    }

    const session = issueSession(res, user)
    return res.status(200).json(session)
  } catch (err) {
    console.error('auth/login:', err)
    return res.status(500).json({ error: 'Failed to login' })
  }
}
