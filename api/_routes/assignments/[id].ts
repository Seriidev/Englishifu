import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import { ensureAssignmentsTable } from '../../_lib/assignments.js'

const STATUSES = new Set(['todo', 'in_progress', 'completed'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const assignmentId = Number(idRaw)
  if (!Number.isFinite(assignmentId) || assignmentId < 1) {
    return res.status(400).json({ error: 'Invalid assignment id' })
  }

  const body = (req.body ?? {}) as { status?: string; assigneeId?: string }
  const status = String(body.status || '')
  if (!STATUSES.has(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  try {
    await ensureAssignmentsTable()
    let assigneeId = user.id
    if (user.role === 'tutor' && body.assigneeId) {
      const owned = await sql`
        SELECT 1 FROM assignments
        WHERE id = ${assignmentId} AND creator_id = ${user.id}
        LIMIT 1
      `
      if (owned.rows.length > 0) {
        assigneeId = String(body.assigneeId)
      }
    }

    const updated = await sql`
      UPDATE assignment_assignees
      SET status = ${status}, updated_at = NOW()
      WHERE assignment_id = ${assignmentId}
        AND user_id = ${assigneeId}
      RETURNING status
    `
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' })
    }
    return res.status(200).json({ ok: true, status })
  } catch (err) {
    console.error('PATCH assignment:', err)
    return res.status(500).json({ error: 'Failed to update assignment' })
  }
}
