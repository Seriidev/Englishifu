import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../_lib/auth.js'
import { verifyAdminSession } from '../../../_lib/adminAuth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db.js'

const STATUSES = ['incomplete', 'pending', 'approved'] as const

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

  const body = (req.body ?? {}) as Record<string, unknown>
  const status =
    typeof body.status === 'string' && STATUSES.includes(body.status as (typeof STATUSES)[number])
      ? body.status
      : undefined
  const isSuspended =
    typeof body.isSuspended === 'boolean' ? body.isSuspended : undefined
  const city = typeof body.city === 'string' ? body.city.trim() || null : undefined

  if (status === undefined && isSuspended === undefined && city === undefined) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  try {
    const { rows } = await sql`
      UPDATE app_users SET
        status = COALESCE(${status ?? null}, status),
        is_suspended = COALESCE(${isSuspended ?? null}, is_suspended),
        city = CASE WHEN ${city === undefined} THEN city ELSE ${city} END,
        updated_at = NOW()
      WHERE id = ${id} AND role = 'tutor'
      RETURNING id, status, is_suspended, city, handle, full_name
    `
    if (rows.length === 0) return res.status(404).json({ error: 'Tutor not found' })
    return res.status(200).json({ tutor: rows[0] })
  } catch (err) {
    console.error('PATCH admin/tutors:', err)
    return res.status(500).json({ error: 'Failed to update tutor' })
  }
}
