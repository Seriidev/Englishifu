import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db.js'
import { toPublicBook } from '../_lib/libraryBook.js'

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
        id, title, author, category, level, rating, minutes,
        description, cover_image_url, cover_headline, pdf_url, pdf_file_name
      FROM library_books
      WHERE is_published = true
      ORDER BY display_order ASC, id ASC
    `
    return res.status(200).json({
      books: rows.map((row) => toPublicBook(row as Record<string, unknown>)),
    })
  } catch (err) {
    console.error('GET library:', err)
    return res.status(500).json({ error: 'Failed to load library' })
  }
}
