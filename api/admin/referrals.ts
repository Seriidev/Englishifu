import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth'
import { verifyAdminSession } from '../_lib/adminAuth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const status =
    typeof req.query.status === 'string' ? req.query.status.trim() : 'all'

  try {
    const { rows } = await sql`
      SELECT
        r.id,
        r.referral_code,
        r.invited_email,
        r.invited_user_id,
        r.status,
        r.reward_granted,
        r.created_at,
        ref.full_name AS referrer_name,
        ref.email AS referrer_email,
        ref.handle AS referrer_handle,
        inv.full_name AS invited_name,
        inv.email AS invited_user_email,
        inv.handle AS invited_handle
      FROM referrals r
      JOIN app_users ref ON ref.id = r.referrer_id
      LEFT JOIN app_users inv ON inv.id = r.invited_user_id
      WHERE (${status} = 'all' OR r.status = ${status})
      ORDER BY r.created_at DESC
      LIMIT 500
    `
    const stats = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS converted,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
      FROM referrals
    `
    return res.status(200).json({
      referrals: rows,
      stats: stats.rows[0] || { total: 0, converted: 0, pending: 0 },
    })
  } catch (err) {
    console.error('GET admin/referrals:', err)
    return res.status(500).json({ error: 'Failed to load referrals' })
  }
}
