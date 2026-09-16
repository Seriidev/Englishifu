import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import {
  createSpeakingClubRequest,
  ensureApiSession,
  fetchMySpeakingClubRequests,
  type SpeakingClubRequest,
} from '../../../utils/platformApi'

const TOPICS = [
  'Conversation',
  'TOEFL',
  'Business',
  'Travel',
  'Pronunciation',
  'Debate',
]

const LEVELS = ['All levels', 'A2', 'B1', 'B2', 'C1']

const fieldClass =
  'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

export default function RequestSpeakingClubForm() {
  const { user } = useAuth()
  const [topic, setTopic] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [levelTag, setLevelTag] = useState('All levels')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mine, setMine] = useState<SpeakingClubRequest[]>([])

  useEffect(() => {
    if (!user || user.role !== 'student') return
    void ensureApiSession(user)
      .then(() => fetchMySpeakingClubRequests())
      .then(setMine)
      .catch(() => setMine([]))
  }, [user])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== 'student') {
      setError('Sign in as a student to send a request.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await ensureApiSession(user)
      const created = await createSpeakingClubRequest({
        topic,
        preferredTime,
        levelTag,
        note,
      })
      setMine((prev) => [created, ...prev])
      setTopic('')
      setPreferredTime('')
      setNote('')
      setLevelTag('All levels')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">
        Request a speaking club
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        There are no scheduled clubs yet. Tell us the topic and time you want —
        we will set it up.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-3 space-y-2.5">
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Topic
            <input
              required
              minLength={2}
              maxLength={120}
              className={fieldClass}
              placeholder="e.g. Business English"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {TOPICS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTopic(tag)}
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  topic === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          Preferred time
          <input
            maxLength={120}
            className={fieldClass}
            placeholder="Weekday evenings, Sat 6 PM…"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          />
        </label>

        <label className="block text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          Level
          <select
            className={fieldClass}
            value={levelTag}
            onChange={(e) => setLevelTag(e.target.value)}
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          Details
          <textarea
            maxLength={500}
            className={`${fieldClass} min-h-20 resize-y`}
            placeholder="Anything else we should know?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? 'Sending…' : 'Send request'}
        </button>
      </form>

      {mine.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {mine.slice(0, 5).map((row) => (
            <li key={row.id} className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{row.topic}</span>
              {row.preferred_time ? (
                <span className="text-slate-400"> · {row.preferred_time}</span>
              ) : null}
              <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                {row.status}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
