import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../../../_lib/auth.js'
import { createNotification } from '../../../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../../_lib/db.js'

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
    return res.status(403).json({ error: 'Only students can join sessions' })
  }

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const id = Number(idRaw)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid session id' })
  }

  try {
    await sql`
      INSERT INTO app_users (id, handle, role, full_name, email)
      VALUES (${user.id}, ${user.handle}, ${user.role}, ${user.fullName}, ${user.email})
      ON CONFLICT (id) DO NOTHING
    `

    const sessionResult = await sql`
      SELECT * FROM speaking_club_sessions WHERE id = ${id} LIMIT 1
    `
    const session = sessionResult.rows[0] as
      | {
          id: number
          title: string
          starts_at: string
          max_participants: number
          meeting_link: string
        }
      | undefined

    if (!session) return res.status(404).json({ error: 'Session not found' })

    const countResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM speaking_club_participants
      WHERE session_id = ${id}
    `
    const currentCount = Number(countResult.rows[0]?.count ?? 0)

    // Already joined → return link
    const existing = await sql`
      SELECT 1 FROM speaking_club_participants
      WHERE session_id = ${id} AND student_id = ${user.id}
      LIMIT 1
    `
    if (existing.rows.length > 0) {
      return res.status(200).json({
        meetingLink: session.meeting_link,
        alreadyJoined: true,
      })
    }

    if (currentCount >= Number(session.max_participants)) {
      return res.status(409).json({ error: 'This session is full' })
    }

    try {
      await sql`
        INSERT INTO speaking_club_participants (session_id, student_id)
        VALUES (${id}, ${user.id})
      `
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : ''
      if (code === '23505') {
        return res.status(200).json({
          meetingLink: session.meeting_link,
          alreadyJoined: true,
        })
      }
      throw err
    }

    await createNotification({
      userId: user.id,
      type: 'speaking_club_reminder',
      title: 'You joined a Speaking Club session',
      message: `${session.title} · ${new Date(session.starts_at).toLocaleString()}`,
      linkPath: '/study/speaking-club',
    })

    return res.status(200).json({
      meetingLink: session.meeting_link,
      alreadyJoined: false,
    })
  } catch (err) {
    console.error('join speaking-club:', err)
    return res.status(500).json({ error: 'Failed to join session' })
  }
}
