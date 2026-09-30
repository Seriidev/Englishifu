import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { ensureNotificationActorColumn } from '../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

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
    await ensureNotificationActorColumn()
    const { rows } = await sql`
      SELECT
        n.id,
        n.type,
        n.title,
        n.message,
        n.link_path,
        n.is_read,
        n.created_at,
        n.actor_id,
        u.full_name AS actor_name,
        u.avatar_url AS actor_avatar
      FROM notifications n
      LEFT JOIN app_users u ON u.id = n.actor_id
      WHERE n.user_id = ${user.id}
      ORDER BY n.created_at DESC
      LIMIT 40
    `
    const unreadCount = rows.filter((n) => !n.is_read).length
    return res.status(200).json({ notifications: rows, unreadCount })
  } catch (err) {
    console.error('GET notifications:', err)
    return res.status(500).json({ error: 'Failed to load notifications' })
  }
}
