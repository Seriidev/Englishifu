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

  try {
    const status =
      typeof req.query.status === 'string' ? req.query.status.trim() : 'pending'
    const { rows } = await sql`
      SELECT
        u.id,
        u.handle,
        u.full_name,
        u.email,
        u.avatar_url,
        u.position,
        u.years_of_experience,
        u.about_me,
        u.hourly_rate_usd,
        u.certifications,
        u.status,
        u.resume_url,
        u.created_at,
        u.updated_at,
        (
          SELECT tml.reason
          FROM tutor_moderation_log tml
          WHERE tml.tutor_id = u.id
          ORDER BY tml.created_at DESC
          LIMIT 1
        ) AS last_reason,
        (
          SELECT tml.decision
          FROM tutor_moderation_log tml
          WHERE tml.tutor_id = u.id
          ORDER BY tml.created_at DESC
          LIMIT 1
        ) AS last_decision,
        (
          SELECT tml.created_at
          FROM tutor_moderation_log tml
          WHERE tml.tutor_id = u.id
          ORDER BY tml.created_at DESC
          LIMIT 1
        ) AS last_decision_at
      FROM app_users u
      WHERE u.role = 'tutor'
        AND (
          (${status} = 'pending' AND u.status = 'pending')
          OR (
            ${status} = 'rejected'
            AND EXISTS (
              SELECT 1 FROM tutor_moderation_log tml
              WHERE tml.tutor_id = u.id
                AND tml.decision = 'rejected'
                AND tml.created_at >= NOW() - INTERVAL '30 days'
            )
          )
          OR (${status} = 'all')
        )
      ORDER BY u.updated_at ASC NULLS LAST, u.created_at ASC
    `
    return res.status(200).json({ tutors: rows })
  } catch (err) {
    console.error('pending-tutors:', err)
    return res.status(500).json({ error: 'Failed to load pending tutors' })
  }
}
