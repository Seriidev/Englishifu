import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import { ensureUserReferralCode } from '../../_lib/rewards.js'

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
    const code = await ensureUserReferralCode(user.id, user.handle)
    const { rows } = await sql`
      SELECT
        COUNT(*)::int AS invited,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS converted,
        COALESCE((
          SELECT SUM(amount)::int
          FROM reward_ledger
          WHERE user_id = ${user.id}
            AND source = 'referral'
            AND unit = 'credit'
        ), 0) AS credits_earned
      FROM referrals
      WHERE referrer_id = ${user.id}
    `
    const stats = rows[0] as {
      invited: number
      converted: number
      credits_earned: number
    }
    return res.status(200).json({
      referralCode: code,
      invited: Number(stats?.invited ?? 0),
      converted: Number(stats?.converted ?? 0),
      creditsEarned: Number(stats?.credits_earned ?? 0),
    })
  } catch (err) {
    console.error('GET referrals/me:', err)
    return res.status(500).json({ error: 'Failed to load referral info' })
  }
}
