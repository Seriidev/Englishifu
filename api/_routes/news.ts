import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  try {
    const { rows } = await sql`
      SELECT id, title, body, cover_image_url, published_at, created_at
      FROM news_posts
      WHERE is_published = true
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT 20
    `
    return res.status(200).json({ posts: rows })
  } catch (err) {
    console.error('GET news:', err)
    return res.status(500).json({ error: 'Failed to load news' })
  }
}
