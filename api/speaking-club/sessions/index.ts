import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db'

function isValidMeetLink(url: string): boolean {
  try {
    const u = new URL(url)
    return (
      (u.protocol === 'https:' || u.protocol === 'http:') &&
      (u.hostname.includes('meet.google.com') ||
        u.hostname.includes('zoom.us') ||
        u.hostname.includes('teams.microsoft.com'))
    )
  } catch {
    return false
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT
          s.*,
          u.full_name AS host_name,
          u.avatar_url AS host_avatar,
          u.handle AS host_handle,
          (
            SELECT COUNT(*)::int
            FROM speaking_club_participants p
            WHERE p.session_id = s.id
          ) AS spots_filled
        FROM speaking_club_sessions s
        JOIN app_users u ON u.id = s.host_tutor_id
        WHERE s.starts_at >= NOW() - INTERVAL '2 hours'
        ORDER BY s.starts_at ASC
      `
      return res.status(200).json({ sessions: rows })
    } catch (err) {
      console.error('GET speaking-club sessions:', err)
      return res.status(500).json({ error: 'Failed to load sessions' })
    }
  }

  if (req.method === 'POST') {
    const user = await getAuthenticatedUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    if (user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can create sessions' })
    }

    const body = req.body ?? {}
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const description =
      typeof body.description === 'string' ? body.description.trim() : ''
    const levelTag =
      typeof body.levelTag === 'string' ? body.levelTag.trim() : 'All levels'
    const startsAt = typeof body.startsAt === 'string' ? body.startsAt : ''
    const meetingLink =
      typeof body.meetingLink === 'string' ? body.meetingLink.trim() : ''
    const durationMinutes = Number(body.durationMinutes) || 60
    const maxParticipants = Number(body.maxParticipants) || 8
    const topicTags = Array.isArray(body.topicTags)
      ? body.topicTags
          .map((t: unknown) => String(t).trim())
          .filter(Boolean)
          .slice(0, 8)
      : []

    if (!title || title.length < 3) {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (!startsAt || Number.isNaN(new Date(startsAt).getTime())) {
      return res.status(400).json({ error: 'Invalid startsAt' })
    }
    if (!meetingLink || !isValidMeetLink(meetingLink)) {
      return res.status(400).json({
        error: 'Provide a valid Google Meet / Zoom / Teams link',
      })
    }
    if (durationMinutes < 15 || durationMinutes > 240) {
      return res.status(400).json({ error: 'Duration must be 15–240 minutes' })
    }
    if (maxParticipants < 2 || maxParticipants > 50) {
      return res.status(400).json({ error: 'Max participants must be 2–50' })
    }

    try {
      await sql`
        INSERT INTO app_users (id, handle, role, full_name, email)
        VALUES (${user.id}, ${user.handle}, ${user.role}, ${user.fullName}, ${user.email})
        ON CONFLICT (id) DO NOTHING
      `

      const tagsCsv = topicTags.join('\u0001')
      const { rows } = await sql`
        INSERT INTO speaking_club_sessions (
          host_tutor_id, title, description, topic_tags, level_tag,
          starts_at, duration_minutes, max_participants, meeting_link
        )
        VALUES (
          ${user.id},
          ${title},
          ${description || null},
          string_to_array(${tagsCsv}, E'\\x01'),
          ${levelTag},
          ${new Date(startsAt).toISOString()},
          ${durationMinutes},
          ${maxParticipants},
          ${meetingLink}
        )
        RETURNING *
      `
      return res.status(201).json({ session: rows[0] })
    } catch (err) {
      console.error('POST speaking-club session:', err)
      return res.status(500).json({ error: 'Failed to create session' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
