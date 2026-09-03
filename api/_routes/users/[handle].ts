import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  applyCors,
  fetchAppUserByHandle,
  getAuthenticatedUser,
} from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured } from '../../_lib/db'
import { rowToPublicUser } from '../../_lib/userMapper'

/**
 * GET /api/users/:handle — public profile (student or tutor).
 * Private profiles are visible only to the owner.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const handleParam = req.query.handle
  const handle =
    typeof handleParam === 'string'
      ? handleParam
      : Array.isArray(handleParam)
        ? handleParam[0]
        : ''

  if (!handle) {
    return res.status(400).json({ error: 'Handle is required' })
  }

  try {
    const row = await fetchAppUserByHandle(handle)
    if (!row) return res.status(404).json({ error: 'Profile not found' })

    const user = rowToPublicUser(row)
    if (row.role === 'tutor') {
      const auth = await getAuthenticatedUser(req)
      const isOwner = Boolean(auth && auth.id === user.id)
      if (!isOwner) {
        if (row.is_suspended) {
          return res.status(404).json({ error: 'Profile not found' })
        }
        if (user.role === 'tutor' && user.status !== 'approved') {
          return res.status(404).json({ error: 'Profile not found' })
        }
      }
    }
    if (!user.isPublicProfile) {
      const auth = await getAuthenticatedUser(req)
      if (!auth || auth.id !== user.id) {
        return res.status(404).json({ error: 'Profile not found' })
      }
    }

    return res.status(200).json({ user })
  } catch (err) {
    console.error('GET users/[handle]:', err)
    return res.status(500).json({ error: 'Failed to load profile' })
  }
}
