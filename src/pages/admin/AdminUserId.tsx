import { Link } from 'react-router-dom'

export function AdminAvatar({
  src,
  name,
}: {
  src?: string | null
  name?: string | null
}) {
  const initial = (name || '?').trim().slice(0, 1).toUpperCase()
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
      {initial}
    </span>
  )
}

export function AdminUserId({ id }: { id: string | null | undefined }) {
  const value = (id ?? '').trim()
  if (!value) return <span className="text-zinc-400">—</span>
  return (
    <button
      type="button"
      className="font-mono text-[11px] text-zinc-500 hover:text-zinc-900"
      title={`${value} — click to copy`}
      onClick={(e) => {
        e.stopPropagation()
        void navigator.clipboard.writeText(value)
      }}
    >
      {value.slice(0, 8)}…
    </button>
  )
}

export function AdminMessageLink({
  userId,
  label,
  className = 'text-xs font-semibold text-indigo-700 hover:underline',
}: {
  userId: string
  label: string
  className?: string
}) {
  return (
    <Link
      to="/admin/messages"
      state={{ userId, userIds: [userId], labels: [label] }}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      Message
    </Link>
  )
}
