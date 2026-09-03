import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db'
import { loadLibraryPdf } from '../../_lib/saveLibraryPdf'

function fileName(raw: unknown) {
  const name = String(raw || 'book.pdf').replace(/[^\w.\- ()]+/g, '_')
  return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const id = Number(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  try {
    const { rows } = await sql`
      SELECT pdf_url, pdf_file_name, title
      FROM library_books
      WHERE id = ${id} AND is_published = true
      LIMIT 1
    `
    const row = rows[0] as
      | { pdf_url?: string | null; pdf_file_name?: string | null; title?: string }
      | undefined
    if (!row?.pdf_url) {
      return res.status(404).json({ error: 'This book has no PDF yet' })
    }

    const loaded = await loadLibraryPdf(String(row.pdf_url))
    if ('redirect' in loaded) {
      res.statusCode = 302
      res.setHeader('Location', loaded.redirect)
      return res.end()
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileName(row.pdf_file_name || row.title)}"`,
    )
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.setHeader('Content-Length', String(loaded.buffer.length))
    return res.end(loaded.buffer)
  } catch (err) {
    console.error('GET library-pdf:', err)
    return res.status(404).json({ error: 'Could not open this book' })
  }
}
