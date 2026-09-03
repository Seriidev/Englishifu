import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  try {
    const { rows } = await sql`
      SELECT
        u.id,
        u.handle,
        u.full_name,
        u.avatar_url,
        u.position,
        u.hourly_rate_usd,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS average_rating,
        COUNT(r.id)::int AS reviews_count,
        (
          SELECT COUNT(*)::int
          FROM tutor_availability a
          WHERE a.tutor_id = u.id
        ) AS availability_count
      FROM app_users u
      LEFT JOIN reviews r ON r.tutor_id = u.id
      WHERE u.role = 'tutor'
        AND u.status = 'approved'
        AND COALESCE(u.is_suspended, false) = false
        AND COALESCE(u.is_public_profile, true) = true
      GROUP BY u.id
      ORDER BY u.full_name ASC
    `

    const tutors = rows.map((row) => {
      const position = String(row.position || 'Teacher')
      const rate = Number(row.hourly_rate_usd)
      return {
        id: String(row.id),
        handle: String(row.handle),
        fullName: String(row.full_name),
        avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
        isVerified: true,
        availabilityStatus:
          Number(row.availability_count) > 0 ? 'online' : 'away',
        positionLabel: position,
        specialtyTags: [position],
        languages: ['English'],
        rating: Number(row.average_rating) || 0,
        reviewsCount: Number(row.reviews_count) || 0,
        pricePerHour: Number.isFinite(rate) && rate > 0 ? rate : 20,
      }
    })

    return res.status(200).json({ tutors })
  } catch (err) {
    console.error('GET tutors:', err)
    return res.status(500).json({ error: 'Failed to load tutors' })
  }
}
