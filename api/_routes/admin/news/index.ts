import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../_lib/auth.js'
import { verifyAdminSession } from '../../../_lib/adminAuth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT * FROM news_posts
        ORDER BY created_at DESC
      `
      return res.status(200).json({ posts: rows })
    } catch (err) {
      console.error('GET admin/news:', err)
      return res.status(500).json({ error: 'Failed to load news' })
    }
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const postBody = typeof body.body === 'string' ? body.body.trim() : ''
    const coverImageUrl =
      typeof body.coverImageUrl === 'string'
        ? body.coverImageUrl.trim() || null
        : null
    const isPublished = body.isPublished === true
    if (!title || !postBody) {
      return res.status(400).json({ error: 'Title and body are required' })
    }
    try {
      const { rows } = await sql`
        INSERT INTO news_posts (
          title, body, cover_image_url, is_published, published_at
        )
        VALUES (
          ${title},
          ${postBody},
          ${coverImageUrl},
          ${isPublished},
          CASE WHEN ${isPublished} THEN NOW() ELSE NULL END
        )
        RETURNING *
      `
      return res.status(201).json({ post: rows[0] })
    } catch (err) {
      console.error('POST admin/news:', err)
      return res.status(500).json({ error: 'Failed to create post' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
