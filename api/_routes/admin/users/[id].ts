import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../_lib/auth.js'
import { verifyAdminSession } from '../../../_lib/adminAuth.js'
import { dbUnavailableResponse, isDbConfigured } from '../../../_lib/db.js'
import { deleteAppUserAccount } from '../../../_lib/deleteAppUser.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const id = String(
    Array.isArray(req.query.id) ? req.query.id[0] : req.query.id || '',
  ).trim()
  if (!id) return res.status(400).json({ error: 'Missing id' })

  try {
    const deleted = await deleteAppUserAccount(id)
    if (!deleted) return res.status(404).json({ error: 'User not found' })
    return res.status(200).json({ ok: true, user: deleted })
  } catch (err) {
    console.error('DELETE admin/users:', err)
    return res.status(500).json({ error: 'Failed to delete account' })
  }
}
