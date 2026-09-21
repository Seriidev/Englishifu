import { getApiToken } from './bookingApi'
import type {
  AssignmentPriority,
  AssignmentRow,
  AssignmentStatus,
} from '../types/assignment'

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

export async function fetchAssignments(
  scope: 'inbox' | 'sent',
): Promise<AssignmentRow[]> {
  const res = await fetch(
    `/api/assignments?scope=${encodeURIComponent(scope)}`,
    { credentials: 'include', headers: authHeaders() },
  )
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { assignments?: AssignmentRow[] }
  return Array.isArray(data.assignments) ? data.assignments : []
}

export async function createHomework(input: {
  title: string
  description?: string
  dueAt?: string
  priority: AssignmentPriority
  studentIds: string[]
}): Promise<void> {
  const res = await fetch('/api/assignments', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function updateAssignmentStatus(input: {
  id: number
  status: AssignmentStatus
  assigneeId?: string
}): Promise<void> {
  const res = await fetch(`/api/assignments/${input.id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: authHeaders(),
    body: JSON.stringify({
      status: input.status,
      assigneeId: input.assigneeId,
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function fetchAdminAssignments(): Promise<AssignmentRow[]> {
  const res = await fetch('/api/admin/assignments', { credentials: 'include' })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { assignments?: AssignmentRow[] }
  return Array.isArray(data.assignments) ? data.assignments : []
}

export async function createAdminTask(input: {
  title: string
  description?: string
  dueAt?: string
  priority: AssignmentPriority
  tutorIds: string[]
}): Promise<void> {
  const res = await fetch('/api/admin/assignments', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
}
