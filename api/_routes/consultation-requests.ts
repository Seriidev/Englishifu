import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const toeflScore =
    typeof body.toeflScore === 'string' ? body.toeflScore.trim() : ''
  const learningGoal =
    typeof body.learningGoal === 'string' ? body.learningGoal.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!fullName || !email || !email.includes('@') || !phone || !learningGoal) {
    return res.status(400).json({ error: 'Name, email, phone, and goal are required' })
  }

  try {
    const { rows } = await sql`
      INSERT INTO consultation_requests (
        full_name, email, phone, toefl_score, learning_goal, message
      )
      VALUES (
        ${fullName},
        ${email},
        ${phone},
        ${toeflScore || null},
        ${learningGoal},
        ${message || null}
      )
      RETURNING id
    `
    return res.status(201).json({ ok: true, id: rows[0]?.id })
  } catch (err) {
    console.error('POST consultation-requests:', err)
    return res.status(500).json({ error: 'Failed to submit request' })
  }
}
