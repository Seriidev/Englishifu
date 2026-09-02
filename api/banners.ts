import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from './_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from './_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  try {
    const { rows } = await sql`
      SELECT
        id, title, subtitle, image_url, cta_label, cta_link,
        background_color, display_order
      FROM marketing_banners
      WHERE is_active = true
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at IS NULL OR ends_at >= NOW())
      ORDER BY display_order ASC, id ASC
    `
    return res.status(200).json({ banners: rows })
  } catch (err) {
    console.error('GET banners:', err)
    return res.status(500).json({ error: 'Failed to load banners' })
  }
}
