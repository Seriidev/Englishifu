import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth'
import { verifyAdminSession } from '../../_lib/adminAuth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db'

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

  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
  const like = q ? `%${q}%` : '%'
  const sort =
    typeof req.query.sort === 'string' ? req.query.sort : 'xp'

  try {
    const { rows } = await sql`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.handle,
        u.cefr_level,
        u.xp,
        u.daily_streak,
        u.is_suspended,
        u.marketing_opt_in,
        u.email_unsubscribed,
        u.created_at,
        MAX(tr.overall_band_score) AS best_toefl_score
      FROM app_users u
      LEFT JOIN test_results tr ON tr.student_id = u.id
      WHERE u.role = 'student'
        AND (
          ${q} = ''
          OR lower(u.full_name) LIKE ${like}
          OR lower(u.email) LIKE ${like}
          OR lower(u.handle) LIKE ${like}
          OR u.id::text = ${q}
        )
      GROUP BY u.id
      ORDER BY
        CASE WHEN ${sort} = 'score' THEN MAX(tr.overall_band_score) END DESC NULLS LAST,
        CASE WHEN ${sort} = 'streak' THEN u.daily_streak END DESC,
        CASE WHEN ${sort} = 'name' THEN u.full_name END ASC,
        u.xp DESC
    `
    return res.status(200).json({ students: rows })
  } catch (err) {
    console.error('GET admin/students:', err)
    return res.status(500).json({ error: 'Failed to load students' })
  }
}
