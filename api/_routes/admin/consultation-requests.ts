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
      const { rows } = await sql`
        SELECT *
        FROM consultation_requests
        ORDER BY created_at DESC
        LIMIT 300
      `
      return res.status(200).json({ requests: rows })
    } catch (err) {
      console.error('GET consultation-requests admin:', err)
      return res.status(500).json({ error: 'Failed to load requests' })
    }
  }

  if (req.method === 'PATCH') {
    const body = (req.body ?? {}) as Record<string, unknown>
    const id = Number(body.id)
    const status = typeof body.status === 'string' ? body.status : ''
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' })
    }
    if (!['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    try {
      const { rows } = await sql`
        UPDATE consultation_requests
        SET status = ${status}
        WHERE id = ${id}
        RETURNING *
      `
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json({ request: rows[0] })
    } catch (err) {
      console.error('PATCH consultation-requests:', err)
      return res.status(500).json({ error: 'Failed to update request' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
