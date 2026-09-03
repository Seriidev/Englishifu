import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../../_lib/auth.js'
import { createNotification } from '../../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db.js'
import { maybeCompleteReferralReward } from '../../../_lib/rewards.js'
import { tryGrantLessonBoost } from '../../../_lib/studentXp.js'

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
    const { rows } = await sql`
      UPDATE bookings
      SET status = 'completed'
      WHERE id = ${id}
        AND tutor_id = ${user.id}
        AND status = 'confirmed'
      RETURNING *
    `
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const booking = rows[0] as {
      id: number
      student_id: string
      subject: string | null
    }

    await tryGrantLessonBoost({
      tutorId: user.id,
      studentId: booking.student_id,
      bookingId: Number(booking.id),
    })

    await createNotification({
      userId: booking.student_id,
      type: 'booking_completed',
      title: 'Lesson completed — leave a review!',
      message: `How was your ${booking.subject || 'lesson'}? Rate your experience.`,
      linkPath: '/study/bookings',
    })

    await maybeCompleteReferralReward(booking.student_id)

    return res.status(200).json({ booking: rows[0] })
  } catch (err) {
    console.error('complete booking:', err)
    return res.status(500).json({ error: 'Failed to complete booking' })
  }
}
