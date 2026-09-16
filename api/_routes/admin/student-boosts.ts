import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth.js'
import { verifyAdminSession } from '../../_lib/adminAuth.js'
import { grantAdminBoost } from '../../_lib/studentXp.js'
import { dbUnavailableResponse, isDbConfigured } from '../../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const body = (req.body ?? {}) as { studentId?: string }
  const studentId = String(body.studentId ?? '').trim()
  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' })
  }

  try {
    const result = await grantAdminBoost(studentId)
    if (!result.ok) {
      return res.status(409).json({ error: result.error })
    }
    return res.status(200).json(result)
  } catch (err) {
    console.error('POST admin/student-boosts:', err)
    return res.status(500).json({ error: 'Failed to send boost' })
  }
}
