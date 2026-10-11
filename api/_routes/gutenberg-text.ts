import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth.js'

const MAX_CHARS = 1_500_000

function allowedTextUrl(value: unknown) {
  if (typeof value !== 'string' || value.length > 500) return null
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  if (url.username || url.password) return null
  if (url.hostname !== 'www.gutenberg.org' && url.hostname !== 'gutenberg.org') {
    return null
  }
  return url.toString()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const target = allowedTextUrl(req.query.url)
  if (!target) return res.status(400).json({ error: 'Invalid book address' })

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'Englishcore/1.0 (library reader)' },
      redirect: 'follow',
    })
    if (!upstream.ok) {
      return res.status(502).json({ error: 'Could not download this book' })
    }
    let text = await upstream.text()
    if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    return res.status(200).json({ text })
  } catch {
    return res.status(502).json({ error: 'Could not download this book' })
  }
}
