import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const uid = typeof req.query.uid === 'string' ? req.query.uid.trim() : ''
  if (!uid) return res.status(400).send('Missing uid')

  try {
    await sql`
      UPDATE app_users
      SET email_unsubscribed = true,
          marketing_opt_in = false,
          updated_at = NOW()
      WHERE id = ${uid}
    `
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(
      `<!doctype html><html><body style="font-family:system-ui;padding:2rem">
        <h1>Unsubscribed</h1>
        <p>You will no longer receive marketing emails from Englishcore.</p>
      </body></html>`,
    )
  } catch (err) {
    console.error('unsubscribe:', err)
    return res.status(500).send('Could not unsubscribe')
  }
}
