import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { createNotification } from '../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import { tryGrantLessonBoost } from '../../_lib/studentXp.js'

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

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can create bookings' })
    }

    const body = req.body ?? {}
    const tutorId = typeof body.tutorId === 'string' ? body.tutorId.trim() : ''
    const startAt = typeof body.startAt === 'string' ? body.startAt : ''
    const endAt = typeof body.endAt === 'string' ? body.endAt : ''
    const subject =
      typeof body.subject === 'string' && body.subject.trim()
        ? body.subject.trim().slice(0, 120)
        : null

    if (!tutorId || !startAt || !endAt) {
      return res.status(400).json({ error: 'tutorId, startAt, and endAt are required' })
    }

    const start = new Date(startAt)
    const end = new Date(endAt)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid datetime' })
    }
    if (start >= end) {
      return res.status(400).json({ error: 'startAt must be before endAt' })
    }
    if (start.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'Cannot book a slot in the past' })
    }

    try {
      const tutorCheck = await sql`
        SELECT id, full_name FROM app_users
        WHERE id = ${tutorId} AND role = 'tutor'
        LIMIT 1
      `
      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found' })
      }
      const tutorName = String(tutorCheck.rows[0].full_name ?? 'Tutor')

      await sql`
        INSERT INTO app_users (id, handle, role, full_name, email)
        VALUES (${user.id}, ${user.handle}, ${user.role}, ${user.fullName}, ${user.email})
        ON CONFLICT (id) DO NOTHING
      `

      const { rows } = await sql`
        INSERT INTO bookings (
          tutor_id, student_id, start_at, end_at, subject, status
        )
        VALUES (
          ${tutorId},
          ${user.id},
          ${start.toISOString()},
          ${end.toISOString()},
          ${subject},
          'confirmed'
        )
        RETURNING *
      `
      const booking = rows[0] as {
        id: number
        start_at: string
        subject: string | null
      }
      const when = formatWhen(booking.start_at)
      const subjectLabel = booking.subject || 'Lesson'

      await createNotification({
        userId: user.id,
        type: 'booking_confirmed',
        title: 'Booking confirmed',
        message: `Your ${subjectLabel} with ${tutorName} is booked for ${when} (UTC).`,
        linkPath: '/study/bookings',
      })
      await createNotification({
        userId: tutorId,
        type: 'booking_confirmed',
        title: 'New booking',
        message: `${user.fullName} booked ${subjectLabel} for ${when} (UTC).`,
        linkPath: '/tutor/profile/edit',
      })

      return res.status(201).json({ booking })
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : ''
      if (code === '23P01') {
        return res.status(409).json({
          error:
            'This time slot was just booked by someone else. Please choose another.',
        })
      }
      console.error('POST bookings:', err)
      return res.status(500).json({ error: 'Failed to create booking' })
    }
  }

  if (req.method === 'GET') {
    const roleParam = String(
      Array.isArray(req.query.role) ? req.query.role[0] : req.query.role ?? '',
    )
    const listAsTutor = roleParam === 'tutor' && user.role === 'tutor'

    try {
      // Lazy-complete past lessons so students can leave reviews
      const justCompleted = listAsTutor
        ? await sql`
            UPDATE bookings
            SET status = 'completed'
            WHERE tutor_id = ${user.id}
              AND status = 'confirmed'
              AND end_at < NOW()
            RETURNING id, tutor_id, student_id
          `
        : await sql`
            UPDATE bookings
            SET status = 'completed'
            WHERE student_id = ${user.id}
              AND status = 'confirmed'
              AND end_at < NOW()
            RETURNING id, tutor_id, student_id
          `
      for (const row of justCompleted.rows) {
        await tryGrantLessonBoost({
          tutorId: String(row.tutor_id),
          studentId: String(row.student_id),
          bookingId: Number(row.id),
        })
      }

      if (listAsTutor) {
        const { rows } = await sql`
          SELECT
            b.*,
            s.full_name AS student_name,
            s.handle AS student_handle,
            t.full_name AS tutor_name,
            t.handle AS tutor_handle,
            EXISTS (
              SELECT 1 FROM reviews r WHERE r.booking_id = b.id
            ) AS has_review,
            EXISTS (
              SELECT 1 FROM student_boosts sb
              WHERE sb.booking_id = b.id AND sb.kind = 'lesson'
            ) AS lesson_boosted
          FROM bookings b
          JOIN app_users s ON s.id = b.student_id
          JOIN app_users t ON t.id = b.tutor_id
          WHERE b.tutor_id = ${user.id}
            AND b.status IN ('confirmed', 'completed', 'cancelled')
          ORDER BY b.start_at DESC
        `
        return res.status(200).json({ bookings: rows })
      }

      const { rows } = await sql`
        SELECT
          b.*,
          s.full_name AS student_name,
          s.handle AS student_handle,
          t.full_name AS tutor_name,
          t.handle AS tutor_handle,
          EXISTS (
            SELECT 1 FROM reviews r WHERE r.booking_id = b.id
          ) AS has_review
        FROM bookings b
        JOIN app_users s ON s.id = b.student_id
        JOIN app_users t ON t.id = b.tutor_id
        WHERE b.student_id = ${user.id}
          AND b.status IN ('confirmed', 'completed')
        ORDER BY b.start_at ASC
      `
      return res.status(200).json({ bookings: rows })
    } catch (err) {
      console.error('GET bookings:', err)
      return res.status(500).json({ error: 'Failed to load bookings' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
