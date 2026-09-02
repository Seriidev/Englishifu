import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'

/** Current tutor row from Postgres (status sync for localStorage clients). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user || user.role !== 'tutor') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { rows } = await sql`
      SELECT id, handle, status, full_name, position, years_of_experience,
             about_me, hourly_rate_usd, avatar_url, certifications
      FROM app_users
      WHERE id = ${user.id} AND role = 'tutor'
      LIMIT 1
    `
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not synced yet' })
    }
    return res.status(200).json({ tutor: rows[0] })
  } catch (err) {
    console.error('GET tutors/me:', err)
    return res.status(500).json({ error: 'Failed to load tutor' })
  }
}
