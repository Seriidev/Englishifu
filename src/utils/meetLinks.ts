import { getApiToken } from './bookingApi'

export function isValidMeetLink(url: string): boolean {
  return /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(url.trim())
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    if (data?.error) return data.error
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`
}

export async function sendMeetInviteToMany(
  studentIds: string[],
  meetLink: string,
): Promise<void> {
  const token = getApiToken()
  const res = await fetch('/api/meet-invites', {
    method: 'POST',
    credentials: 'include',
    headers: token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentIds,
      meetLink: meetLink.trim(),
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}
