import { useEffect, useState } from 'react'
import { Video } from 'lucide-react'
import {
  getMeetInvitesForStudent,
  markMeetInviteViewed,
  type MeetInvite,
} from '../../utils/meetLinks'

interface MeetInvitesBannerProps {
  studentId: string
}

export default function MeetInvitesBanner({ studentId }: MeetInvitesBannerProps) {
  const [invites, setInvites] = useState<MeetInvite[]>([])

  useEffect(() => {
    setInvites(getMeetInvitesForStudent(studentId))
  }, [studentId])

  if (invites.length === 0) return null

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-bold text-indigo-600">
        Google Meet invitations
      </h2>
      <ul className="mt-3 space-y-2">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="flex flex-col gap-2 rounded-xl border border-indigo-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Meet with {invite.tutorName}
              </p>
              <p className="text-xs text-slate-500">
                Sent {new Date(invite.createdAt).toLocaleString()}
              </p>
            </div>
            <a
              href={invite.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                markMeetInviteViewed(invite.id)
                setInvites(getMeetInvitesForStudent(studentId))
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
            >
              <Video className="h-4 w-4" aria-hidden />
              Join
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
