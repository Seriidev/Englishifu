import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import { loadLibraryPdf } from '../../_lib/saveLibraryPdf.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Sign in to read this book' })
  }

  const id = Number(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  try {
    const { rows } = await sql`
      SELECT pdf_url
      FROM library_books
      WHERE id = ${id} AND is_published = true
      LIMIT 1
    `
    const row = rows[0] as { pdf_url?: string | null } | undefined
    if (!row?.pdf_url) {
      return res.status(404).json({ error: 'This book has no PDF yet' })
    }

    const loaded = await loadLibraryPdf(String(row.pdf_url))
    if ('redirect' in loaded) {
      // Never send readers to an external downloadable URL.
      return res.status(403).json({ error: 'This book cannot be opened here' })
    }

    res.setHeader('Content-Type', 'application/pdf')
    // Inline + generic name — discourage Save As / download naming.
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"')
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'")
    res.setHeader('Content-Length', String(loaded.buffer.length))
    return res.end(loaded.buffer)
  } catch (err) {
    console.error('GET library-pdf:', err)
    return res.status(404).json({ error: 'Could not open this book' })
  }
}
