import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth.js'
import { verifyAdminSession } from '../../_lib/adminAuth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  if (req.method === 'GET') {
    try {
      const sessions = await sql`
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
      const requests = await sql`
        SELECT
          r.id,
          r.topic,
          r.preferred_time,
          r.level_tag,
          r.note,
          r.status,
          r.created_at,
          u.full_name AS student_name,
          u.handle AS student_handle,
          u.email AS student_email,
          u.id AS student_id
        FROM speaking_club_requests r
        JOIN app_users u ON u.id = r.student_id
        ORDER BY r.created_at DESC
        LIMIT 200
      `
      return res.status(200).json({
        sessions: sessions.rows,
        requests: requests.rows,
      })
    } catch (err) {
      console.error('GET admin/speaking-club:', err)
      return res.status(500).json({ error: 'Failed to load speaking club' })
    }
  }

  if (req.method === 'PATCH') {
    const body = (req.body ?? {}) as Record<string, unknown>
    const id = Number(body.requestId)
    const status = typeof body.status === 'string' ? body.status : ''
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid requestId' })
    }
    if (!['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    try {
      const { rows } = await sql`
        UPDATE speaking_club_requests
        SET status = ${status}
        WHERE id = ${id}
        RETURNING *
      `
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json({ request: rows[0] })
    } catch (err) {
      console.error('PATCH admin/speaking-club:', err)
      return res.status(500).json({ error: 'Failed to update request' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
