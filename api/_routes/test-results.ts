import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user || user.role !== 'student') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const testType =
    typeof body.testType === 'string' ? body.testType.trim() : 'full-test'
  const overall = Number(body.overallBandScore)
  const sectionScores = body.sectionScores ?? null
  const completedAt =
    typeof body.completedAt === 'string' ? body.completedAt : new Date().toISOString()

  const allowed = new Set(['full-test', 'reading', 'listening', 'speaking', 'writing'])
  if (!allowed.has(testType)) {
    return res.status(400).json({ error: 'Invalid test type' })
  }
  if (!Number.isFinite(overall)) {
    return res.status(400).json({ error: 'overallBandScore is required' })
  }

  try {
    const { rows } = await sql`
      INSERT INTO test_results (
        student_id, test_type, overall_band_score, section_scores, completed_at
      )
      VALUES (
        ${user.id},
        ${testType},
        ${overall},
        ${JSON.stringify(sectionScores)}::jsonb,
        ${completedAt}::timestamptz
      )
      RETURNING id
    `
    return res.status(201).json({ ok: true, id: rows[0]?.id })
  } catch (err) {
    console.error('POST test-results:', err)
    return res.status(500).json({ error: 'Failed to save test result' })
  }
}
