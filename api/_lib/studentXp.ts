import { createNotification } from './createNotification.js'
import { sql } from './db.js'

export const TUTOR_BOOST_XP = 30

export type TutorBoostKind = 'daily' | 'lesson'

function isUniqueViolation(err: unknown) {
  return Boolean(
    err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === '23505',
  )
}

export async function grantTutorBoost(input: {
  tutorId: string
  studentId: string
  kind: TutorBoostKind
  bookingId?: number | null
}): Promise<{ ok: true; xp: number; awarded: number } | { ok: false; error: string }> {
  if (input.kind === 'lesson') {
    if (!input.bookingId) {
      return { ok: false, error: 'Lesson boost needs a booking' }
    }
    const booking = await sql`
      SELECT id FROM bookings
      WHERE id = ${input.bookingId}
        AND tutor_id = ${input.tutorId}
        AND student_id = ${input.studentId}
        AND status = 'completed'
      LIMIT 1
    `
    if (booking.rows.length === 0) {
      return { ok: false, error: 'Complete the lesson first' }
    }
  } else {
    const related = await sql`
      SELECT 1 FROM bookings
      WHERE tutor_id = ${input.tutorId}
        AND student_id = ${input.studentId}
        AND status IN ('confirmed', 'completed')
      LIMIT 1
    `
    if (related.rows.length === 0) {
      return { ok: false, error: 'This student is not in your class list' }
    }
  }

  try {
    await sql`
      INSERT INTO student_boosts (
        tutor_id, student_id, kind, booking_id, xp_awarded, boost_day
      )
      VALUES (
        ${input.tutorId},
        ${input.studentId},
        ${input.kind},
        ${input.kind === 'lesson' ? input.bookingId ?? null : null},
        ${TUTOR_BOOST_XP},
        CURRENT_DATE
      )
    `
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        ok: false,
        error:
          input.kind === 'daily'
            ? 'You already boosted this student today'
            : 'This lesson was already boosted',
      }
    }
    throw err
  }

  const { rows } = await sql`
    UPDATE app_users
    SET xp = COALESCE(xp, 0) + ${TUTOR_BOOST_XP}
    WHERE id = ${input.studentId} AND role = 'student'
    RETURNING xp
  `
  const xp = Number(rows[0]?.xp ?? TUTOR_BOOST_XP)

  await createNotification({
    userId: input.studentId,
    type: 'xp_boost',
    title: input.kind === 'daily' ? 'Daily boost +30 XP' : 'Lesson boost +30 XP',
    message:
      input.kind === 'daily'
        ? 'Your teacher sent you a daily boost. Keep going!'
        : 'Your teacher boosted you after the lesson. Nice work!',
    linkPath: '/study',
  })

  return { ok: true, xp, awarded: TUTOR_BOOST_XP }
}

export async function tryGrantLessonBoost(input: {
  tutorId: string
  studentId: string
  bookingId: number
}): Promise<void> {
  try {
    await grantTutorBoost({
      tutorId: input.tutorId,
      studentId: input.studentId,
      kind: 'lesson',
      bookingId: input.bookingId,
    })
  } catch (err) {
    console.error('lesson boost:', err)
  }
}
