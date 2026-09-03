import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../../_lib/auth.js'
import { createNotification } from '../../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const id = Number(idRaw)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid booking id' })
  }

  try {
    const existing = await sql`
      SELECT * FROM bookings WHERE id = ${id} LIMIT 1
    `
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    const booking = existing.rows[0] as {
      tutor_id: string
      student_id: string
      status: string
      subject: string | null
      start_at: string
    }

    const allowed =
      booking.student_id === user.id || booking.tutor_id === user.id
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Booking is not active' })
    }

    const { rows } = await sql`
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ${id} AND status = 'confirmed'
      RETURNING *
    `

    const subjectLabel = booking.subject || 'Lesson'
    const otherId =
      user.id === booking.student_id ? booking.tutor_id : booking.student_id

    await createNotification({
      userId: otherId,
      type: 'booking_cancelled',
      title: 'Booking cancelled',
      message: `${user.fullName} cancelled ${subjectLabel}.`,
      linkPath:
        user.role === 'student' ? '/tutor/profile/edit' : '/study/bookings',
    })
    await createNotification({
      userId: user.id,
      type: 'booking_cancelled',
      title: 'Booking cancelled',
      message: `You cancelled ${subjectLabel}.`,
      linkPath: user.role === 'student' ? '/study/bookings' : '/tutor/profile/edit',
    })

    return res.status(200).json({ booking: rows[0] })
  } catch (err) {
    console.error('cancel booking:', err)
    return res.status(500).json({ error: 'Failed to cancel booking' })
  }
}
