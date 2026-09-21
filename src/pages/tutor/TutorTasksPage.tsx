import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import AssignmentBoard from '../../components/study/tasks/AssignmentBoard'
import type {
  AssignmentPriority,
  AssignmentRow,
  AssignmentStatus,
} from '../../types/assignment'
import {
  createHomework,
  fetchAssignments,
  updateAssignmentStatus,
} from '../../utils/assignmentApi'
import { fetchTutorStudents } from '../../utils/adminApi'
import { syncApiSession } from '../../utils/bookingApi'

type Tab = 'inbox' | 'sent'

function currentMonthValue() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function TutorTasksPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('inbox')
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState(currentMonthValue)
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!user || user.role !== 'tutor') return
    setLoading(true)
    setError(null)
    try {
      await syncApiSession(user)
      setRows(await fetchAssignments(tab))
    } catch (err) {
      setRows([])
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [tab, user])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      const inMonth = !row.dueAt || row.dueAt.slice(0, 7) === month
      if (!inMonth) return false
      if (!q) return true
      return `${row.title} ${row.description} ${row.assignedBy} ${row.assignedTo}`
        .toLowerCase()
        .includes(q)
    })
  }, [rows, query, month])

  const onStatusChange = async (row: AssignmentRow, status: AssignmentStatus) => {
    try {
      if (user) await syncApiSession(user)
      await updateAssignmentStatus({
        id: row.id,
        status,
        assigneeId: tab === 'sent' ? row.assigneeId : undefined,
      })
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id && item.assigneeId === row.assigneeId
            ? { ...item, status }
            : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Tasks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Admin sends you tasks. You create homework for your students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
        >
          Create homework
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('inbox')}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              tab === 'inbox'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Assigned to me
          </button>
          <button
            type="button"
            onClick={() => setTab('sent')}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              tab === 'sent'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Assigned by me
          </button>
        </div>
        <div className="ml-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 sm:max-w-xs"
          />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      <AssignmentBoard
        rows={visible}
        loading={loading}
        emptyHint={
          tab === 'inbox'
            ? 'No tasks from admin yet.'
            : 'No homework yet. Create one for your students.'
        }
        personLabel={tab === 'sent' ? 'Assigned to' : 'Assigned by'}
        onStatusChange={(row, status) => void onStatusChange(row, status)}
      />

      {creating ? (
        <CreateHomeworkModal
          tutorId={user?.role === 'tutor' ? user.id : ''}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            if (tab === 'sent') void load()
            else setTab('sent')
          }}
        />
      ) : null}
    </div>
  )
}

function CreateHomeworkModal({
  tutorId,
  onClose,
  onCreated,
}: {
  tutorId: string
  onClose: () => void
  onCreated: () => void
}) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [priority, setPriority] = useState<AssignmentPriority>('normal')
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [students, setStudents] = useState<Array<{ id: string; fullName: string }>>(
    [],
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tutorId || !user) return
    void (async () => {
      try {
        await syncApiSession(user)
        const rows = await fetchTutorStudents(tutorId)
        setStudents(rows.map((r) => ({ id: r.id, fullName: r.fullName })))
        setStudentIds(rows.map((r) => r.id))
      } catch {
        setStudents([])
      }
    })()
  }, [tutorId, user])

  const toggle = (id: string) => {
    setStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      if (user) await syncApiSession(user)
      await createHomework({
        title,
        description,
        dueAt: dueAt || undefined,
        priority,
        studentIds,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900">Create homework</h3>
        <p className="mt-1 text-sm text-slate-500">
          Students will see this in Study Place → Homework.
        </p>
        <label className="mt-4 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Title
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Description
          <textarea
            className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Due date
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Priority
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as AssignmentPriority)
              }
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Students
        </p>
        <div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-2">
          {students.length === 0 ? (
            <p className="px-2 py-2 text-sm text-slate-400">
              No students on your list yet.
            </p>
          ) : (
            students.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={studentIds.includes(s.id)}
                  onChange={() => toggle(s.id)}
                />
                <span className="text-slate-900">{s.fullName}</span>
              </label>
            ))
          )}
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}
