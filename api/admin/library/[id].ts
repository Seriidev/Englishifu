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

  const id = Number(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM library_books WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('DELETE admin/library:', err)
      return res.status(500).json({ error: 'Failed to delete book' })
    }
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = parseBookInput((req.body ?? {}) as Record<string, unknown>)
  if (!parsed.title || !parsed.author || !parsed.category || !parsed.level) {
    return res.status(400).json({
      error: 'Title, author, level, and topic are required',
    })
  }

  try {
    const pdfUrl = parsed.pdfUrl ? await saveLibraryPdf(parsed.pdfUrl) : null
    const { rows } = await sql`
      UPDATE library_books SET
        title = ${parsed.title},
        author = ${parsed.author},
        category = ${parsed.category},
        level = ${parsed.level},
        rating = ${parsed.rating},
        minutes = ${parsed.minutes},
        description = ${parsed.description},
        cover_image_url = COALESCE(${parsed.coverImageUrl}, cover_image_url),
        cover_headline = ${parsed.coverHeadline},
        pdf_url = COALESCE(${pdfUrl}, pdf_url),
        pdf_file_name = COALESCE(${parsed.pdfFileName}, pdf_file_name),
        is_published = ${parsed.isPublished},
        display_order = ${parsed.displayOrder},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json({ book: rows[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.toLowerCase().includes('pdf')) {
      return res.status(400).json({ error: msg })
    }
    console.error('PATCH admin/library:', err)
    return res.status(500).json({ error: 'Failed to update book' })
  }
}
