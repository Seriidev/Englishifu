import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, fetchAppUserById, getAuthenticatedUser } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured } from '../../_lib/db.js'
import { publicMediaUrl } from '../../_lib/saveMedia.js'

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
    const row = await fetchAppUserById(user.id)
    if (!row || row.role !== 'tutor') {
      return res.status(404).json({ error: 'Tutor not synced yet' })
    }
    return res.status(200).json({
      tutor: {
        id: row.id,
        handle: row.handle,
        status: row.status,
        full_name: row.full_name,
        position: row.position,
        years_of_experience: row.years_of_experience,
        about_me: row.about_me,
        hourly_rate_usd: row.hourly_rate_usd,
        avatar_url: publicMediaUrl(row.avatar_url),
        certifications: row.certifications,
      },
    })
  } catch (err) {
    console.error('GET tutors/me:', err)
    return res.status(500).json({ error: 'Failed to load tutor' })
  }
}
