import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const { rows } = await sql`
      SELECT *
      FROM notifications
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 30
    `
    const unreadCount = rows.filter((n) => !n.is_read).length
    return res.status(200).json({ notifications: rows, unreadCount })
  } catch (err) {
    console.error('GET notifications:', err)
    return res.status(500).json({ error: 'Failed to load notifications' })
  }
}
