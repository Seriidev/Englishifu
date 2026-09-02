import type { TutorCertification, TutorStatus } from '../types/user'
import { getApiToken } from './bookingApi'

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

export interface PendingTutorRow {
  id: string
  handle: string
  full_name: string
  email: string
  avatar_url?: string | null
  position?: string | null
  years_of_experience?: number | null
  about_me?: string | null
  hourly_rate_usd?: number | null
  certifications?: TutorCertification[] | string | null
  resume_url?: string | null
  last_reason?: string | null
  last_decision?: string | null
  last_decision_at?: string | null
  status: string
  created_at?: string
  updated_at?: string
}

export async function adminLogin(password: string): Promise<void> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function adminLogout(): Promise<void> {
  await fetch('/api/admin/login', {
    method: 'DELETE',
    credentials: 'include',
  })
}

export async function checkAdminSession(): Promise<boolean> {
  const res = await fetch('/api/admin/login', {
    method: 'GET',
    credentials: 'include',
  })
  if (!res.ok) return false
  const data = (await res.json()) as { ok?: boolean }
  return Boolean(data.ok)
}

export async function fetchPendingTutors(
  status: 'pending' | 'rejected' | 'all' = 'pending',
): Promise<PendingTutorRow[]> {
  const res = await fetch(
    `/api/admin/pending-tutors?status=${encodeURIComponent(status)}`,
    { credentials: 'include' },
  )
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { tutors: PendingTutorRow[] }
  return data.tutors
}

export async function decideTutorApplication(
  tutorId: string,
  decision: 'approved' | 'rejected',
  reason?: string,
): Promise<void> {
  const res = await fetch(`/api/admin/tutors/${encodeURIComponent(tutorId)}/decision`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ decision, reason }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function submitTutorForReview(input: {
  position: string
  yearsOfExperience: number
  aboutMe: string
  certifications: TutorCertification[]
  avatarUrl?: string
  hourlyRateUsd?: number
}): Promise<void> {
  const res = await fetch('/api/tutors/submit-for-review', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function fetchTutorMe(): Promise<{
  id: string
  status: TutorStatus | string
} | null> {
  const res = await fetch('/api/tutors/me', { headers: authHeaders() })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { tutor: { id: string; status: string } }
  return data.tutor
}

export async function fetchTutorKpis(tutorId: string) {
  const res = await fetch(`/api/tutors/${encodeURIComponent(tutorId)}/kpi`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<{
    kpis: Array<{
      id: string
      label: string
      value: number
      unit?: string
      trend?: 'up' | 'down' | 'neutral'
    }>
    chart: {
      title: string
      primaryLabel: string
      secondaryLabel: string
      points: Array<{ date: string; primary: number; secondary: number }>
    }
  }>
}

export async function fetchTutorStudents(tutorId: string) {
  const res = await fetch(
    `/api/tutors/${encodeURIComponent(tutorId)}/students`,
    { headers: authHeaders() },
  )
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as {
    students: Array<{
      id: string
      fullName: string
      avatarUrl?: string
      handle: string
      cefrLevel?: string
      lessonsCompleted: number
      nextLessonDate?: string
      status: 'active' | 'paused'
      xp: number
      canDailyBoost: boolean
    }>
  }
  return data.students
}
