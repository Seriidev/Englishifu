import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

const TOP_LIMIT = 100
const CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { rows } = await sql`
      SELECT
        ranked.id,
        ranked.full_name,
        ranked.handle,
        ranked.avatar_url,
        ranked.xp,
        ranked.cefr_level,
        ranked.is_public,
        ranked.rank
      FROM (
        SELECT
          u.id,
          u.full_name,
          u.handle,
          u.avatar_url,
          COALESCE(u.xp, 0)::int AS xp,
          u.cefr_level,
          COALESCE(u.is_public_profile, true) AS is_public,
          ROW_NUMBER() OVER (
            ORDER BY COALESCE(u.xp, 0) DESC, u.created_at ASC, u.id ASC
          ) AS rank
        FROM app_users u
        WHERE u.role = 'student'
          AND COALESCE(u.is_suspended, false) = false
      ) ranked
      WHERE ranked.rank <= ${TOP_LIMIT}
         OR ranked.id = ${user.id}
      ORDER BY ranked.rank ASC
    `

    const { rows: countRows } = await sql`
      SELECT COUNT(*)::int AS total
      FROM app_users u
      WHERE u.role = 'student'
        AND COALESCE(u.is_suspended, false) = false
    `

    const entries = rows.map((row) => {
      const id = String(row.id)
      const isCurrentUser = id === user.id
      const isPublic = row.is_public !== false
      const cefr = typeof row.cefr_level === 'string' ? row.cefr_level : ''
      return {
        id,
        rank: Number(row.rank) || 0,
        fullName: String(row.full_name || 'Student'),
        handle:
          (isPublic || isCurrentUser) && row.handle
            ? String(row.handle)
            : undefined,
        avatarUrl: typeof row.avatar_url === 'string' && row.avatar_url
          ? row.avatar_url
          : undefined,
        xp: Number(row.xp) || 0,
        cefrLevel: CEFR.has(cefr) ? cefr : undefined,
        isCurrentUser,
      }
    })

    return res.status(200).json({
      entries,
      total: Number(countRows[0]?.total) || entries.length,
    })
  } catch (err) {
    console.error('GET students/leaderboard:', err)
    return res.status(500).json({ error: 'Failed to load leaderboard' })
  }
}
