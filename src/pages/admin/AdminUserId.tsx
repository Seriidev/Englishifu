import { Link } from 'react-router-dom'

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
