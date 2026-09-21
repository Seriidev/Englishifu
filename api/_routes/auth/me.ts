import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import {
  applyCors,
  authUserFromRow,
  clearSessionCookie,
  fetchAppUserByHandle,
  fetchAppUserById,
  issueSession,
  readUserIdFromRequest,
  signToken,
} from '../../_lib/auth.js'
import { persistIfDataUrl } from '../../_lib/saveMedia.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import { deleteAppUserAccount } from '../../_lib/deleteAppUser.js'
import {
  isTutorProfileComplete,
  rowToPublicUser,
  TUTOR_POSITIONS,
  type TutorCertification,
  type TutorPosition,
} from '../../_lib/userMapper.js'

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

async function persistCerts(
  certs: TutorCertification[],
): Promise<TutorCertification[]> {
  const next: TutorCertification[] = []
  for (const cert of certs) {
    next.push({
      ...cert,
      imageUrl: cert.imageUrl
        ? ((await persistIfDataUrl(cert.imageUrl, 'certs')) ?? undefined)
        : undefined,
    })
  }
  return next
}

async function persistAvatar(
  value: string | null | undefined,
): Promise<string | null> {
  if (!value) return null
  return persistIfDataUrl(value, 'avatars')
}

async function respondSession(res: VercelResponse, userId: string) {
  const row = await fetchAppUserById(userId)
  if (!row) return res.status(404).json({ error: 'User not found' })
  return res.status(200).json(issueSession(res, row))
}

/**
 * GET  — current user from cookie/Bearer (+ token for dual-auth clients)
 * PATCH — update profile / complete tutor / save placement / change password / delete account
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const userId = readUserIdFromRequest(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    try {
      const row = await fetchAppUserById(userId)
      if (!row || row.is_suspended) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
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
    const existing = await fetchAppUserById(userId)
    if (!existing) return res.status(404).json({ error: 'User not found' })
    if (existing.is_suspended) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (action === 'deleteAccount') {
      const password = typeof body.password === 'string' ? body.password : ''
      if (existing.password_hash) {
        if (!password) {
          return res.status(400).json({ error: 'Password is required' })
        }
        const matches = await bcrypt.compare(password, existing.password_hash)
        if (!matches) {
          return res.status(401).json({ error: 'Password is incorrect' })
        }
      }
      const deleted = await deleteAppUserAccount(userId)
      if (!deleted) return res.status(404).json({ error: 'User not found' })
      clearSessionCookie(res)
      return res.status(200).json({ ok: true })
    }

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
      await sql`
        UPDATE app_users SET
          password_hash = ${passwordHash},
          updated_at = NOW()
        WHERE id = ${userId}
      `
      return respondSession(res, userId)
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
      await sql`
        UPDATE app_users SET
          cefr_level = ${cefrLevel},
          placement_completed_at = ${completedAt}::timestamptz,
          updated_at = NOW()
        WHERE id = ${userId}
      `
      return respondSession(res, userId)
    }

    if (action === 'updateAvatar') {
      try {
        const avatarUrl = await persistAvatar(
          typeof body.avatarUrl === 'string' ? body.avatarUrl || null : null,
        )
        if (!avatarUrl) {
          return res.status(400).json({ error: 'Please choose a photo' })
        }
        await sql`
          UPDATE app_users SET
            avatar_url = ${avatarUrl},
            updated_at = NOW()
          WHERE id = ${userId}
        `
        return respondSession(res, userId)
      } catch (err) {
        console.error('updateAvatar:', err)
        return res.status(400).json({ error: 'Could not save profile photo' })
      }
    }

    if (action === 'completeProfile') {
      if (existing.role !== 'tutor') {
        return res.status(400).json({ error: 'Not a tutor account' })
      }
      const yearsOfExperience = Number(body.yearsOfExperience)
      const aboutMe =
        typeof body.aboutMe === 'string' ? body.aboutMe.trim() : ''
      const certifications = await persistCerts(parseCerts(body.certifications))
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
      await sql`
        UPDATE app_users SET
          years_of_experience = ${yearsOfExperience},
          about_me = ${aboutMe},
          certifications = ${certJson}::jsonb,
          updated_at = NOW()
        WHERE id = ${userId}
      `
      return respondSession(res, userId)
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
      if (taken && taken.id !== userId) {
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
      const avatarUrl = await persistAvatar(
        typeof body.avatarUrl === 'string'
          ? body.avatarUrl || null
          : existing.avatar_url,
      )
      const isPublic =
        typeof body.isPublicProfile === 'boolean'
          ? body.isPublicProfile
          : existing.is_public_profile !== false

      await sql`
        UPDATE app_users SET
          full_name = ${fullName},
          handle = ${handleRaw},
          city = ${city},
          headline = ${headline},
          summary = ${summary},
          avatar_url = ${avatarUrl},
          is_public_profile = ${isPublic},
          updated_at = NOW()
        WHERE id = ${userId}
      `
      return respondSession(res, userId)
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
    if (taken && taken.id !== userId) {
      return res.status(409).json({ error: 'Username is already taken' })
    }
    const positionRaw =
      typeof body.position === 'string' ? body.position.trim() : existing.position
    const position = POSITIONS.includes(positionRaw as TutorPosition)
      ? (positionRaw as TutorPosition)
      : POSITIONS.includes(existing.position as TutorPosition)
        ? (existing.position as TutorPosition)
        : 'Teacher'
    const aboutMe =
      typeof body.aboutMe === 'string'
        ? body.aboutMe.trim() || null
        : existing.about_me
    const parsedYears = Number(body.yearsOfExperience)
    const yearsOfExperience = Number.isFinite(parsedYears)
      ? parsedYears
      : existing.years_of_experience
    const parsedRate = Number(body.hourlyRateUsd)
    const hourlyRateUsd = Number.isFinite(parsedRate)
      ? parsedRate
      : existing.hourly_rate_usd != null
        ? Number(existing.hourly_rate_usd)
        : null
    const avatarUrl = await persistAvatar(
      typeof body.avatarUrl === 'string'
        ? body.avatarUrl || null
        : existing.avatar_url,
    )
    const isPublic =
      typeof body.isPublicProfile === 'boolean'
        ? body.isPublicProfile
        : existing.is_public_profile !== false
    const existingCerts = parseCerts(existing.certifications)
    const certifications =
      body.certifications !== undefined
        ? await persistCerts(parseCerts(body.certifications))
        : existingCerts
    const certJson = JSON.stringify(certifications)

    const nextStatus =
      existing.status === 'approved'
        ? 'approved'
        : existing.status || 'incomplete'

    await sql`
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
      WHERE id = ${userId}
    `
    return respondSession(res, userId)
  } catch (err) {
    console.error('PATCH auth/me:', err)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
}
