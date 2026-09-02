import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db'

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
  const handle = String(handleRaw ?? '')
    .replace(/^@/, '')
    .trim()
    .toLowerCase()

  if (!handle) {
    return res.status(400).json({ error: 'Missing tutor handle' })
  }

  try {
    const tutorResult = await sql`
      SELECT id FROM app_users
      WHERE lower(handle) = ${handle} AND role = 'tutor'
      LIMIT 1
    `
    if (tutorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' })
    }
    const tutorId = String(tutorResult.rows[0].id)

    const { rows } = await sql`
      SELECT
        r.id,
        r.booking_id,
        r.tutor_id,
        r.student_id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name AS student_name,
        u.avatar_url AS student_avatar,
        u.handle AS student_handle
      FROM reviews r
      JOIN app_users u ON u.id = r.student_id
      WHERE r.tutor_id = ${tutorId}
      ORDER BY r.created_at DESC
    `

    const avgRating =
      rows.length > 0
        ? rows.reduce((sum, r) => sum + Number(r.rating), 0) / rows.length
        : 0

    return res.status(200).json({
      reviews: rows,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: rows.length,
    })
  } catch (err) {
    console.error('GET tutor reviews:', err)
    return res.status(500).json({ error: 'Failed to load reviews' })
  }
}
