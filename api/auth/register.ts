import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import {
  allocateUniqueHandle,
  applyCors,
  fetchAppUserByEmail,
  issueSession,
  newUserId,
} from '../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'
import { allocateReferralCode } from '../_lib/rewards'

/**
 * POST { role, fullName, email, password }
 * Creates app_users row (bcrypt password_hash), sets session cookie, returns { user, token }.
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
  const role = body.role === 'tutor' ? 'tutor' : body.role === 'student' ? 'student' : null
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const referralCode =
    typeof body.referralCode === 'string'
      ? body.referralCode.trim().toUpperCase()
      : ''
  const marketingOptIn = body.marketingOptIn === true

  if (!role) return res.status(400).json({ error: 'Invalid role' })
  if (!fullName) return res.status(400).json({ error: 'Full name is required' })
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const existing = await fetchAppUserByEmail(email)
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const id = newUserId()
    const handle = await allocateUniqueHandle(fullName, email)
    const passwordHash = await bcrypt.hash(password, 10)
    const ownCode = await allocateReferralCode(handle)

    if (role === 'student') {
      const { rows } = await sql`
        INSERT INTO app_users (
          id, email, password_hash, full_name, handle, role,
          is_public_profile, xp, daily_streak, referral_code,
          marketing_opt_in, created_at, updated_at
        )
        VALUES (
          ${id},
          ${email},
          ${passwordHash},
          ${fullName},
          ${handle},
          ${'student'},
          true,
          0,
          0,
          ${ownCode},
          ${marketingOptIn},
          NOW(),
          NOW()
        )
        RETURNING *
      `
      await attachReferral(id, email, referralCode)
      const session = issueSession(res, rows[0])
      return res.status(201).json(session)
    }

    const { rows } = await sql`
      INSERT INTO app_users (
        id, email, password_hash, full_name, handle, role,
        status, position, is_public_profile, daily_streak,
        certifications, referral_code, marketing_opt_in,
        created_at, updated_at
      )
      VALUES (
        ${id},
        ${email},
        ${passwordHash},
        ${fullName},
        ${handle},
        ${'tutor'},
        ${'incomplete'},
        ${'Teacher'},
        true,
        0,
        ${'[]'}::jsonb,
        ${ownCode},
        ${marketingOptIn},
        NOW(),
        NOW()
      )
      RETURNING *
    `
    await attachReferral(id, email, referralCode)
    const session = issueSession(res, rows[0])
    return res.status(201).json(session)
  } catch (err) {
    console.error('auth/register:', err)
    return res.status(500).json({ error: 'Failed to register' })
  }
}

async function attachReferral(
  invitedUserId: string,
  invitedEmail: string,
  referralCode: string,
) {
  if (!referralCode) return
  try {
    const { rows } = await sql`
      SELECT id, referral_code
      FROM app_users
      WHERE upper(referral_code) = ${referralCode}
        AND id <> ${invitedUserId}
      LIMIT 1
    `
    const referrer = rows[0] as
      | { id: string; referral_code: string }
      | undefined
    if (!referrer) return
    await sql`
      INSERT INTO referrals (
        referrer_id, referral_code, invited_email, invited_user_id, status
      )
      VALUES (
        ${referrer.id},
        ${referrer.referral_code},
        ${invitedEmail},
        ${invitedUserId},
        ${'pending'}
      )
      ON CONFLICT DO NOTHING
    `
  } catch (err) {
    console.error('attachReferral:', err)
  }
}
