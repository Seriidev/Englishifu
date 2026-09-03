import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../_lib/auth'
import { buildAvailableSlots } from '../../../_lib/slots'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../../_lib/db'

function pathSegment(req: VercelRequest): string {
  const raw = req.query.id ?? req.query.handle
  const value = Array.isArray(raw) ? raw[0] : raw
  return String(value ?? '')
    .replace(/^@/, '')
    .trim()
    .toLowerCase()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const handle = pathSegment(req)
  const daysAhead = Math.min(
    60,
    Math.max(1, Number(req.query.days) || 14),
  )

  if (!handle) {
    return res.status(400).json({ error: 'Missing tutor handle' })
  }

  try {
    const tutorResult = await sql`
      SELECT id, handle, full_name
      FROM app_users
      WHERE lower(handle) = ${handle} AND role = 'tutor'
      LIMIT 1
    `
    if (tutorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' })
    }
    const tutor = tutorResult.rows[0] as {
      id: string
      handle: string
      full_name: string
    }

    const availabilityResult = await sql`
      SELECT day_of_week, start_time, end_time, slot_duration_minutes, timezone
      FROM tutor_availability
      WHERE tutor_id = ${tutor.id} AND is_active = true
    `

    const rangeEnd = new Date()
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + daysAhead)

    const existingBookingsResult = await sql`
      SELECT start_at, end_at
      FROM bookings
      WHERE tutor_id = ${tutor.id}
        AND status = 'confirmed'
        AND start_at >= NOW()
        AND start_at <= ${rangeEnd.toISOString()}
    `

    const slots = buildAvailableSlots({
      weeklyTemplate: availabilityResult.rows as Array<{
        day_of_week: number
        start_time: string
        end_time: string
        slot_duration_minutes: number
        timezone?: string
      }>,
      bookedRanges: existingBookingsResult.rows as Array<{
        start_at: string
        end_at: string
      }>,
      daysAhead,
    })

    return res.status(200).json({
      tutorId: tutor.id,
      tutorHandle: tutor.handle,
      tutorName: tutor.full_name,
      slots,
    })
  } catch (err) {
    console.error('available-slots error:', err)
    return res.status(500).json({ error: 'Failed to load available slots' })
  }
}
