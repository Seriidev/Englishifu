import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  createSpeakingClubSession,
  ensureApiSession,
} from '../../utils/platformApi'

const LEVELS = ['A2', 'B1', 'B2', 'C1', 'All levels']
const TOPICS = [
  'TOEFL',
  'Daily life',
  'Business',
  'Travel',
  'Debate',
  'Pronunciation',
]

interface CreateSpeakingClubSessionFormProps {
  onCreated: () => void
  defaultOpen?: boolean
}

export default function CreateSpeakingClubSessionForm({
  onCreated,
  defaultOpen = false,
}: CreateSpeakingClubSessionFormProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(defaultOpen)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [levelTag, setLevelTag] = useState('All levels')
  const [topicTags, setTopicTags] = useState<string[]>(['TOEFL'])
  const [startsAtLocal, setStartsAtLocal] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [maxParticipants, setMaxParticipants] = useState(8)
  const [meetingLink, setMeetingLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user || user.role !== 'tutor') return null

  const toggleTopic = (tag: string) => {
    setTopicTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await ensureApiSession(user)
      const startsAt = new Date(startsAtLocal).toISOString()
      await createSpeakingClubSession({
        title,
        description,
        topicTags,
        levelTag,
        startsAt,
        durationMinutes,
        maxParticipants,
        meetingLink,
      })
      setOpen(false)
      setTitle('')
      setDescription('')
      setMeetingLink('')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-indigo-900">Host a session</p>
          <p className="text-xs text-indigo-700/80">
            Add a Meet link once — students join and get the link instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {open ? 'Close' : 'Create session'}
        </button>
      </div>

      {open ? (
        <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-3">
          <input
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            placeholder="Session title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Starts at
              <input
                required
                type="datetime-local"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium normal-case text-slate-900"
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Level
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium normal-case text-slate-900"
                value={levelTag}
                onChange={(e) => setLevelTag(e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Duration (min)
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium normal-case text-slate-900"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                {[30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Max seats
              <input
                type="number"
                min={2}
                max={50}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium normal-case text-slate-900"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
              />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Topics</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TOPICS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTopic(tag)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    topicTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-xs font-semibold text-slate-500 uppercase">
            Meeting link
            <input
              required
              type="url"
              placeholder="https://meet.google.com/..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium normal-case text-slate-900"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Publish session'}
          </button>
        </form>
      ) : null}
    </div>
  )
}
