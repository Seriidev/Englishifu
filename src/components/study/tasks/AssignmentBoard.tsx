import { useMemo, useState } from 'react'
import type {
  AssignmentPriority,
  AssignmentRow,
  AssignmentStatus,
} from '../../../types/assignment'

const GROUPS: {
  id: AssignmentStatus
  label: string
  bar: string
}[] = [
  { id: 'todo', label: 'To Do', bar: 'task-bar task-bar-todo' },
  { id: 'in_progress', label: 'In Progress', bar: 'task-bar task-bar-progress' },
  { id: 'completed', label: 'Completed', bar: 'task-bar task-bar-done' },
]

function formatDue(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusLabel(status: AssignmentStatus) {
  if (status === 'in_progress') return 'In Progress'
  if (status === 'completed') return 'Completed'
  return 'To Do'
}

function PriorityBadge({ value }: { value: AssignmentPriority }) {
  if (value === 'urgent') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
        <span aria-hidden>🚩</span>
        Urgent
      </span>
    )
  }
  if (value === 'low') {
    return (
      <span className="text-xs font-medium text-slate-400">Low</span>
    )
  }
  return <span className="text-xs font-medium text-slate-500">Normal</span>
}

interface AssignmentBoardProps {
  rows: AssignmentRow[]
  loading?: boolean
  emptyHint: string
  personLabel: 'Assigned by' | 'Assigned to'
  readOnly?: boolean
  onStatusChange?: (row: AssignmentRow, status: AssignmentStatus) => void
}

export default function AssignmentBoard({
  rows,
  loading,
  emptyHint,
  personLabel,
  readOnly,
  onStatusChange,
}: AssignmentBoardProps) {
  const [open, setOpen] = useState<Record<AssignmentStatus, boolean>>({
    todo: true,
    in_progress: true,
    completed: true,
  })

  const grouped = useMemo(() => {
    const map: Record<AssignmentStatus, AssignmentRow[]> = {
      todo: [],
      in_progress: [],
      completed: [],
    }
    for (const row of rows) {
      const key = GROUPS.some((g) => g.id === row.status)
        ? row.status
        : 'todo'
      map[key].push(row)
    }
    return map
  }, [rows])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-slate-500">
        {emptyHint}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {GROUPS.map((group) => {
        const items = grouped[group.id]
        const expanded = open[group.id]
        return (
          <section key={group.id} className="overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() =>
                setOpen((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
              }
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold ${group.bar}`}
            >
              <span className="inline-block text-xs">{expanded ? '▾' : '▸'}</span>
              {group.label}
              <span className="task-bar-count text-xs font-bold">
                {items.length}
              </span>
            </button>
            {expanded ? (
              <div className="bg-white">
                <div
                  className={`hidden gap-3 px-4 py-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase sm:grid ${
                    readOnly
                      ? 'grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1.4fr)_7.5rem_5.5rem_minmax(7rem,1fr)]'
                      : 'grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1.4fr)_7.5rem_5.5rem_minmax(7rem,1fr)_7rem]'
                  }`}
                >
                  <span>Name</span>
                  <span>Description</span>
                  <span>Due date</span>
                  <span>Priority</span>
                  <span>{personLabel}</span>
                  {readOnly ? null : <span>Status</span>}
                </div>
                {items.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-slate-400">None yet.</p>
                ) : (
                  items.map((row) => (
                    <div
                      key={`${row.id}-${row.assigneeId}`}
                      className={`grid gap-2 border-t border-slate-100 px-4 py-3 sm:items-center sm:gap-3 ${
                        readOnly
                          ? 'sm:grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1.4fr)_7.5rem_5.5rem_minmax(7rem,1fr)]'
                          : 'sm:grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1.4fr)_7.5rem_5.5rem_minmax(7rem,1fr)_7rem]'
                      }`}
                    >
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {row.title}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {row.description || '—'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDue(row.dueAt)}
                      </p>
                      <PriorityBadge value={row.priority} />
                      <p className="truncate text-sm text-slate-600">
                        {personLabel === 'Assigned to'
                          ? row.assignedTo
                          : row.assignedBy}
                      </p>
                      {readOnly ? (
                        <span className="sr-only">{statusLabel(row.status)}</span>
                      ) : (
                        <select
                          value={row.status}
                          onChange={(e) =>
                            onStatusChange?.(
                              row,
                              e.target.value as AssignmentStatus,
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
