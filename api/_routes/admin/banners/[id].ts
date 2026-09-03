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

  const id = Number(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM marketing_banners WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('DELETE banner:', err)
      return res.status(500).json({ error: 'Failed to delete banner' })
    }
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const title = typeof body.title === 'string' ? body.title.trim() : null
  const subtitle =
    body.subtitle === null
      ? null
      : typeof body.subtitle === 'string'
        ? body.subtitle.trim()
        : undefined
  const imageUrl =
    body.imageUrl === null
      ? null
      : typeof body.imageUrl === 'string'
        ? body.imageUrl.trim() || null
        : undefined
  const ctaLabel =
    body.ctaLabel === null
      ? null
      : typeof body.ctaLabel === 'string'
        ? body.ctaLabel.trim() || null
        : undefined
  const ctaLink =
    body.ctaLink === null
      ? null
      : typeof body.ctaLink === 'string'
        ? body.ctaLink.trim() || null
        : undefined
  const backgroundColor =
    typeof body.backgroundColor === 'string' ? body.backgroundColor : undefined
  const isActive = typeof body.isActive === 'boolean' ? body.isActive : undefined
  const startsAt =
    body.startsAt === null
      ? null
      : typeof body.startsAt === 'string'
        ? body.startsAt || null
        : undefined
  const endsAt =
    body.endsAt === null
      ? null
      : typeof body.endsAt === 'string'
        ? body.endsAt || null
        : undefined
  const displayOrder =
    typeof body.displayOrder === 'number' ? body.displayOrder : undefined

  try {
    const { rows } = await sql`
      UPDATE marketing_banners SET
        title = COALESCE(${title}, title),
        subtitle = CASE WHEN ${subtitle === undefined} THEN subtitle ELSE ${subtitle ?? null} END,
        image_url = CASE WHEN ${imageUrl === undefined} THEN image_url ELSE ${imageUrl ?? null} END,
        cta_label = CASE WHEN ${ctaLabel === undefined} THEN cta_label ELSE ${ctaLabel ?? null} END,
        cta_link = CASE WHEN ${ctaLink === undefined} THEN cta_link ELSE ${ctaLink ?? null} END,
        background_color = COALESCE(${backgroundColor ?? null}, background_color),
        is_active = COALESCE(${isActive ?? null}, is_active),
        display_order = COALESCE(${displayOrder ?? null}, display_order),
        starts_at = CASE WHEN ${startsAt === undefined} THEN starts_at ELSE ${startsAt}::timestamptz END,
        ends_at = CASE WHEN ${endsAt === undefined} THEN ends_at ELSE ${endsAt}::timestamptz END
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json({ banner: rows[0] })
  } catch (err) {
    console.error('PATCH banner:', err)
    return res.status(500).json({ error: 'Failed to update banner' })
  }
}
