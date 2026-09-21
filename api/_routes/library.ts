import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db.js'
import { toPublicBook } from '../_lib/libraryBook.js'
import { parsePage } from '../_lib/paging.js'
import { persistIfDataUrl, publicMediaUrl } from '../_lib/saveMedia.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const { limit, offset } = parsePage(req.query as Record<string, unknown>, {
    limit: 100,
    max: 100,
  })

  try {
    const { rows } = await sql`
      SELECT
        id, title, author, category, level, rating, minutes,
        description, cover_image_url, cover_headline,
        (pdf_url IS NOT NULL) AS has_pdf
      FROM library_books
      WHERE is_published = true
      ORDER BY display_order ASC, id ASC
      LIMIT ${limit} OFFSET ${offset}
    `
    for (const row of rows) {
      const cover = row.cover_image_url
      if (typeof cover === 'string' && cover.startsWith('data:')) {
        try {
          const url = await persistIfDataUrl(cover, 'covers')
          await sql`
            UPDATE library_books SET cover_image_url = ${url}, updated_at = NOW()
            WHERE id = ${row.id}
          `
          row.cover_image_url = url
        } catch (err) {
          console.error('library cover persist:', err)
        }
      } else {
        row.cover_image_url = publicMediaUrl(cover)
      }
    }
    res.setHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    )
    return res.status(200).json({
      books: rows.map((row) => toPublicBook(row as Record<string, unknown>)),
    })
  } catch (err) {
    console.error('GET library:', err)
    return res.status(500).json({ error: 'Failed to load library' })
  }
}
