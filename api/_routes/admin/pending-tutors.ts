import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth.js'
import { verifyAdminSession } from '../../_lib/adminAuth.js'
import { persistUserRowMedia } from '../../_lib/persistMedia.js'
import { persistIfDataUrl, publicMediaUrl } from '../../_lib/saveMedia.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import type { AppUserRow } from '../../_lib/userMapper.js'

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
      LIMIT 20
    `
    const tutors = []
    for (const row of rows) {
      const persisted = await persistUserRowMedia(row as AppUserRow)
      let resumeUrl = persisted.resume_url ?? (row.resume_url as string | null)
      if (typeof resumeUrl === 'string' && resumeUrl.startsWith('data:')) {
        try {
          resumeUrl = await persistIfDataUrl(resumeUrl, 'resumes')
          await sql`
            UPDATE app_users SET resume_url = ${resumeUrl}, updated_at = NOW()
            WHERE id = ${persisted.id}
          `
        } catch (err) {
          console.error('pending resume persist:', err)
        }
      }
      tutors.push({
        ...row,
        ...persisted,
        avatar_url: publicMediaUrl(persisted.avatar_url),
        resume_url: publicMediaUrl(resumeUrl),
        certifications: persisted.certifications,
      })
    }
    return res.status(200).json({ tutors })
  } catch (err) {
    console.error('pending-tutors:', err)
    return res.status(500).json({ error: 'Failed to load pending tutors' })
  }
}
