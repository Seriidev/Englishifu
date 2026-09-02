import { useState } from 'react'
import type { PendingTutorRow } from '../../utils/adminApi'
import { decideTutorApplication } from '../../utils/adminApi'
import type { TutorCertification } from '../../types/user'

interface TutorApplicationCardProps {
  tutor: PendingTutorRow
  onDecision: (tutorId: string) => void
}

function parseCerts(raw: PendingTutorRow['certifications']): TutorCertification[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as TutorCertification[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function TutorApplicationCard({
  tutor,
  onDecision,
}: TutorApplicationCardProps) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const certs = parseCerts(tutor.certifications)

  const run = async (decision: 'approved' | 'rejected') => {
    setBusy(true)
    setError(null)
    try {
      await decideTutorApplication(
        tutor.id,
        decision,
        decision === 'rejected' ? reason : undefined,
      )
      onDecision(tutor.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap gap-4">
        {tutor.avatar_url ? (
          <img
            src={tutor.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold text-indigo-600">
            {(tutor.full_name || '?').slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-900">{tutor.full_name}</h2>
          <p className="text-sm text-slate-500">
            @{tutor.handle} · {tutor.email}
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-600">
            {tutor.position || 'Teacher'}
            {typeof tutor.years_of_experience === 'number'
              ? ` · ${tutor.years_of_experience} yrs`
              : ''}
            {tutor.hourly_rate_usd != null
              ? ` · $${tutor.hourly_rate_usd}/hr`
              : ''}
          </p>
          {tutor.about_me ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {tutor.about_me}
            </p>
          ) : null}
        </div>
      </div>

      {certs.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Certifications
          </p>
          <ul className="mt-2 flex flex-wrap gap-3">
            {certs.map((c) => (
              <li
                key={c.id || c.name}
                className="w-28 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
              >
                {c.imageUrl ? (
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => setPreviewUrl(c.imageUrl!)}
                  >
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="flex h-20 items-center justify-center text-xs text-slate-400">
                    No image
                  </div>
                )}
                <p className="truncate px-2 py-1.5 text-[11px] font-medium text-slate-700">
                  {c.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tutor.resume_url ? (
        <div className="mt-4">
          <a
            href={tutor.resume_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            View resume
          </a>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {!rejectOpen ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run('approved')}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setRejectOpen(true)}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-2 rounded-xl border border-red-100 bg-red-50/50 p-3">
          <label className="block text-xs font-semibold text-red-800 uppercase">
            Rejection reason
            <textarea
              required
              className="mt-1 min-h-20 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-slate-900"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What should the tutor fix?"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !reason.trim()}
              onClick={() => void run('rejected')}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              Confirm reject
            </button>
            <button
              type="button"
              onClick={() => {
                setRejectOpen(false)
                setReason('')
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {previewUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close preview"
            onClick={() => setPreviewUrl(null)}
          />
          <img
            src={previewUrl}
            alt=""
            className="relative z-10 max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      ) : null}
    </article>
  )
}
