import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../../_lib/auth.js'
import { readLocalUpload } from '../../../_lib/saveMedia.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const kind = Array.isArray(req.query.kind) ? req.query.kind[0] : req.query.kind
  const name = Array.isArray(req.query.name) ? req.query.name[0] : req.query.name
  if (typeof kind !== 'string' || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid file' })
  }

  const file = await readLocalUpload(kind, decodeURIComponent(name))
  if (!file) return res.status(404).json({ error: 'File not found' })

  res.setHeader('Content-Type', file.contentType)
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Length', String(file.buffer.length))
  if (req.method === 'HEAD') return res.status(200).end()
  return res.status(200).end(file.buffer)
}
