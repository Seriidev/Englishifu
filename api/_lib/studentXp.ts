import { createNotification } from './createNotification.js'
import { sql } from './db.js'

export const LESSON_XP = 10
export const BOOST_XP = 0

function isUniqueViolation(err: unknown) {
  return Boolean(
    err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === '23505',
  )
}

export async function grantDailyBoost(input: {
  tutorId: string
  studentId: string
}): Promise<{ ok: true; xp: number; awarded: number } | { ok: false; error: string }> {
  const student = await sql`
    SELECT id, COALESCE(xp, 0)::int AS xp
    FROM app_users
    WHERE id = ${input.studentId} AND role = 'student'
    LIMIT 1
  `
  if (student.rows.length === 0) {
    return { ok: false, error: 'Student not found' }
  }

  const roster = await sql`
    SELECT 1
    WHERE EXISTS (
      SELECT 1 FROM bookings
      WHERE tutor_id = ${input.tutorId}
        AND student_id = ${input.studentId}
        AND status IN ('confirmed', 'completed')
    )
    OR EXISTS (
      SELECT 1
      FROM speaking_club_participants p
      JOIN speaking_club_sessions s ON s.id = p.session_id
      WHERE s.host_tutor_id = ${input.tutorId}
        AND p.student_id = ${input.studentId}
    )
  `
  if (roster.rows.length === 0) {
    return { ok: false, error: 'Student is not on your list' }
  }

  try {
    await sql`
      INSERT INTO student_boosts (
        tutor_id, student_id, kind, xp_awarded, boost_day
      )
      VALUES (
        ${input.tutorId},
        ${input.studentId},
        ${'daily'},
        ${BOOST_XP},
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date
      )
    `
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, error: 'You already boosted this student today' }
    }
    throw err
  }

  const { rows: tutorRows } = await sql`
    SELECT full_name FROM app_users WHERE id = ${input.tutorId} LIMIT 1
  `
  const tutorName = tutorRows[0]?.full_name
    ? String(tutorRows[0].full_name)
    : 'Your teacher'
  await createNotification({
    userId: input.studentId,
    type: 'xp_boost',
    title: 'Teacher boost',
    message: `${tutorName} boosted you today. Keep going!`,
    linkPath: '/study',
  })

  return {
    ok: true,
    xp: Number(student.rows[0].xp) || 0,
    awarded: 0,
  }
}

export async function grantAdminBoost(studentId: string): Promise<
  { ok: true; xp: number; awarded: number } | { ok: false; error: string }
> {
  const student = await sql`
    SELECT id, COALESCE(xp, 0)::int AS xp
    FROM app_users
    WHERE id = ${studentId} AND role = 'student'
    LIMIT 1
  `
  if (student.rows.length === 0) {
    return { ok: false, error: 'Student not found' }
  }

  try {
    await sql`
      INSERT INTO student_boosts (
        tutor_id, student_id, kind, xp_awarded, boost_day
      )
      VALUES (
        NULL,
        ${studentId},
        ${'admin'},
        ${BOOST_XP},
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date
      )
    `
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, error: 'This student already got an admin boost today' }
    }
    throw err
  }

  await createNotification({
    userId: studentId,
    type: 'xp_boost',
    title: 'Admin boost',
    message: 'An admin boosted you today. Keep going!',
    linkPath: '/study',
  })

  return {
    ok: true,
    xp: Number(student.rows[0].xp) || 0,
    awarded: 0,
  }
}

export async function grantLessonXp(input: {
  tutorId: string
  studentId: string
  bookingId: number
}): Promise<void> {
  try {
    await sql`
      INSERT INTO student_boosts (
        tutor_id, student_id, kind, booking_id, xp_awarded, boost_day
      )
      VALUES (
        ${input.tutorId},
        ${input.studentId},
        ${'lesson'},
        ${input.bookingId},
        ${LESSON_XP},
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date
      )
    `
  } catch (err) {
    if (isUniqueViolation(err)) return
    throw err
  }

  await sql`
    UPDATE app_users
    SET xp = COALESCE(xp, 0) + ${LESSON_XP}, updated_at = NOW()
    WHERE id = ${input.studentId} AND role = 'student'
  `
}

export async function grantDueLessonXp(filter: {
  tutorId?: string
  studentId?: string
}): Promise<void> {
  const tutorId = filter.tutorId ?? null
  const studentId = filter.studentId ?? null
  await sql`
    UPDATE bookings
    SET status = 'completed'
    WHERE status = 'confirmed'
      AND end_at < NOW()
      AND (
        (${tutorId}::text IS NOT NULL AND tutor_id = ${tutorId})
        OR (${studentId}::text IS NOT NULL AND student_id = ${studentId})
      )
  `
  const inserted = await sql`
    INSERT INTO student_boosts (
      tutor_id, student_id, kind, booking_id, xp_awarded, boost_day
    )
    SELECT
      b.tutor_id,
      b.student_id,
      ${'lesson'},
      b.id,
      ${LESSON_XP},
      (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date
    FROM bookings b
    WHERE b.status = 'completed'
      AND (
        (${tutorId}::text IS NOT NULL AND b.tutor_id = ${tutorId})
        OR (${studentId}::text IS NOT NULL AND b.student_id = ${studentId})
      )
      AND NOT EXISTS (
        SELECT 1 FROM student_boosts sb
        WHERE sb.booking_id = b.id AND sb.kind = 'lesson'
      )
    RETURNING student_id
  `
  const counts = new Map<string, number>()
  for (const row of inserted.rows) {
    const id = String(row.student_id)
    counts.set(id, (counts.get(id) || 0) + 1)
  }
  for (const [id, n] of counts) {
    await sql`
      UPDATE app_users
      SET xp = COALESCE(xp, 0) + ${n * LESSON_XP}, updated_at = NOW()
      WHERE id = ${id} AND role = 'student'
    `
  }
}
