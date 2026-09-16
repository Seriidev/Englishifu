import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import {
  applyCors,
  fetchAppUserByEmail,
} from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

/**
 * POST { email, password, confirmPassword }
 * Sets a new bcrypt password_hash for the matching account.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const confirmPassword =
    typeof body.confirmPassword === 'string' ? body.confirmPassword : ''

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Enter a valid email' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }

  try {
    const user = await fetchAppUserByEmail(email)
    if (!user) {
      return res.status(404).json({ error: 'No account with this email' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await sql`
      UPDATE app_users SET
        password_hash = ${passwordHash},
        updated_at = NOW()
      WHERE id = ${user.id}
    `
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('auth/reset-password:', err)
    return res.status(500).json({ error: 'Could not update password' })
  }
}
