import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db.js'
import {
  ensureTutorFollowsTable,
  readTutorProfileStats,
  resolveTutorId,
} from '../../../_lib/tutorFollows.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user || user.role !== 'student') {
    return res.status(401).json({ error: 'Sign in as a student to follow' })
  }

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const tutorId = await resolveTutorId(String(idRaw ?? ''))
  if (!tutorId) return res.status(404).json({ error: 'Tutor not found' })

  try {
    await ensureTutorFollowsTable()
    if (req.method === 'POST') {
      await sql`
        INSERT INTO tutor_follows (tutor_id, student_id)
        VALUES (${tutorId}, ${user.id})
        ON CONFLICT (tutor_id, student_id) DO NOTHING
      `
    } else {
      await sql`
        DELETE FROM tutor_follows
        WHERE tutor_id = ${tutorId} AND student_id = ${user.id}
      `
    }
    const stats = await readTutorProfileStats(tutorId, user.id)
    return res.status(200).json(stats)
  } catch (err) {
    console.error('tutor follow:', err)
    return res.status(500).json({ error: 'Failed to update follow' })
  }
}
