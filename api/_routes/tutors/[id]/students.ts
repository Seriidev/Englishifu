import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const tutorId = String(idRaw ?? '').trim()
  if (!tutorId) return res.status(400).json({ error: 'Missing tutor id' })

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role === 'tutor' && user.id !== tutorId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const { rows } = await sql`
      SELECT
        u.id,
        u.full_name,
        u.avatar_url,
        u.handle,
        u.cefr_level,
        COALESCE(u.xp, 0)::int AS xp,
        NOT EXISTS (
          SELECT 1
          FROM student_boosts sb
          WHERE sb.tutor_id = ${tutorId}
            AND sb.student_id = u.id
            AND sb.kind = 'daily'
            AND sb.boost_day = CURRENT_DATE
        ) AS can_daily_boost,
        COUNT(*) FILTER (WHERE b.status = 'completed')::int AS lessons_completed,
        (
          SELECT MIN(b2.start_at)
          FROM bookings b2
          WHERE b2.tutor_id = ${tutorId}
            AND b2.student_id = u.id
            AND b2.status = 'confirmed'
            AND b2.start_at > NOW()
        ) AS next_lesson_date
      FROM bookings b
      JOIN app_users u ON u.id = b.student_id
      WHERE b.tutor_id = ${tutorId}
        AND b.status IN ('completed', 'confirmed')
      GROUP BY u.id, u.full_name, u.avatar_url, u.handle, u.cefr_level, u.xp
      ORDER BY u.full_name ASC
    `

    const students = rows.map((r) => ({
      id: String(r.id),
      fullName: String(r.full_name),
      avatarUrl: r.avatar_url ? String(r.avatar_url) : undefined,
      handle: String(r.handle),
      cefrLevel: r.cefr_level ? String(r.cefr_level) : undefined,
      xp: Number(r.xp) || 0,
      canDailyBoost: Boolean(r.can_daily_boost),
      lessonsCompleted: Number(r.lessons_completed) || 0,
      nextLessonDate: r.next_lesson_date
        ? new Date(String(r.next_lesson_date)).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : undefined,
      status: 'active' as const,
    }))

    return res.status(200).json({ students })
  } catch (err) {
    console.error('tutor students:', err)
    return res.status(500).json({ error: 'Failed to load students' })
  }
}
