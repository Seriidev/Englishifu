import { useEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import {
  fetchAdminSentMessages,
  sendAdminMessage,
  type AdminSentMessage,
} from '../../utils/adminPanelApi'

interface LocationState {
  userIds?: string[]
  labels?: string[]
  userId?: string
}

function audienceLabel(row: AdminSentMessage): string {
  if (row.recipient_count <= 1) {
    const name = row.recipient_name || 'Unknown'
    const handle = row.recipient_handle ? `@${row.recipient_handle}` : ''
    const role = row.recipient_role ? ` · ${row.recipient_role}` : ''
    return [name, handle].filter(Boolean).join(' ') + role
  }
  if (row.student_count > 0 && row.tutor_count === 0) {
    return `${row.recipient_count} students`
  }
  if (row.tutor_count > 0 && row.student_count === 0) {
    return `${row.recipient_count} tutors`
  }
  return `${row.recipient_count} recipients`
}

export default function AdminSendMessagePage() {
  const location = useLocation()
  const prefill = (location.state || {}) as LocationState
  const prefillIds = prefill.userIds ?? []
  const prefillLabels = prefill.labels ?? []
  const prefillUserId = (prefill.userId || prefillIds[0] || '').trim()
  const [audience, setAudience] = useState<
    'by_user' | 'selected' | 'all_students' | 'all_tutors'
  >(prefillUserId && prefillIds.length <= 1 ? 'by_user' : prefillIds.length ? 'selected' : 'by_user')
  const [userId, setUserId] = useState(prefillUserId)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [linkPath, setLinkPath] = useState('')
  const [alsoEmail, setAlsoEmail] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<AdminSentMessage[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)

  const selectedLabel = !prefillIds.length
    ? 'No students pre-selected. Use User ID below, or pick people on Students / Tutors.'
    : `${prefillIds.length} selected (${prefillLabels.slice(0, 3).join(', ')}${
        prefillIds.length > 3 ? '…' : ''
      })`

  const loadSent = async () => {
    try {
      setListError(null)
      setSent(await fetchAdminSentMessages())
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load sent messages')
    }
  }

  useEffect(() => {
    void loadSent()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    setStatus(null)
    try {
      const result = await sendAdminMessage({
        audience,
        userId: audience === 'by_user' ? userId.trim() : undefined,
        userIds: audience === 'selected' ? prefillIds : [],
        title,
        message,
        linkPath: linkPath || undefined,
        alsoSendEmail: alsoEmail,
      })
      setStatus(
        `Sent in-app to ${result.sent}. Emails sent: ${result.emailed}. Skipped (no marketing consent or no Resend key): ${result.emailSkipped}.`,
      )
      setTitle('')
      setMessage('')
      await loadSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900">Send message</h1>
      <p className="mt-1 text-sm text-slate-500">
        In-app notifications always go out. Emails (Resend) only go to users
        who opted in to marketing mail, and include an unsubscribe link.
      </p>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <label className="block text-sm font-medium">
            Recipients
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={audience}
              onChange={(e) =>
                setAudience(e.target.value as typeof audience)
              }
            >
              <option value="by_user">One person (student or tutor)</option>
              <option value="selected">Selected from Students page</option>
              <option value="all_students">All students</option>
              <option value="all_tutors">All tutors</option>
            </select>
          </label>
          {audience === 'by_user' ? (
            <label className="block text-sm font-medium">
              User ID
              <input
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
                placeholder="User ID, @username, or email"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Copy the ID from Tutors or Students. Works for both students and
                teachers.
              </span>
            </label>
          ) : null}
          {audience === 'selected' ? (
            <p className="text-sm text-slate-500">{selectedLabel}</p>
          ) : null}
          <label className="block text-sm font-medium">
            Title
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Message
            <textarea
              required
              rows={6}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Optional link path
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="/study"
              value={linkPath}
              onChange={(e) => setLinkPath(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={alsoEmail}
              onChange={(e) => setAlsoEmail(e.target.checked)}
            />
            Also send as email (opted-in users only)
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Sent messages</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              In-app letters grouped by send. Newest first.
            </p>
          </div>
          {listError ? (
            <p className="px-5 py-3 text-sm text-amber-800">{listError}</p>
          ) : null}
          {sent.length === 0 && !listError ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              No letters yet. Send one from the form.
            </p>
          ) : (
            <ul className="max-h-[38rem] divide-y divide-slate-100 overflow-y-auto">
              {sent.map((row) => {
                const open = openId === row.id
                return (
                  <li key={`${row.id}-${row.sent_at}`}>
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left hover:bg-slate-50"
                      onClick={() => setOpenId(open ? null : row.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {row.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {row.sent_at
                            ? new Date(row.sent_at).toLocaleString()
                            : ''}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {audienceLabel(row)}
                      </p>
                      {!open ? (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {row.message}
                        </p>
                      ) : null}
                    </button>
                    {open ? (
                      <div className="space-y-2 px-5 pb-4 text-sm text-slate-700">
                        <p className="whitespace-pre-wrap">{row.message}</p>
                        {row.link_path ? (
                          <p className="font-mono text-xs text-slate-400">
                            Link: {row.link_path}
                          </p>
                        ) : null}
                        {row.recipient_count === 1 && row.recipient_id ? (
                          <p className="font-mono text-[11px] text-slate-400">
                            User ID: {row.recipient_id}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
