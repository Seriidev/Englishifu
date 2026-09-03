import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, clearSessionCookie } from '../../_lib/auth'

/** POST — clears httpOnly session cookie. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  clearSessionCookie(res)
  return res.status(200).json({ ok: true })
}
