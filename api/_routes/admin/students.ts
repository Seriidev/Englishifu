import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth.js'
import { verifyAdminSession } from '../../_lib/adminAuth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import { parsePage } from '../../_lib/paging.js'
import { persistAvatarOnRows } from '../../_lib/persistMedia.js'
import { publicMediaUrl } from '../../_lib/saveMedia.js'

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

  const { limit, offset } = parsePage(req.query as Record<string, unknown>)

  try {
    const countResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM app_users u
      WHERE u.role = 'student'
        AND (
          ${q} = ''
          OR lower(u.full_name) LIKE ${like}
          OR lower(u.email) LIKE ${like}
          OR lower(u.handle) LIKE ${like}
          OR u.id::text = ${q}
        )
    `
    const { rows } = await sql`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.handle,
        u.avatar_url,
        u.cefr_level,
        u.xp,
        u.daily_streak,
        u.is_suspended,
        u.marketing_opt_in,
        u.email_unsubscribed,
        u.created_at,
        (
          SELECT MAX(tr.overall_band_score)
          FROM test_results tr
          WHERE tr.student_id = u.id
        ) AS best_toefl_score,
        NOT EXISTS (
          SELECT 1
          FROM student_boosts sb
          WHERE sb.student_id = u.id
            AND sb.kind = 'admin'
            AND sb.boost_day = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date
        ) AS can_admin_boost
      FROM app_users u
      WHERE u.role = 'student'
        AND (
          ${q} = ''
          OR lower(u.full_name) LIKE ${like}
          OR lower(u.email) LIKE ${like}
          OR lower(u.handle) LIKE ${like}
          OR u.id::text = ${q}
        )
      ORDER BY
        CASE WHEN ${sort} = 'score' THEN (
          SELECT MAX(tr.overall_band_score) FROM test_results tr WHERE tr.student_id = u.id
        ) END DESC NULLS LAST,
        CASE WHEN ${sort} = 'streak' THEN u.daily_streak END DESC,
        CASE WHEN ${sort} = 'name' THEN u.full_name END ASC,
        u.xp DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    await persistAvatarOnRows(rows)
    for (const row of rows) {
      row.avatar_url = publicMediaUrl(row.avatar_url)
    }
    return res.status(200).json({
      students: rows,
      total: Number(countResult.rows[0]?.total) || rows.length,
      page: Math.floor(offset / limit) + 1,
      limit,
    })
  } catch (err) {
    console.error('GET admin/students:', err)
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('timeout')) {
      return res.status(503).json({
        error: 'Database is waking up. Wait a few seconds and try again.',
      })
    }
    return res.status(500).json({ error: 'Failed to load students' })
  }
}
