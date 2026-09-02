import { useEffect, useState } from 'react'
import { Video } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import CreateSpeakingClubSessionForm from '../../components/tutor-profile/CreateSpeakingClubSessionForm'
import type { TutorStudent } from '../../types/tutorStudent'
import { fetchTutorStudents } from '../../utils/adminApi'
import { syncApiSession } from '../../utils/bookingApi'
import { isValidMeetLink, sendMeetInviteToMany } from '../../utils/meetLinks'

export default function TutorCreateMeetingPage() {
  const { user } = useAuth()
  const tutor = user?.role === 'tutor' ? user : null
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [meetLink, setMeetLink] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [sent, setSent] = useState(false)
  const [clubCreated, setClubCreated] = useState(false)

  useEffect(() => {
    if (!tutor) {
      setStudents([])
      return
    }
    let cancelled = false
    void (async () => {
      try {
        await syncApiSession(tutor)
        const rows = await fetchTutorStudents(tutor.id)
        if (cancelled) return
        const mapped: TutorStudent[] = rows.map((r) => ({
          id: r.id,
          fullName: r.fullName,
          avatarUrl: r.avatarUrl,
          handle: r.handle,
          cefrLevel: r.cefrLevel as TutorStudent['cefrLevel'],
          xp: r.xp ?? 0,
          canDailyBoost: Boolean(r.canDailyBoost),
          lessonsCompleted: r.lessonsCompleted,
          nextLessonDate: r.nextLessonDate,
          status: r.status,
        }))
        setStudents(mapped)
        setSelectedIds(mapped.filter((s) => s.status === 'active').map((s) => s.id))
      } catch {
        if (!cancelled) setStudents([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tutor?.id])

  const linkOk = isValidMeetLink(meetLink)
  const canContinue = linkOk && selectedIds.length > 0
  const recipientsLabel =
    selectedIds.length === students.length
      ? 'all your students'
      : `${selectedIds.length} student${selectedIds.length === 1 ? '' : 's'}`

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const onSend = () => {
    if (!tutor) return
    sendMeetInviteToMany(tutor.id, tutor.fullName, selectedIds, meetLink.trim())
    setSent(true)
    setStep('create')
    setMeetLink('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Create meeting
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Start a Google Meet for your students or publish a speaking club session.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-bold text-slate-900">
          Google Meet
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Open a new Meet, paste the link, and send it to selected students.
        </p>

        {sent ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Meeting link sent.
          </p>
        ) : null}

        {step === 'create' ? (
          <>
            <a
              href="https://meet.google.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Video className="h-4 w-4" aria-hidden />
              Open Google Meet to create a session
            </a>

            <label
              htmlFor="tutor-meet-link"
              className="mt-4 block text-sm font-medium text-slate-800"
            >
              Paste the meeting link here
            </label>
            <input
              id="tutor-meet-link"
              value={meetLink}
              onChange={(e) => {
                setMeetLink(e.target.value)
                setSent(false)
              }}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
            />
            {meetLink && !linkOk ? (
              <p className="mt-1 text-xs text-red-500">
                This doesn&apos;t look like a valid Google Meet link
              </p>
            ) : null}

            {students.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-slate-800">
                  Send to
                </p>
                <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-slate-100 p-2">
                  {students.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                        className="rounded border-slate-300"
                      />
                      <span className="truncate text-slate-900">
                        {s.fullName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No students yet. Once you have bookings, you can send them a Meet link.
              </p>
            )}

            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep('confirm')}
              className="mt-4 w-full rounded-xl bg-indigo-500 py-2.5 font-medium text-white transition hover:bg-indigo-600 disabled:opacity-40"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-600">
              Send this meeting link to <strong>{recipientsLabel}</strong>?
            </p>
            <div className="mt-4 break-all rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-900">
              {meetLink.trim()}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('create')}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onSend}
                className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
              >
                Send link
              </button>
            </div>
          </>
        )}
      </section>

      <section>
        {clubCreated ? (
          <p className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Speaking club session published.
          </p>
        ) : null}
        <CreateSpeakingClubSessionForm
          defaultOpen
          onCreated={() => setClubCreated(true)}
        />
      </section>
    </div>
  )
}
