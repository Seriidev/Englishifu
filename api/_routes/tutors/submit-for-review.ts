import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

/**
 * Tutor submits / re-submits profile for admin review → status pending in Postgres.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user || user.role !== 'tutor') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body ?? {}
  const position =
    typeof body.position === 'string' ? body.position.trim() : 'Teacher'
  const yearsOfExperience = Number(body.yearsOfExperience)
  const aboutMe = typeof body.aboutMe === 'string' ? body.aboutMe.trim() : ''
  const hourlyRateUsd =
    body.hourlyRateUsd != null ? Number(body.hourlyRateUsd) : null
  const certifications = Array.isArray(body.certifications)
    ? body.certifications
    : []
  const avatarUrl =
    typeof body.avatarUrl === 'string' ? body.avatarUrl : user.avatarUrl ?? null

  if (!Number.isFinite(yearsOfExperience) || yearsOfExperience < 0) {
    return res.status(400).json({ error: 'Invalid years of experience' })
  }
  if (aboutMe.length < 50) {
    return res.status(400).json({ error: 'About me must be at least 50 characters' })
  }
  if (certifications.length < 1) {
    return res.status(400).json({ error: 'At least one certification is required' })
  }

  try {
    const certJson = JSON.stringify(certifications)
    const { rows } = await sql`
      INSERT INTO app_users (
        id, handle, role, full_name, email, avatar_url,
        status, position, years_of_experience, about_me, hourly_rate_usd,
        certifications, updated_at
      )
      VALUES (
        ${user.id},
        ${user.handle},
        ${'tutor'},
        ${user.fullName},
        ${user.email},
        ${avatarUrl},
        ${'pending'},
        ${position},
        ${yearsOfExperience},
        ${aboutMe},
        ${hourlyRateUsd},
        ${certJson}::jsonb,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        handle = EXCLUDED.handle,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, app_users.avatar_url),
        status = 'pending',
        position = EXCLUDED.position,
        years_of_experience = EXCLUDED.years_of_experience,
        about_me = EXCLUDED.about_me,
        hourly_rate_usd = EXCLUDED.hourly_rate_usd,
        certifications = EXCLUDED.certifications,
        updated_at = NOW()
      RETURNING id, status, handle, full_name
    `
    return res.status(200).json({ tutor: rows[0] })
  } catch (err) {
    console.error('submit-for-review:', err)
    return res.status(500).json({ error: 'Failed to submit profile for review' })
  }
}
