import { useState } from 'react'
import { Video, X } from 'lucide-react'
import type { TutorStudent } from '../../types/tutorStudent'
import { isValidMeetLink } from '../../utils/meetLinks'

interface CreateMeetModalProps {
  students: TutorStudent[]
  studentId?: string
  studentName?: string
  onSend: (meetLink: string, studentIds: string[]) => void
  onClose: () => void
}

export default function CreateMeetModal({
  students,
  studentId,
  studentName,
  onSend,
  onClose,
}: CreateMeetModalProps) {
  const [meetLink, setMeetLink] = useState('')
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    studentId ? [studentId] : students.filter((s) => s.status === 'active').map((s) => s.id),
  )

  const lockedToOne = Boolean(studentId)
  const linkOk = isValidMeetLink(meetLink)
  const canContinue = linkOk && (lockedToOne || selectedIds.length > 0)
  const recipientsLabel = lockedToOne
    ? studentName ?? 'this student'
    : selectedIds.length === students.length
      ? 'all your students'
      : `${selectedIds.length} student${selectedIds.length === 1 ? '' : 's'}`

  const toggleStudent = (id: string) => {
    if (lockedToOne) return
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-meet-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-gray-50 hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <h2
          id="create-meet-title"
          className="pr-8 text-lg font-bold tracking-tight text-ink"
        >
          Create Google Meet
        </h2>

        {step === 'create' ? (
          <>
            <p className="mt-2 text-sm text-slate-500">
              Click below to instantly create a new Google Meet session. Once
              created, copy the link from the new tab and paste it here.
            </p>

            <a
              href="https://meet.google.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 py-3 font-medium text-indigo-600 transition hover:bg-indigo-50"
            >
              <Video className="h-4 w-4" aria-hidden />
              Open Google Meet to create a session
            </a>

            <label
              htmlFor="meet-link-input"
              className="mt-4 block text-sm font-medium text-ink"
            >
              Paste the meeting link here
            </label>
            <input
              id="meet-link-input"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {meetLink && !linkOk ? (
              <p className="mt-1 text-xs text-red-500">
                This doesn&apos;t look like a valid Google Meet link
              </p>
            ) : null}

            {!lockedToOne && students.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-ink">Send to</p>
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
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="truncate text-ink">{s.fullName}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

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
            <p className="mt-2 text-sm text-slate-600">
              Send this meeting link to <strong>{recipientsLabel}</strong>?
            </p>
            <div className="mt-4 break-all rounded-lg bg-slate-50 p-3 font-mono text-sm text-ink">
              {meetLink.trim()}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('create')}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() =>
                  onSend(
                    meetLink.trim(),
                    lockedToOne && studentId ? [studentId] : selectedIds,
                  )
                }
                className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
              >
                Send Link
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
