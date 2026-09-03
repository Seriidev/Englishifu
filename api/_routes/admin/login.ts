import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth'
import {
  checkAdminPassword,
  createAdminSessionToken,
  clearAdminCookie,
  setAdminCookie,
  verifyAdminSession,
} from '../../_lib/adminAuth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'GET') {
    return res.status(200).json({ ok: verifyAdminSession(req) })
  }

  if (req.method === 'DELETE') {
    clearAdminCookie(res)
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_SECRET) {
    return res.status(503).json({ error: 'ADMIN_PASSWORD is not configured' })
  }

  const password =
    typeof req.body?.password === 'string' ? req.body.password : ''
  if (!checkAdminPassword(password)) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  try {
    const token = createAdminSessionToken()
    setAdminCookie(res, token)
    return res.status(200).json({ ok: true, token })
  } catch (err) {
    console.error('admin login:', err)
    return res.status(500).json({ error: 'Failed to create admin session' })
  }
}
