import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'

function normalizeTime(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) return null
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can manage availability' })
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT *
        FROM tutor_availability
        WHERE tutor_id = ${user.id} AND is_active = true
        ORDER BY day_of_week, start_time
      `
      return res.status(200).json({ availability: rows })
    } catch (err) {
      console.error('GET tutor-availability:', err)
      return res.status(500).json({ error: 'Failed to load availability' })
    }
  }

  if (req.method === 'POST') {
    const body = req.body ?? {}
    const dayOfWeek = Number(body.dayOfWeek)
    const startTime = normalizeTime(body.startTime)
    const endTime = normalizeTime(body.endTime)
    const slotDurationMinutes = Number(body.slotDurationMinutes) || 60
    const timezone =
      typeof body.timezone === 'string' && body.timezone.trim()
        ? body.timezone.trim()
        : 'UTC'

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Invalid day of week' })
    }
    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'Invalid start or end time' })
    }
    if (startTime >= endTime) {
      return res.status(400).json({ error: 'Start time must be before end time' })
    }
    if (slotDurationMinutes < 15 || slotDurationMinutes > 240) {
      return res.status(400).json({ error: 'Slot duration must be 15–240 minutes' })
    }

    try {
      await sql`
        INSERT INTO app_users (id, handle, role, full_name, email)
        VALUES (${user.id}, ${user.handle}, ${user.role}, ${user.fullName}, ${user.email})
        ON CONFLICT (id) DO NOTHING
      `

      const { rows } = await sql`
        INSERT INTO tutor_availability (
          tutor_id, day_of_week, start_time, end_time, slot_duration_minutes, timezone
        )
        VALUES (
          ${user.id},
          ${dayOfWeek},
          ${startTime}::time,
          ${endTime}::time,
          ${slotDurationMinutes},
          ${timezone}
        )
        RETURNING *
      `
      return res.status(201).json({ availability: rows[0] })
    } catch (err) {
      console.error('POST tutor-availability:', err)
      return res.status(500).json({ error: 'Failed to create availability' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
