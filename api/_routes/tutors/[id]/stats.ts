import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured } from '../../../_lib/db.js'
import {
  ensureTutorFollowsTable,
  readTutorProfileStats,
  resolveTutorId,
} from '../../../_lib/tutorFollows.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const tutorId = await resolveTutorId(String(idRaw ?? ''))
  if (!tutorId) return res.status(404).json({ error: 'Tutor not found' })

  try {
    await ensureTutorFollowsTable()
    const user = await getAuthenticatedUser(req)
    const studentId = user?.role === 'student' ? user.id : undefined
    const stats = await readTutorProfileStats(tutorId, studentId)
    return res.status(200).json(stats)
  } catch (err) {
    console.error('GET tutor stats:', err)
    return res.status(500).json({ error: 'Failed to load stats' })
  }
}
