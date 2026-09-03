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

  const id = Number(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM news_posts WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('DELETE news:', err)
      return res.status(500).json({ error: 'Failed to delete post' })
    }
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const title = typeof body.title === 'string' ? body.title.trim() : undefined
  const postBody = typeof body.body === 'string' ? body.body : undefined
  const coverImageUrl =
    body.coverImageUrl === null
      ? null
      : typeof body.coverImageUrl === 'string'
        ? body.coverImageUrl.trim() || null
        : undefined
  const isPublished =
    typeof body.isPublished === 'boolean' ? body.isPublished : undefined

  try {
    const { rows } = await sql`
      UPDATE news_posts SET
        title = COALESCE(${title ?? null}, title),
        body = COALESCE(${postBody ?? null}, body),
        cover_image_url = CASE
          WHEN ${coverImageUrl === undefined} THEN cover_image_url
          ELSE ${coverImageUrl}
        END,
        is_published = COALESCE(${isPublished ?? null}, is_published),
        published_at = CASE
          WHEN ${isPublished === true} THEN COALESCE(published_at, NOW())
          WHEN ${isPublished === false} THEN NULL
          ELSE published_at
        END
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json({ post: rows[0] })
  } catch (err) {
    console.error('PATCH news:', err)
    return res.status(500).json({ error: 'Failed to update post' })
  }
}
