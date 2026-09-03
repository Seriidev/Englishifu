import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../../_lib/auth.js'
import { verifyAdminSession } from '../../../../_lib/adminAuth.js'
import { createNotification } from '../../../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const id = String(idRaw ?? '').trim()
  if (!id) return res.status(400).json({ error: 'Missing tutor id' })

  const decision = req.body?.decision as string
  const reason =
    typeof req.body?.reason === 'string' ? req.body.reason.trim() : ''

  if (decision !== 'approved' && decision !== 'rejected') {
    return res.status(400).json({ error: 'Invalid decision' })
  }
  if (decision === 'rejected' && !reason) {
    return res.status(400).json({ error: 'Reason is required when rejecting' })
  }

  const newStatus = decision === 'approved' ? 'approved' : 'incomplete'

  try {
    const updated = await sql`
      UPDATE app_users
      SET status = ${newStatus}, updated_at = NOW()
      WHERE id = ${id} AND role = 'tutor'
      RETURNING id, full_name, status
    `
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' })
    }

    await sql`
      INSERT INTO tutor_moderation_log (tutor_id, admin_id, decision, reason)
      VALUES (${id}, ${'admin'}, ${decision}, ${reason || null})
    `

    await createNotification({
      userId: id,
      type: decision === 'approved' ? 'tutor_approved' : 'tutor_rejected',
      title:
        decision === 'approved'
          ? 'Your profile has been approved!'
          : 'Profile needs changes',
      message:
        decision === 'approved'
          ? 'You are now visible to students and can start receiving bookings.'
          : `Reason: ${reason}. Please update your profile and it will be reviewed again.`,
      linkPath: '/tutor/profile',
    })

    return res.status(200).json({ success: true, status: newStatus })
  } catch (err) {
    console.error('tutor decision:', err)
    return res.status(500).json({ error: 'Failed to apply decision' })
  }
}
