import { sql } from './db.js'

let ensured = false

export async function ensureTutorFollowsTable() {
  if (ensured) return
  await sql`
    CREATE TABLE IF NOT EXISTS tutor_follows (
      tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (tutor_id, student_id)
    )
  `
  ensured = true
}

export async function resolveTutorId(idOrHandle: string): Promise<string | null> {
  const key = idOrHandle.replace(/^@/, '').trim()
  if (!key) return null
  const { rows } = await sql`
    SELECT id FROM app_users
    WHERE role = 'tutor'
      AND (id = ${key} OR lower(handle) = ${key.toLowerCase()})
    LIMIT 1
  `
  return rows[0]?.id ? String(rows[0].id) : null
}

export async function readTutorProfileStats(
  tutorId: string,
  studentId?: string,
) {
  const [classesResult, studentsResult, clubResult, followsResult, reviewsResult, mineResult] =
    await Promise.all([
      sql`
        SELECT COUNT(*)::int AS n
        FROM bookings
        WHERE tutor_id = ${tutorId} AND status = 'completed'
      `,
      sql`
        SELECT COUNT(*)::int AS n
        FROM (
          SELECT b.student_id
          FROM bookings b
          WHERE b.tutor_id = ${tutorId}
            AND b.status IN ('confirmed', 'completed')
          UNION
          SELECT p.student_id
          FROM speaking_club_participants p
          JOIN speaking_club_sessions s ON s.id = p.session_id
          WHERE s.host_tutor_id = ${tutorId}
        ) roster
      `,
      sql`
        SELECT COUNT(*)::int AS n
        FROM speaking_club_sessions
        WHERE host_tutor_id = ${tutorId}
      `,
      sql`
        SELECT COUNT(*)::int AS n
        FROM tutor_follows
        WHERE tutor_id = ${tutorId}
      `,
      sql`
        SELECT
          COALESCE(AVG(rating), 0)::float AS avg,
          COUNT(*)::int AS n
        FROM reviews
        WHERE tutor_id = ${tutorId}
      `,
      studentId
        ? sql`
            SELECT 1
            FROM tutor_follows
            WHERE tutor_id = ${tutorId} AND student_id = ${studentId}
            LIMIT 1
          `
        : Promise.resolve({ rows: [] as unknown[] }),
    ])

  const reviewCount = Number(reviewsResult.rows[0]?.n) || 0
  const avg = Number(reviewsResult.rows[0]?.avg) || 0
  return {
    classesCount: Number(classesResult.rows[0]?.n) || 0,
    studentsCount: Number(studentsResult.rows[0]?.n) || 0,
    speakingClubSessions: Number(clubResult.rows[0]?.n) || 0,
    followersCount: Number(followsResult.rows[0]?.n) || 0,
    kpi: reviewCount > 0 ? (Math.round(avg * 10) / 10).toFixed(1) : '—',
    following: Boolean(studentId && mineResult.rows.length > 0),
  }
}
