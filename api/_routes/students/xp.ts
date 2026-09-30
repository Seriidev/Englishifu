import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { claimDailyLoginXp, readStudentXp } from '../../_lib/dailyBonus.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import { exchangeXpForBoost } from '../../_lib/studentXp.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user || user.role !== 'student') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const claimRaw = Array.isArray(req.query.claim) ? req.query.claim[0] : req.query.claim
  const shouldClaim = claimRaw === '1' || claimRaw === 'true'

  try {
    if (req.method === 'POST') {
      const exchanged = await exchangeXpForBoost(user.id)
      if (!exchanged.ok) return res.status(400).json({ error: exchanged.error })
      const boosts = await countBoosts(user.id)
      return res.status(200).json({
        xp: exchanged.xp,
        boostCount: boosts.boostCount,
        boostedToday: boosts.boostedToday,
      })
    }
    const bonus = shouldClaim
      ? await claimDailyLoginXp(user.id)
      : await readStudentXp(user.id)
    const boosts = await countBoosts(user.id)
    return res.status(200).json({
      xp: bonus.xp,
      boostCount: boosts.boostCount,
      boostedToday: boosts.boostedToday,
      dailyBonusClaimedToday: bonus.claimedToday,
      dailyBonusAwarded: bonus.awarded,
    })
  } catch (err) {
    console.error('GET students/xp:', err)
    return res.status(500).json({ error: 'Failed to load XP' })
  }
}

async function countBoosts(studentId: string) {
  const { rows } = await sql`
    SELECT
      COUNT(*) FILTER (
        WHERE kind IN ('daily', 'admin', 'exchange')
      )::int AS boost_count,
      COUNT(*) FILTER (
        WHERE kind IN ('daily', 'admin')
          AND boost_day = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date
      )::int AS boosts_today
    FROM student_boosts
    WHERE student_id = ${studentId}
  `
  return {
    boostCount: Number(rows[0]?.boost_count) || 0,
    boostedToday: Number(rows[0]?.boosts_today) > 0,
  }
}
