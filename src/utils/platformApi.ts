import type { TutorListingCard } from '../types/tutorListing'
import type { PublicUser } from '../types/user'
import type { AppNotification, TutorReviewsResponse } from '../types/notifications'
import type { SpeakingClubSession } from '../types/speakingClubSession'
import {
  clearApiToken,
  getApiToken,
  setApiToken,
} from './bookingApi'

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    if (data?.error) return data.error
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`
}

function authHeaders(): HeadersInit {
  const token = getApiToken()
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

export async function ensureApiSession(user: PublicUser) {
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
    throw new Error(await parseError(res))
  }
  const data = (await res.json()) as { token: string }
  setApiToken(data.token)
  return data.token
}

export async function fetchNotifications(): Promise<{
  notifications: AppNotification[]
  unreadCount: number
}> {
  const res = await fetch('/api/notifications', { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<{
    notifications: AppNotification[]
    unreadCount: number
  }>
}

export async function markNotificationsRead(
  notificationId?: number,
): Promise<void> {
  const res = await fetch('/api/notifications/mark-read', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(
      notificationId != null ? { notificationId } : {},
    ),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function fetchTutorReviews(
  handle: string,
): Promise<TutorReviewsResponse> {
  const res = await fetch(
    `/api/tutors/${encodeURIComponent(handle)}/reviews`,
  )
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<TutorReviewsResponse>
}

export async function fetchApprovedTutors(): Promise<TutorListingCard[]> {
  const res = await fetch('/api/tutors')
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { tutors?: TutorListingCard[] }
  return Array.isArray(data.tutors) ? data.tutors : []
}

export async function createReview(input: {
  bookingId?: number
  tutorHandle?: string
  rating: number
  comment?: string
}): Promise<void> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export interface ApiSpeakingClubSession {
  id: number
  host_tutor_id: string
  title: string
  description: string | null
  topic_tags: string[] | null
  level_tag: string | null
  starts_at: string
  duration_minutes: number
  max_participants: number
  meeting_link: string
  host_name?: string
  host_avatar?: string | null
  host_handle?: string
  spots_filled?: number
}

function dayGroupFor(startsAt: Date): SpeakingClubSession['dayGroup'] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)
  const endOfWeek = new Date(startOfToday)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  if (startsAt >= startOfToday && startsAt < startOfTomorrow) return 'today'
  if (
    startsAt >= startOfTomorrow &&
    startsAt < new Date(startOfTomorrow.getTime() + 86400000)
  ) {
    return 'tomorrow'
  }
  if (startsAt < endOfWeek) return 'this-week'
  return 'later'
}

export function mapApiSessionToUi(
  row: ApiSpeakingClubSession,
  savedIds: Set<string>,
): SpeakingClubSession {
  const starts = new Date(row.starts_at)
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
  }).format(starts)
  const dateSubtext = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(starts)
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(starts)

  return {
    id: String(row.id),
    dateLabel,
    dateSubtext,
    time,
    title: row.title,
    description: row.description ?? '',
    hostName: row.host_name ?? 'Host',
    hostAvatarUrl: row.host_avatar ?? undefined,
    topicTags: row.topic_tags ?? [],
    levelTag: row.level_tag ?? 'All levels',
    durationMinutes: Number(row.duration_minutes) || 60,
    spotsTotal: Number(row.max_participants) || 8,
    spotsFilled: Number(row.spots_filled) || 0,
    participantAvatars: [],
    meetingPlatform: 'google-meet',
    isSaved: savedIds.has(String(row.id)),
    dayGroup: dayGroupFor(starts),
  }
}

export async function fetchSpeakingClubSessions(): Promise<
  ApiSpeakingClubSession[]
> {
  const res = await fetch('/api/speaking-club/sessions')
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { sessions: ApiSpeakingClubSession[] }
  return data.sessions
}

export async function createSpeakingClubSession(input: {
  title: string
  description?: string
  topicTags: string[]
  levelTag: string
  startsAt: string
  durationMinutes: number
  maxParticipants: number
  meetingLink: string
}): Promise<ApiSpeakingClubSession> {
  const res = await fetch('/api/speaking-club/sessions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { session: ApiSpeakingClubSession }
  return data.session
}

export async function joinSpeakingClubSession(
  sessionId: string | number,
): Promise<{ meetingLink: string; alreadyJoined?: boolean }> {
  const res = await fetch(`/api/speaking-club/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<{ meetingLink: string; alreadyJoined?: boolean }>
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const sec = Math.round(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.round(hr / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}
