import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../_lib/auth'
import { verifyAdminSession } from '../../../_lib/adminAuth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db'

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
        SELECT * FROM marketing_banners
        ORDER BY display_order ASC, id ASC
      `
      return res.status(200).json({ banners: rows })
    } catch (err) {
      console.error('GET admin/banners:', err)
      return res.status(500).json({ error: 'Failed to load banners' })
    }
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>
    if (Array.isArray(body.order)) {
      try {
        const order = body.order.map(Number).filter((n) => Number.isInteger(n) && n > 0)
        for (let i = 0; i < order.length; i++) {
          await sql`
            UPDATE marketing_banners
            SET display_order = ${i}
            WHERE id = ${order[i]}
          `
        }
        return res.status(200).json({ ok: true })
      } catch (err) {
        console.error('reorder banners:', err)
        return res.status(500).json({ error: 'Failed to reorder' })
      }
    }

    const imageUrl =
      typeof body.imageUrl === 'string' ? body.imageUrl.trim() || null : null
    if (!imageUrl) return res.status(400).json({ error: 'Poster image is required' })
    const title =
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim()
        : 'Poster'
    const ctaLabel =
      typeof body.ctaLabel === 'string' ? body.ctaLabel.trim() || null : null
    const ctaLink =
      typeof body.ctaLink === 'string' ? body.ctaLink.trim() || null : null
    const backgroundColor =
      typeof body.backgroundColor === 'string' && body.backgroundColor
        ? body.backgroundColor
        : '#38BDF8'
    const isActive = body.isActive !== false
    const startsAt =
      typeof body.startsAt === 'string' && body.startsAt ? body.startsAt : null
    const endsAt =
      typeof body.endsAt === 'string' && body.endsAt ? body.endsAt : null
    const displayOrder = Number(body.displayOrder) || 0

    try {
      const { rows } = await sql`
        INSERT INTO marketing_banners (
          title, subtitle, image_url, cta_label, cta_link,
          background_color, is_active, display_order, starts_at, ends_at
        )
        VALUES (
          ${title},
          ${null},
          ${imageUrl},
          ${ctaLabel},
          ${ctaLink},
          ${backgroundColor},
          ${isActive},
          ${displayOrder},
          ${startsAt}::timestamptz,
          ${endsAt}::timestamptz
        )
        RETURNING *
      `
      return res.status(201).json({ banner: rows[0] })
    } catch (err) {
      console.error('POST admin/banners:', err)
      return res.status(500).json({ error: 'Failed to create banner' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
