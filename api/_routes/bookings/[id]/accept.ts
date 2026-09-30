import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../../_lib/auth.js'
import { createNotification } from '../../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db.js'

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    })
  } catch {
    return iso
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user || user.role !== 'tutor') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const id = Number(idRaw)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid booking id' })
  }

  try {
    const existing = await sql`
      SELECT id, student_id, start_at, status, subject
      FROM bookings
      WHERE id = ${id} AND tutor_id = ${user.id}
      LIMIT 1
    `
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    const booking = existing.rows[0] as {
      student_id: string
      start_at: string
      status: string
      subject: string | null
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'This request is no longer waiting' })
    }

    const { rows } = await sql`
      UPDATE bookings
      SET status = 'confirmed'
      WHERE id = ${id}
        AND tutor_id = ${user.id}
        AND status = 'pending'
      RETURNING *
    `
    if (rows.length === 0) {
      return res.status(409).json({ error: 'This request was already handled' })
    }

    const subjectLabel = booking.subject || 'Lesson'
    const when = formatWhen(booking.start_at)
    await createNotification({
      userId: booking.student_id,
      type: 'booking_confirmed',
      title: 'Booking accepted',
      message: `${user.fullName} accepted your ${subjectLabel} for ${when} (UTC).`,
      linkPath: '/study/bookings',
      actorId: user.id,
    })

    return res.status(200).json({ booking: rows[0] })
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: unknown }).code)
        : ''
    if (code === '23P01') {
      return res.status(409).json({
        error: 'This time already overlaps another lesson.',
      })
    }
    console.error('accept booking:', err)
    return res.status(500).json({ error: 'Failed to accept booking' })
  }
}
