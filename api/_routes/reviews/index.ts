import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { createNotification } from '../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can leave reviews' })
  }

  const body = req.body ?? {}
  const rating = Number(body.rating)
  const comment =
    typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : null
  const bookingIdRaw =
    body.bookingId != null && body.bookingId !== ''
      ? Number(body.bookingId)
      : null
  const tutorHandle =
    typeof body.tutorHandle === 'string'
      ? body.tutorHandle.replace(/^@/, '').trim().toLowerCase()
      : ''

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1–5' })
  }

  try {
    if (bookingIdRaw != null) {
      return await createBookingReview(
        res,
        user.id,
        user.fullName,
        bookingIdRaw,
        rating,
        comment,
      )
    }

    if (!tutorHandle) {
      return res.status(400).json({ error: 'tutorHandle or bookingId is required' })
    }

    return await createProfileReview(
      res,
      user.id,
      user.fullName,
      tutorHandle,
      rating,
      comment,
    )
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: unknown }).code)
        : ''
    if (code === '23505') {
      return res.status(409).json({ error: 'You already reviewed this teacher' })
    }
    console.error('POST reviews:', err)
    return res.status(500).json({ error: 'Failed to create review' })
  }
}

async function createBookingReview(
  res: VercelResponse,
  studentId: string,
  studentName: string,
  bookingId: number,
  rating: number,
  comment: string | null,
) {
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ error: 'Invalid bookingId' })
  }

  await sql`
    UPDATE bookings
    SET status = 'completed'
    WHERE id = ${bookingId}
      AND student_id = ${studentId}
      AND status = 'confirmed'
      AND end_at < NOW()
  `

  const bookingResult = await sql`
    SELECT * FROM bookings
    WHERE id = ${bookingId} AND student_id = ${studentId}
    LIMIT 1
  `
  const booking = bookingResult.rows[0] as
    | { tutor_id: string; status: string }
    | undefined

  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  if (booking.status !== 'completed') {
    return res.status(400).json({
      error: 'You can only review completed lessons',
    })
  }

  const { rows } = await sql`
    INSERT INTO reviews (booking_id, tutor_id, student_id, rating, comment)
    VALUES (
      ${bookingId},
      ${booking.tutor_id},
      ${studentId},
      ${rating},
      ${comment || null}
    )
    RETURNING *
  `

  await notifyTutor(booking.tutor_id, studentName, rating)
  return res.status(201).json({ review: rows[0] })
}

async function createProfileReview(
  res: VercelResponse,
  studentId: string,
  studentName: string,
  tutorHandle: string,
  rating: number,
  comment: string | null,
) {
  const tutorResult = await sql`
    SELECT id FROM app_users
    WHERE lower(handle) = ${tutorHandle} AND role = 'tutor'
    LIMIT 1
  `
  const tutorId = tutorResult.rows[0]?.id as string | undefined
  if (!tutorId) return res.status(404).json({ error: 'Tutor not found' })
  if (tutorId === studentId) {
    return res.status(400).json({ error: 'You cannot review yourself' })
  }

  const { rows } = await sql`
    INSERT INTO reviews (booking_id, tutor_id, student_id, rating, comment)
    VALUES (
      ${null},
      ${tutorId},
      ${studentId},
      ${rating},
      ${comment || null}
    )
    RETURNING *
  `

  await notifyTutor(tutorId, studentName, rating)
  return res.status(201).json({ review: rows[0] })
}

async function notifyTutor(tutorId: string, studentName: string, rating: number) {
  await createNotification({
    userId: tutorId,
    type: 'new_review',
    title: 'New review received',
    message: `You received a ${rating}-star review from ${studentName}.`,
    linkPath: '/tutor/profile',
  })
}
