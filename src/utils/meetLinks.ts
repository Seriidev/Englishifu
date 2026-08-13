export interface MeetInvite {
  id: string
  tutorId: string
  tutorName: string
  studentId: string
  meetLink: string
  createdAt: string
  status: 'sent' | 'viewed'
}

const MEET_INVITES_KEY = 'englishcore_meet_invites_v1'

function getMeetInvites(): MeetInvite[] {
  try {
    const raw = localStorage.getItem(MEET_INVITES_KEY)
    return raw ? (JSON.parse(raw) as MeetInvite[]) : []
  } catch {
    return []
  }
}

function saveMeetInvites(invites: MeetInvite[]): void {
  localStorage.setItem(MEET_INVITES_KEY, JSON.stringify(invites))
}

export function isValidMeetLink(url: string): boolean {
  return /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(url.trim())
}

export function sendMeetInvite(
  tutorId: string,
  tutorName: string,
  studentId: string,
  meetLink: string,
): MeetInvite {
  const invite: MeetInvite = {
    id: crypto.randomUUID(),
    tutorId,
    tutorName,
    studentId,
    meetLink: meetLink.trim(),
    createdAt: new Date().toISOString(),
    status: 'sent',
  }
  const invites = getMeetInvites()
  invites.push(invite)
  saveMeetInvites(invites)
  return invite
}

export function sendMeetInviteToMany(
  tutorId: string,
  tutorName: string,
  studentIds: string[],
  meetLink: string,
): void {
  for (const studentId of studentIds) {
    sendMeetInvite(tutorId, tutorName, studentId, meetLink)
  }
}

export function getMeetInvitesForStudent(studentId: string): MeetInvite[] {
  return getMeetInvites()
    .filter((i) => i.studentId === studentId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
}

export function markMeetInviteViewed(inviteId: string): void {
  const invites = getMeetInvites()
  const next = invites.map((i) =>
    i.id === inviteId ? { ...i, status: 'viewed' as const } : i,
  )
  saveMeetInvites(next)
}
