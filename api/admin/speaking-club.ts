import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth'
import { verifyAdminSession } from '../_lib/adminAuth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'

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
    const { rows } = await sql`
      SELECT
        s.id,
        s.title,
        s.level_tag,
        s.starts_at,
        s.duration_minutes,
        s.max_participants,
        u.full_name AS host_name,
        u.handle AS host_handle,
        u.id AS host_user_id,
        (
          SELECT COUNT(*)::int
          FROM speaking_club_participants p
          WHERE p.session_id = s.id
        ) AS spots_filled
      FROM speaking_club_sessions s
      JOIN app_users u ON u.id = s.host_tutor_id
      ORDER BY s.starts_at DESC
      LIMIT 200
    `
    return res.status(200).json({ sessions: rows })
  } catch (err) {
    console.error('GET admin/speaking-club:', err)
    return res.status(500).json({ error: 'Failed to load sessions' })
  }
}
