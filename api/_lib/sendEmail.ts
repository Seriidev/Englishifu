import { Resend } from 'resend'

const FROM =
  process.env.RESEND_FROM || 'Englishcore <hello@englishcore.com>'

function appBaseUrl(): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return 'https://englishcore.vercel.app'
}

export function unsubscribeUrl(userId: string): string {
  return `${appBaseUrl()}/api/unsubscribe?uid=${encodeURIComponent(userId)}`
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('RESEND_API_KEY is not set — skipping email to', to)
    return { ok: false, skipped: true }
  }
  try {
    const resend = new Resend(key)
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    })
    if (error) {
      console.error('Resend error:', error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err) {
    console.error('sendEmail:', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
    }
  }
}

export function wrapMarketingHtml(bodyHtml: string, userId: string): string {
  const unsub = unsubscribeUrl(userId)
  return `<!doctype html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
  ${bodyHtml}
  <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0" />
  <p style="font-size:12px;color:#64748b">
    You received this because you opted in to Englishcore emails.
    <a href="${unsub}">Unsubscribe</a>
  </p>
</body>
</html>`
}
