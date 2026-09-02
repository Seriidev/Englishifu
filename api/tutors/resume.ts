import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'

const MAX_DATA_URL = 6 * 1024 * 1024

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user || user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can send a resume' })
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const resumeUrl =
    typeof body.resumeUrl === 'string' ? body.resumeUrl.trim() : ''
  if (!resumeUrl) return res.status(400).json({ error: 'resumeUrl is required' })
  if (resumeUrl.length > MAX_DATA_URL) {
    return res.status(400).json({ error: 'File is too large (max 5MB)' })
  }
  const isPdfData =
    resumeUrl.startsWith('data:application/pdf') ||
    resumeUrl.startsWith('https://') ||
    resumeUrl.startsWith('http://')
  if (!isPdfData) {
    return res.status(400).json({ error: 'Resume must be a PDF' })
  }

  try {
    await sql`
      UPDATE app_users
      SET
        resume_url = ${resumeUrl},
        status = CASE WHEN status = 'approved' THEN status ELSE 'pending' END,
        updated_at = NOW()
      WHERE id = ${user.id} AND role = 'tutor'
    `
    return res.status(200).json({ ok: true, status: 'pending' })
  } catch (err) {
    console.error('POST tutors/resume:', err)
    return res.status(500).json({ error: 'Failed to save resume' })
  }
}
