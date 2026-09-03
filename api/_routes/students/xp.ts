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
  if (!user || user.role !== 'student') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { rows } = await sql`
      SELECT
        COALESCE(u.xp, 0)::int AS xp,
        EXISTS (
          SELECT 1
          FROM student_boosts sb
          WHERE sb.student_id = u.id
            AND sb.boost_day = CURRENT_DATE
        ) AS boosted_today
      FROM app_users u
      WHERE u.id = ${user.id} AND u.role = 'student'
      LIMIT 1
    `
    const row = rows[0]
    return res.status(200).json({
      xp: Number(row?.xp ?? 0),
      boostedToday: Boolean(row?.boosted_today),
    })
  } catch (err) {
    console.error('GET students/xp:', err)
    return res.status(500).json({ error: 'Failed to load XP' })
  }
}
