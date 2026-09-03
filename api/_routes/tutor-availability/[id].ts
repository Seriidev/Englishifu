import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can manage availability' })
  }

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const id = Number(idRaw)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid availability id' })
  }

  if (req.method === 'DELETE') {
    try {
      const { rows } = await sql`
        UPDATE tutor_availability
        SET is_active = false
        WHERE id = ${id} AND tutor_id = ${user.id} AND is_active = true
        RETURNING id
      `
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Availability not found' })
      }
      return res.status(200).json({ ok: true, id })
    } catch (err) {
      console.error('DELETE tutor-availability:', err)
      return res.status(500).json({ error: 'Failed to delete availability' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
