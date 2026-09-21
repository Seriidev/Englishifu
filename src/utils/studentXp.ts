import { getApiToken } from './bookingApi'
import { XP_REWARDS } from './xpCalculation'
import type { LeaderboardEntry } from '../types/studyContent'

export const TUTOR_BOOST_XP = XP_REWARDS.tutorDailyBoost
const XP_EVENT = 'englishcore-student-xp'
const XP_CHANNEL = 'englishcore-student-xp-channel'

export type StudentXpStats = {
  xp: number
  boostCount: number
  boostedToday: boolean
  dailyBonusClaimedToday: boolean
  dailyBonusAwarded: number
}

function authHeaders(): HeadersInit {
  const token = getApiToken()
  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
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

export function notifyStudentXpChanged(studentId?: string) {
  const detail = { studentId: studentId ?? null }
  window.dispatchEvent(new CustomEvent(XP_EVENT, { detail }))
  try {
    const channel = new BroadcastChannel(XP_CHANNEL)
    channel.postMessage(detail)
    channel.close()
  } catch {
    /* private mode / unsupported */
  }
}

export function subscribeStudentXp(
  onChange: () => void,
  studentId?: string,
): () => void {
  const matches = (incoming?: string | null) =>
    !incoming || !studentId || incoming === studentId

  const onWindow = (event: Event) => {
    const id =
      event instanceof CustomEvent
        ? (event.detail as { studentId?: string | null } | undefined)?.studentId
        : null
    if (matches(id)) onChange()
  }
  window.addEventListener(XP_EVENT, onWindow)

  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel(XP_CHANNEL)
    channel.onmessage = (event: MessageEvent<{ studentId?: string | null }>) => {
      if (matches(event.data?.studentId)) onChange()
    }
  } catch {
    /* ignore */
  }

  return () => {
    window.removeEventListener(XP_EVENT, onWindow)
    channel?.close()
  }
}

export async function fetchStudentLeaderboard(): Promise<{
  entries: LeaderboardEntry[]
  total: number
}> {
  const res = await fetch('/api/students/leaderboard', {
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as {
    entries?: LeaderboardEntry[]
    total?: number
  }
  return {
    entries: Array.isArray(data.entries) ? data.entries : [],
    total: Number(data.total) || 0,
  }
}

export async function fetchStudentXpStats(opts?: {
  claim?: boolean
}): Promise<StudentXpStats> {
  const qs = opts?.claim ? '?claim=1' : ''
  const res = await fetch(`/api/students/xp${qs}`, {
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as {
    xp?: number
    boostCount?: number
    boostedToday?: boolean
    dailyBonusClaimedToday?: boolean
    dailyBonusAwarded?: number
  }
  return {
    xp: Number(data.xp) || 0,
    boostCount: Number(data.boostCount) || 0,
    boostedToday: Boolean(data.boostedToday),
    dailyBonusClaimedToday: Boolean(data.dailyBonusClaimedToday),
    dailyBonusAwarded: Number(data.dailyBonusAwarded) || 0,
  }
}

export async function sendStudentBoost(input: {
  studentId: string
}): Promise<{ xp: number; awarded: number }> {
  const res = await fetch('/api/student-boosts', {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      studentId: input.studentId,
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { xp: number; awarded: number }
  notifyStudentXpChanged(input.studentId)
  return data
}
