import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import {
  applyCors,
  authUserFromRow,
  fetchAppUserByHandle,
  fetchAppUserById,
  getAuthenticatedUser,
  issueSession,
  signToken,
} from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db'
import {
  isTutorProfileComplete,
  rowToPublicUser,
  TUTOR_POSITIONS,
  type TutorCertification,
  type TutorPosition,
} from '../../_lib/userMapper'

const POSITIONS: readonly TutorPosition[] = TUTOR_POSITIONS

function parseCerts(raw: unknown): TutorCertification[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const c = item as Record<string, unknown>
    return {
      id: typeof c.id === 'string' ? c.id : `cert-${index}`,
      name: typeof c.name === 'string' ? c.name : 'Certificate',
      imageUrl: typeof c.imageUrl === 'string' ? c.imageUrl : undefined,
      uploadedAt: typeof c.uploadedAt === 'string' ? c.uploadedAt : undefined,
    }
  })
}

/**
 * GET  — current user from cookie/Bearer (+ token for dual-auth clients)
 * PATCH — update profile / complete tutor / save placement / change password
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    try {
      const row = await fetchAppUserById(auth.id)
      if (!row) return res.status(401).json({ error: 'Unauthorized' })
      const user = rowToPublicUser(row)
      const token = signToken(authUserFromRow(row))
      return res.status(200).json({ user, token })
    } catch (err) {
      console.error('GET auth/me:', err)
      return res.status(500).json({ error: 'Failed to load session' })
    }
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const action =
    typeof body.action === 'string' ? body.action : 'update'

  try {
    const existing = await fetchAppUserById(auth.id)
    if (!existing) return res.status(404).json({ error: 'User not found' })

    if (action === 'changePassword') {
      const currentPassword =
        typeof body.currentPassword === 'string' ? body.currentPassword : ''
      const newPassword =
        typeof body.newPassword === 'string' ? body.newPassword : ''
      if (newPassword.length < 8) {
        return res.status(400).json({
          error: 'New password must be at least 8 characters',
        })
      }
      if (existing.password_hash) {
        if (!currentPassword) {
          return res
            .status(400)
            .json({ error: 'Current password is required' })
        }
        const matches = await bcrypt.compare(
          currentPassword,
          existing.password_hash,
        )
        if (!matches) {
          return res
            .status(401)
            .json({ error: 'Current password is incorrect' })
        }
      }
      const passwordHash = await bcrypt.hash(newPassword, 10)
      const { rows } = await sql`
        UPDATE app_users SET
          password_hash = ${passwordHash},
          updated_at = NOW()
        WHERE id = ${auth.id}
        RETURNING *
      `
      return res.status(200).json(issueSession(res, rows[0]))
    }

    if (action === 'placement') {
      if (existing.role !== 'student') {
        return res.status(400).json({ error: 'Not a student account' })
      }
      const cefrLevel =
        typeof body.cefrLevel === 'string' ? body.cefrLevel.trim() : ''
      const completedAt =
        typeof body.completedAt === 'string'
          ? body.completedAt
          : new Date().toISOString()
      if (!cefrLevel) {
        return res.status(400).json({ error: 'cefrLevel is required' })
      }
      const { rows } = await sql`
        UPDATE app_users SET
          cefr_level = ${cefrLevel},
          placement_completed_at = ${completedAt}::timestamptz,
          updated_at = NOW()
        WHERE id = ${auth.id}
        RETURNING *
      `
      return res.status(200).json(issueSession(res, rows[0]))
    }

    if (action === 'completeProfile') {
      if (existing.role !== 'tutor') {
        return res.status(400).json({ error: 'Not a tutor account' })
      }
      const yearsOfExperience = Number(body.yearsOfExperience)
      const aboutMe =
        typeof body.aboutMe === 'string' ? body.aboutMe.trim() : ''
      const certifications = parseCerts(body.certifications)
      if (
        !isTutorProfileComplete({
          yearsOfExperience,
          certifications,
          aboutMe,
        })
      ) {
        return res.status(400).json({
          error:
            'Fill years of experience, at least one certification, and about me (50+ chars)',
        })
      }
      const certJson = JSON.stringify(certifications)
      const { rows } = await sql`
        UPDATE app_users SET
          years_of_experience = ${yearsOfExperience},
          about_me = ${aboutMe},
          certifications = ${certJson}::jsonb,
          updated_at = NOW()
        WHERE id = ${auth.id}
        RETURNING *
      `
      return res.status(200).json(issueSession(res, rows[0]))
    }

    // action === 'update' (default)
    if (existing.role === 'student') {
      const fullName =
        typeof body.fullName === 'string'
          ? body.fullName.trim()
          : existing.full_name
      const handleRaw =
        typeof body.handle === 'string'
          ? body.handle.replace(/^@/, '').trim().toLowerCase()
          : existing.handle
      if (!fullName) {
        return res.status(400).json({ error: 'Full name is required' })
      }
      if (!/^[a-z0-9_]{3,20}$/.test(handleRaw)) {
        return res.status(400).json({
          error:
            'Username must be 3-20 characters, lowercase letters, numbers, and underscores only',
        })
      }
      const taken = await fetchAppUserByHandle(handleRaw)
      if (taken && taken.id !== auth.id) {
        return res.status(409).json({ error: 'Username is already taken' })
      }

      const city =
        typeof body.city === 'string' ? body.city.trim() || null : existing.city
      const headline =
        typeof body.headline === 'string'
          ? body.headline.trim() || null
          : existing.headline
      const summary =
        typeof body.summary === 'string'
          ? body.summary.trim() || null
          : existing.summary
      const avatarUrl =
        typeof body.avatarUrl === 'string'
          ? body.avatarUrl || null
          : existing.avatar_url
      const isPublic =
        typeof body.isPublicProfile === 'boolean'
          ? body.isPublicProfile
          : existing.is_public_profile !== false

      const { rows } = await sql`
        UPDATE app_users SET
          full_name = ${fullName},
          handle = ${handleRaw},
          city = ${city},
          headline = ${headline},
          summary = ${summary},
          avatar_url = ${avatarUrl},
          is_public_profile = ${isPublic},
          updated_at = NOW()
        WHERE id = ${auth.id}
        RETURNING *
      `
      return res.status(200).json(issueSession(res, rows[0]))
    }

    // tutor update
    const fullName =
      typeof body.fullName === 'string'
        ? body.fullName.trim()
        : existing.full_name
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' })
    }
    const handleRaw =
      typeof body.handle === 'string'
        ? body.handle.replace(/^@/, '').trim().toLowerCase()
        : existing.handle
    if (!/^[a-z0-9_]{3,20}$/.test(handleRaw)) {
      return res.status(400).json({
        error:
          'Username must be 3-20 characters, lowercase letters, numbers, and underscores only',
      })
    }
    const taken = await fetchAppUserByHandle(handleRaw)
    if (taken && taken.id !== auth.id) {
      return res.status(409).json({ error: 'Username is already taken' })
    }
    const positionRaw =
      typeof body.position === 'string' ? body.position.trim() : existing.position
    if (!POSITIONS.includes(positionRaw as TutorPosition)) {
      return res.status(400).json({ error: 'Please select a position' })
    }
    const position = positionRaw as TutorPosition
    const aboutMe =
      typeof body.aboutMe === 'string'
        ? body.aboutMe.trim() || null
        : existing.about_me
    const yearsOfExperience =
      body.yearsOfExperience !== undefined
        ? Number(body.yearsOfExperience)
        : existing.years_of_experience
    const hourlyRateUsd =
      body.hourlyRateUsd !== undefined
        ? Number(body.hourlyRateUsd)
        : existing.hourly_rate_usd != null
          ? Number(existing.hourly_rate_usd)
          : null
    const avatarUrl =
      typeof body.avatarUrl === 'string'
        ? body.avatarUrl || null
        : existing.avatar_url
    const isPublic =
      typeof body.isPublicProfile === 'boolean'
        ? body.isPublicProfile
        : existing.is_public_profile !== false
    const existingCerts = parseCerts(existing.certifications)
    const certifications =
      body.certifications !== undefined
        ? parseCerts(body.certifications)
        : existingCerts
    const certJson = JSON.stringify(certifications)

    const nextStatus =
      existing.status === 'approved'
        ? 'approved'
        : existing.status || 'incomplete'

    const { rows } = await sql`
      UPDATE app_users SET
        full_name = ${fullName},
        handle = ${handleRaw},
        position = ${position},
        about_me = ${aboutMe},
        years_of_experience = ${yearsOfExperience},
        hourly_rate_usd = ${hourlyRateUsd},
        avatar_url = ${avatarUrl},
        is_public_profile = ${isPublic},
        certifications = ${certJson}::jsonb,
        status = ${nextStatus},
        updated_at = NOW()
      WHERE id = ${auth.id}
      RETURNING *
    `
    return res.status(200).json(issueSession(res, rows[0]))
  } catch (err) {
    console.error('PATCH auth/me:', err)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
}
