import type { PublicUser } from '../types/user'
import type {
  AvailableSlot,
  BookingRow,
  TutorAvailabilityRow,
} from '../types/booking'

const API_TOKEN_KEY = 'englishifu_api_token_v1'

export function getApiToken(): string | null {
  try {
    const token = localStorage.getItem(API_TOKEN_KEY)
    // Fat JWTs (old payload with avatar data URLs) caused HTTP 431.
    if (token && token.length > 2500) {
      localStorage.removeItem(API_TOKEN_KEY)
      return null
    }
    return token
  } catch {
    return null
  }
}

export function setApiToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem(API_TOKEN_KEY)
    else localStorage.setItem(API_TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export function clearApiToken() {
  setApiToken(null)
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    if (data?.error) return data.error
  } catch {
    /* ignore */
  }
  if (res.status === 431) {
    return 'Request failed (431). Clear this site’s cookies and sign in again — the old session cookie was too large.'
  }
  return `Request failed (${res.status})`
}

export async function syncApiSession(
  user: PublicUser,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: user.id,
        role: user.role,
        handle: user.handle,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
      }),
    })
    if (!res.ok) {
      clearApiToken()
      return { ok: false, error: await parseError(res) }
    }
    const data = (await res.json()) as { token: string }
    setApiToken(data.token)
    return { ok: true, token: data.token }
  } catch {
    clearApiToken()
    return {
      ok: false,
      error: 'Could not reach booking API. Deploy with Postgres or use vercel dev.',
    }
  }
}

function authHeaders(): HeadersInit {
  const token = getApiToken()
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

const cred: RequestCredentials = 'include'

export async function fetchAvailableSlots(
  handle: string,
  days = 14,
): Promise<{
  tutorId: string
  slots: AvailableSlot[]
  tutorName?: string
}> {
  const res = await fetch(
    `/api/tutors/${encodeURIComponent(handle)}/available-slots?days=${days}`,
    { credentials: cred },
  )
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<{
    tutorId: string
    slots: AvailableSlot[]
    tutorName?: string
  }>
}

export async function createBooking(input: {
  tutorId: string
  startAt: string
  endAt: string
  subject: string
}): Promise<BookingRow> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: authHeaders(),
    credentials: cred,
    body: JSON.stringify(input),
  })
  if (res.status === 409) {
    const err = new Error(await parseError(res)) as Error & { code?: string }
    err.code = 'CONFLICT'
    throw err
  }
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { booking: BookingRow }
  return data.booking
}

export async function fetchBookings(
  role: 'student' | 'tutor',
): Promise<BookingRow[]> {
  const res = await fetch(`/api/bookings?role=${role}`, {
    headers: authHeaders(),
    credentials: cred,
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { bookings: BookingRow[] }
  return data.bookings
}

export async function cancelBooking(id: number): Promise<BookingRow> {
  const res = await fetch(`/api/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: cred,
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { booking: BookingRow }
  return data.booking
}

export async function completeBooking(id: number): Promise<BookingRow> {
  const res = await fetch(`/api/bookings/${id}/complete`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: cred,
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { booking: BookingRow }
  return data.booking
}

export async function fetchTutorAvailability(): Promise<TutorAvailabilityRow[]> {
  const res = await fetch('/api/tutor-availability', {
    headers: authHeaders(),
    credentials: cred,
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { availability: TutorAvailabilityRow[] }
  return data.availability
}

export async function createTutorAvailability(input: {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDurationMinutes: number
  timezone?: string
}): Promise<TutorAvailabilityRow> {
  const res = await fetch('/api/tutor-availability', {
    method: 'POST',
    headers: authHeaders(),
    credentials: cred,
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { availability: TutorAvailabilityRow }
  return data.availability
}

export async function deleteTutorAvailability(id: number): Promise<void> {
  const res = await fetch(`/api/tutor-availability/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: cred,
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export function groupSlotsByDate(
  slots: AvailableSlot[],
): Record<string, AvailableSlot[]> {
  const map: Record<string, AvailableSlot[]> = {}
  for (const slot of slots) {
    const key = new Date(slot.startAt).toISOString().slice(0, 10)
    if (!map[key]) map[key] = []
    map[key].push(slot)
  }
  for (const key of Object.keys(map)) {
    map[key].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
  }
  return map
}

export function formatDateLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`)
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

export function formatTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatDateTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(start)
  const t0 = formatTimeLabel(startIso)
  const t1 = formatTimeLabel(endIso)
  return `${date} · ${t0} – ${t1}`
}
