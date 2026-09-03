import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const body = (req.body ?? {}) as { notificationId?: number | string }
  const notificationId =
    body.notificationId != null ? Number(body.notificationId) : null

  try {
    if (notificationId && Number.isInteger(notificationId) && notificationId > 0) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE id = ${notificationId} AND user_id = ${user.id}
      `
    } else {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE user_id = ${user.id} AND is_read = false
      `
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('mark-read notifications:', err)
    return res.status(500).json({ error: 'Failed to mark notifications read' })
  }
}
