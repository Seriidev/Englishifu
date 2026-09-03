import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../_lib/auth'
import { grantTutorBoost } from '../_lib/studentXp'
import { dbUnavailableResponse, isDbConfigured } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user || user.role !== 'tutor') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = (req.body ?? {}) as {
    studentId?: string
    kind?: string
    bookingId?: number
  }
  const studentId = String(body.studentId ?? '').trim()
  const kind = body.kind === 'lesson' ? 'lesson' : 'daily'
  const bookingId =
    kind === 'lesson' && Number.isInteger(Number(body.bookingId))
      ? Number(body.bookingId)
      : null

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' })
  }

  try {
    const result = await grantTutorBoost({
      tutorId: user.id,
      studentId,
      kind,
      bookingId,
    })
    if (!result.ok) {
      return res.status(409).json({ error: result.error })
    }
    return res.status(200).json(result)
  } catch (err) {
    console.error('POST student-boosts:', err)
    return res.status(500).json({ error: 'Failed to send boost' })
  }
}
