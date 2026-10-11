import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { pgTextArray } from '../../_lib/assignments.js'
import { createNotification } from '../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

function isValidMeetLink(url: string): boolean {
  return /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(url.trim())
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only teachers can send meeting invites' })
  }

  const body = (req.body ?? {}) as {
    meetLink?: string
    studentIds?: string[]
  }
  const meetLink = String(body.meetLink ?? '').trim()
  const studentIds = Array.isArray(body.studentIds)
    ? [...new Set(body.studentIds.map((id) => String(id).trim()).filter(Boolean))]
    : []

  if (!isValidMeetLink(meetLink)) {
    return res.status(400).json({ error: 'Provide a valid Google Meet link' })
  }
  if (studentIds.length === 0) {
    return res.status(400).json({ error: 'Pick at least one student' })
  }

  try {
    const roster = await sql`
      SELECT u.id
      FROM app_users u
      WHERE u.id = ANY(${pgTextArray(studentIds)}::text[])
        AND u.role = 'student'
        AND (
          EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.tutor_id = ${user.id}
              AND b.student_id = u.id
              AND b.status IN ('confirmed', 'completed')
          )
          OR EXISTS (
            SELECT 1
            FROM speaking_club_participants p
            JOIN speaking_club_sessions s ON s.id = p.session_id
            WHERE s.host_tutor_id = ${user.id}
              AND p.student_id = u.id
          )
        )
    `
    const allowed = new Set(roster.rows.map((r) => String(r.id)))
    const targets = studentIds.filter((id) => allowed.has(id))
    if (targets.length === 0) {
      return res.status(400).json({ error: 'Those students are not on your list' })
    }

    for (const studentId of targets) {
      await createNotification({
        userId: studentId,
        type: 'meet_invite',
        title: 'Google Meet invitation',
        message: `${user.fullName} invited you to a meeting.\n${meetLink}`,
        linkPath: meetLink,
        actorId: user.id,
      })
    }

    return res.status(201).json({ ok: true, sent: targets.length })
  } catch (err) {
    console.error('POST meet-invites:', err)
    return res.status(500).json({ error: 'Failed to send the meeting invite' })
  }
}
