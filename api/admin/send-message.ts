import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth'
import { verifyAdminSession } from '../_lib/adminAuth'
import { createNotification } from '../_lib/createNotification'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'
import { sendEmail, wrapMarketingHtml } from '../_lib/sendEmail'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT
          MIN(n.id) AS id,
          n.title,
          n.message,
          n.link_path,
          MAX(n.created_at) AS sent_at,
          COUNT(*)::int AS recipient_count,
          COUNT(*) FILTER (WHERE u.role = 'student')::int AS student_count,
          COUNT(*) FILTER (WHERE u.role = 'tutor')::int AS tutor_count,
          (ARRAY_AGG(u.full_name ORDER BY n.id DESC))[1] AS recipient_name,
          (ARRAY_AGG(u.handle ORDER BY n.id DESC))[1] AS recipient_handle,
          (ARRAY_AGG(u.email ORDER BY n.id DESC))[1] AS recipient_email,
          (ARRAY_AGG(u.role ORDER BY n.id DESC))[1] AS recipient_role,
          (ARRAY_AGG(u.id ORDER BY n.id DESC))[1] AS recipient_id
        FROM notifications n
        JOIN app_users u ON u.id = n.user_id
        WHERE n.type = 'admin_message'
        GROUP BY
          n.title,
          n.message,
          n.link_path,
          date_trunc('minute', n.created_at)
        ORDER BY MAX(n.created_at) DESC
        LIMIT 80
      `
      return res.status(200).json({ messages: rows })
    } catch (err) {
      console.error('GET admin/send-message:', err)
      return res.status(500).json({ error: 'Failed to load sent messages' })
    }
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const linkPath =
    typeof body.linkPath === 'string' ? body.linkPath.trim() || null : null
  const alsoEmail = body.alsoSendEmail === true
  const audience =
    typeof body.audience === 'string' ? body.audience : 'selected'
  const userIdRaw = typeof body.userId === 'string' ? body.userId.trim() : ''
  const userIds = Array.isArray(body.userIds)
    ? body.userIds.map(String).filter(Boolean)
    : []

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' })
  }

  try {
    let ids = userIds
    if (audience === 'all_students' || audience === 'all_tutors') {
      const role = audience === 'all_students' ? 'student' : 'tutor'
      const { rows } = await sql`
        SELECT id FROM app_users
        WHERE role = ${role} AND COALESCE(is_suspended, false) = false
      `
      ids = rows.map((r) => String(r.id))
    } else if (audience === 'by_user') {
      const tokens = userIdRaw
        .split(/[\s,;]+/)
        .map((s) => s.replace(/^@/, '').trim())
        .filter(Boolean)
      ids = []
      for (const token of tokens) {
        const { rows } = await sql`
          SELECT id FROM app_users
          WHERE id::text = ${token}
            OR lower(handle) = ${token.toLowerCase()}
            OR lower(email) = ${token.toLowerCase()}
          LIMIT 1
        `
        const found = rows[0]?.id
        if (found) ids.push(String(found))
      }
      if (ids.length === 0) {
        return res.status(404).json({
          error:
            'User not found. Paste a user ID, @username, or email (student or tutor).',
        })
      }
    }
    if (ids.length === 0) {
      return res.status(400).json({ error: 'No recipients selected' })
    }
    if (ids.length > 500) {
      return res.status(400).json({ error: 'Too many recipients (max 500)' })
    }

    let emailed = 0
    let emailSkipped = 0
    for (const userId of ids) {
      await createNotification({
        userId,
        type: 'admin_message',
        title,
        message,
        linkPath,
      })
      if (!alsoEmail) continue
      const { rows } = await sql`
        SELECT email, marketing_opt_in, email_unsubscribed
        FROM app_users WHERE id = ${userId} LIMIT 1
      `
      const row = rows[0] as
        | {
            email: string
            marketing_opt_in: boolean
            email_unsubscribed: boolean
          }
        | undefined
      if (!row?.email || !row.marketing_opt_in || row.email_unsubscribed) {
        emailSkipped += 1
        continue
      }
      const html = wrapMarketingHtml(
        `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
        userId,
      )
      const sent = await sendEmail(row.email, title, html)
      if (sent.ok) emailed += 1
      else emailSkipped += 1
    }

    return res.status(200).json({
      sent: ids.length,
      emailed,
      emailSkipped,
    })
  } catch (err) {
    console.error('admin send-message:', err)
    return res.status(500).json({ error: 'Failed to send messages' })
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
