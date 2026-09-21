import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import { parsePage } from '../../_lib/paging.js'
import { persistAvatarOnRows } from '../../_lib/persistMedia.js'
import { publicMediaUrl } from '../../_lib/saveMedia.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const handleRaw = Array.isArray(req.query.handle)
    ? req.query.handle[0]
    : req.query.handle
  const handle =
    typeof handleRaw === 'string'
      ? handleRaw.replace(/^@/, '').trim().toLowerCase()
      : ''
  const { limit, offset } = parsePage(req.query as Record<string, unknown>, {
    limit: handle ? 1 : 20,
    max: 100,
  })

  try {
    const { rows } = await sql`
      SELECT
        u.id,
        u.handle,
        u.full_name,
        u.avatar_url,
        u.position,
        u.hourly_rate_usd,
        COALESCE(ratings.average_rating, 0)::numeric(3,2) AS average_rating,
        COALESCE(ratings.reviews_count, 0)::int AS reviews_count,
        COALESCE(avail.availability_count, 0)::int AS availability_count
      FROM app_users u
      LEFT JOIN (
        SELECT tutor_id, AVG(rating) AS average_rating, COUNT(*)::int AS reviews_count
        FROM reviews
        GROUP BY tutor_id
      ) ratings ON ratings.tutor_id = u.id
      LEFT JOIN (
        SELECT tutor_id, COUNT(*)::int AS availability_count
        FROM tutor_availability
        WHERE is_active = true
        GROUP BY tutor_id
      ) avail ON avail.tutor_id = u.id
      WHERE u.role = 'tutor'
        AND u.status = 'approved'
        AND COALESCE(u.is_suspended, false) = false
        AND COALESCE(u.is_public_profile, true) = true
        AND (${handle} = '' OR lower(u.handle) = ${handle})
      ORDER BY u.full_name ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    await persistAvatarOnRows(rows)

    const tutors = rows.map((row) => {
      const position = String(row.position || 'Teacher')
      const rate = Number(row.hourly_rate_usd)
      return {
        id: String(row.id),
        handle: String(row.handle),
        fullName: String(row.full_name),
        avatarUrl: publicMediaUrl(row.avatar_url) ?? undefined,
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

    res.setHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=30, stale-while-revalidate=120',
    )
    return res.status(200).json({ tutors })
  } catch (err) {
    console.error('GET tutors:', err)
    return res.status(500).json({ error: 'Failed to load tutors' })
  }
}
