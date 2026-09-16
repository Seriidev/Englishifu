import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

const LEVELS = new Set(['All levels', 'A2', 'B1', 'B2', 'C1'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can request a club' })
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT id, topic, preferred_time, level_tag, note, status, created_at
        FROM speaking_club_requests
        WHERE student_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 20
      `
      return res.status(200).json({ requests: rows })
    } catch (err) {
      console.error('GET speaking-club requests:', err)
      return res.status(500).json({ error: 'Failed to load requests' })
    }
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>
    const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
    const preferredTime =
      typeof body.preferredTime === 'string' ? body.preferredTime.trim() : ''
    const levelTag =
      typeof body.levelTag === 'string' ? body.levelTag.trim() : 'All levels'
    const note = typeof body.note === 'string' ? body.note.trim() : ''

    if (!topic || topic.length < 2) {
      return res.status(400).json({ error: 'Tell us which speaking club you want' })
    }
    if (topic.length > 120) {
      return res.status(400).json({ error: 'Topic is too long' })
    }
    if (preferredTime.length > 120) {
      return res.status(400).json({ error: 'Preferred time is too long' })
    }
    if (note.length > 500) {
      return res.status(400).json({ error: 'Note is too long' })
    }
    if (!LEVELS.has(levelTag)) {
      return res.status(400).json({ error: 'Invalid level' })
    }

    try {
      const { rows } = await sql`
        INSERT INTO speaking_club_requests (
          student_id, topic, preferred_time, level_tag, note
        )
        VALUES (
          ${user.id},
          ${topic},
          ${preferredTime || null},
          ${levelTag},
          ${note || null}
        )
        RETURNING id, topic, preferred_time, level_tag, note, status, created_at
      `
      return res.status(201).json({ request: rows[0] })
    } catch (err) {
      console.error('POST speaking-club request:', err)
      return res.status(500).json({ error: 'Failed to save request' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
