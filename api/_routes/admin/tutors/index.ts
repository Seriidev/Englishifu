import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../_lib/auth'
import { verifyAdminSession } from '../../../_lib/adminAuth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : ''
  const minRating = Number(req.query.minRating) || 0
  const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : null
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : null
  const sort =
    typeof req.query.sort === 'string' ? req.query.sort : 'rating'
  const like = q ? `%${q.toLowerCase()}%` : '%'
  const cityLike = city ? city.toLowerCase() : null
  const orderCol =
    sort === 'price'
      ? 'price_per_hour'
      : sort === 'name'
        ? 'full_name'
        : 'average_rating'

  try {
    const { rows } = await sql`
      SELECT
        u.id,
        u.handle,
        u.full_name,
        u.email,
        u.avatar_url,
        u.city,
        u.status,
        u.is_suspended,
        u.hourly_rate_usd AS price_per_hour,
        u.resume_url,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS average_rating,
        COUNT(r.id)::int AS reviews_count
      FROM app_users u
      LEFT JOIN reviews r ON r.tutor_id = u.id
      WHERE u.role = 'tutor'
        AND u.status = 'approved'
        AND (
          ${q} = ''
          OR lower(u.full_name) LIKE ${like}
          OR lower(u.handle) LIKE ${like}
          OR lower(u.email) LIKE ${like}
          OR u.id::text = ${q.toLowerCase()}
        )
        AND (${cityLike}::text IS NULL OR lower(COALESCE(u.city, '')) = ${cityLike})
        AND (${minPrice}::numeric IS NULL OR COALESCE(u.hourly_rate_usd, 0) >= ${minPrice})
        AND (${maxPrice}::numeric IS NULL OR COALESCE(u.hourly_rate_usd, 0) <= ${maxPrice})
      GROUP BY u.id
      HAVING COALESCE(AVG(r.rating), 0) >= ${minRating}
      ORDER BY
        CASE WHEN ${orderCol} = 'price_per_hour' THEN u.hourly_rate_usd END ASC NULLS LAST,
        CASE WHEN ${orderCol} = 'full_name' THEN u.full_name END ASC,
        CASE WHEN ${orderCol} = 'average_rating' THEN COALESCE(AVG(r.rating), 0) END DESC,
        u.full_name ASC
    `
    return res.status(200).json({ tutors: rows })
  } catch (err) {
    console.error('GET admin/tutors:', err)
    return res.status(500).json({ error: 'Failed to load tutors directory' })
  }
}
