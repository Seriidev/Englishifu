import { Bookmark, Clock, User, Video } from 'lucide-react'
import type { SpeakingClubSession } from '../../../types/speakingClubSession'

export interface SessionRowProps {
  session: SpeakingClubSession
  onJoin: () => void
  onSave: () => void
  joining?: boolean
}

const TOPIC_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#f97316',
  '#10b981',
  '#3b82f6',
  '#ec4899',
]

function getAccentColorByTag(tag?: string): string {
  if (!tag) return TOPIC_COLORS[0]
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = (hash + tag.charCodeAt(i) * 17) % 97
  return TOPIC_COLORS[hash % TOPIC_COLORS.length]
}

export default function SessionRow({
  session,
  onJoin,
  onSave,
  joining = false,
}: SessionRowProps) {
  const spotsPercent = Math.min(
    100,
    (session.spotsFilled / session.spotsTotal) * 100,
  )
  const accentColor = getAccentColorByTag(session.topicTags[0])
  const isFull = session.spotsFilled >= session.spotsTotal
  const extra = Math.max(0, session.spotsFilled - 4)

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 py-4 last:border-0 lg:flex-row lg:items-center">
      <div className="w-24 shrink-0 text-left lg:text-center">
        <span className="text-xs font-semibold text-indigo-600 uppercase">
          {session.dateLabel}
        </span>
        <p className="text-xs text-slate-400">{session.dateSubtext}</p>
        <p className="mt-1 text-lg font-bold text-slate-900">{session.time}</p>
      </div>

      {session.hostAvatarUrl ? (
        <img
          src={session.hostAvatarUrl}
          alt=""
          className="hidden h-12 w-12 shrink-0 rounded-full object-cover sm:block"
        />
      ) : (
        <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 sm:flex">
          <User className="h-5 w-5" aria-hidden />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">{session.title}</h3>
        <p className="line-clamp-1 text-sm text-slate-500">
          {session.description}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {session.topicTags.map((tag) => (
            <span
              key={tag}
              className="pill-accent rounded-full px-2 py-0.5 text-xs"
            >
              {tag}
            </span>
          ))}
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">
            {session.levelTag}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" aria-hidden />
            {session.durationMinutes} min
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Hosted by {session.hostName}
        </p>
      </div>

      <div className="w-full shrink-0 sm:w-36">
        <div className="mb-1 flex -space-x-2">
          {session.participantAvatars.slice(0, 4).map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              className="h-6 w-6 rounded-full border-2 border-white object-cover"
            />
          ))}
          {extra > 0 ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-500">
              +{extra}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-slate-500">
          {session.spotsFilled} / {session.spotsTotal} seats filled
        </p>
        <div className="mt-1 h-1 w-full rounded-full bg-slate-100">
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${spotsPercent}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>

      <div className="shrink-0 text-center sm:min-w-[130px]">
        <span className="mb-1 flex items-center justify-center gap-1 text-xs text-slate-400">
          <Video className="h-3 w-3" aria-hidden />
          Google Meet
        </span>
        <button
          type="button"
          onClick={onJoin}
          disabled={isFull || joining}
          className={`w-full rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 ${
            isFull ? '' : 'bg-indigo-500'
          }`}
        >
          {isFull ? 'Full' : joining ? 'Joining…' : 'Join Session'}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="mt-1 inline-flex items-center justify-center gap-1 text-xs text-slate-400 transition hover:text-slate-600"
        >
          <Bookmark
            className={`h-3 w-3 ${session.isSaved ? 'fill-slate-400' : ''}`}
            aria-hidden
          />
          {session.isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}
