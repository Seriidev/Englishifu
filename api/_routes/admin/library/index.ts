import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../_lib/auth'
import { verifyAdminSession } from '../../../_lib/adminAuth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db'
import { parseBookInput } from '../../../_lib/libraryBook'
import { saveLibraryPdf } from '../../../_lib/saveLibraryPdf'

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
        SELECT * FROM library_books
        ORDER BY display_order ASC, id DESC
      `
      return res.status(200).json({ books: rows })
    } catch (err) {
      console.error('GET admin/library:', err)
      return res.status(500).json({ error: 'Failed to load books' })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = parseBookInput((req.body ?? {}) as Record<string, unknown>)
  if (!parsed.title || !parsed.author || !parsed.category || !parsed.level) {
    return res.status(400).json({
      error: 'Title, author, level, and topic are required',
    })
  }
  if (!parsed.coverImageUrl) {
    return res.status(400).json({ error: 'Please upload a cover image' })
  }
  if (!parsed.pdfUrl) {
    return res.status(400).json({ error: 'Please upload the book PDF' })
  }

  try {
    const pdfUrl = await saveLibraryPdf(parsed.pdfUrl)
    const { rows } = await sql`
      INSERT INTO library_books (
        title, author, category, level, rating, minutes, description,
        cover_image_url, cover_headline, pdf_url, pdf_file_name,
        is_published, display_order
      )
      VALUES (
        ${parsed.title},
        ${parsed.author},
        ${parsed.category},
        ${parsed.level},
        ${parsed.rating},
        ${parsed.minutes},
        ${parsed.description},
        ${parsed.coverImageUrl},
        ${parsed.coverHeadline},
        ${pdfUrl},
        ${parsed.pdfFileName},
        ${parsed.isPublished},
        ${parsed.displayOrder}
      )
      RETURNING *
    `
    return res.status(201).json({ book: rows[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.toLowerCase().includes('pdf')) {
      return res.status(400).json({ error: msg })
    }
    console.error('POST admin/library:', err)
    return res.status(500).json({ error: 'Failed to create book' })
  }
}
