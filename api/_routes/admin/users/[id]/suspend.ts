import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../../_lib/auth.js'
import { verifyAdminSession } from '../../../../_lib/adminAuth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const id = String(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id || '').trim()
  if (!id) return res.status(400).json({ error: 'Missing id' })

  const isSuspended = (req.body ?? {}).isSuspended
  if (typeof isSuspended !== 'boolean') {
    return res.status(400).json({ error: 'isSuspended boolean is required' })
  }

  try {
    const { rows } = await sql`
      UPDATE app_users
      SET is_suspended = ${isSuspended}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, full_name, role, is_suspended
    `
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' })
    return res.status(200).json({ user: rows[0] })
  } catch (err) {
    console.error('PATCH suspend:', err)
    return res.status(500).json({ error: 'Failed to update suspension' })
  }
}
