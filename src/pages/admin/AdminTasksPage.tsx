import { useCallback, useEffect, useState } from 'react'
import AssignmentBoard from '../../components/study/tasks/AssignmentBoard'
import type {
  AssignmentPriority,
  AssignmentRow,
} from '../../types/assignment'
import {
  createAdminTask,
  fetchAdminAssignments,
} from '../../utils/assignmentApi'
import { fetchAdminTutorsDirectory } from '../../utils/adminPanelApi'
import { adminBtn, adminInput, adminPageTitle } from './adminUi'

export default function AdminTasksPage() {
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [priority, setPriority] = useState<AssignmentPriority>('normal')
  const [tutorIds, setTutorIds] = useState<string[]>([])
  const [tutors, setTutors] = useState<Array<{ id: string; full_name: string }>>(
    [],
  )
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [assignments, directory] = await Promise.all([
        fetchAdminAssignments(),
        fetchAdminTutorsDirectory({}),
      ])
      setRows(assignments)
      setTutors(
        directory.map((t) => ({ id: String(t.id), full_name: String(t.full_name) })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = (id: string) => {
    setTutorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      await createAdminTask({
        title,
        description,
        dueAt: dueAt || undefined,
        priority,
        tutorIds,
      })
      setTitle('')
      setDescription('')
      setDueAt('')
      setPriority('normal')
      setTutorIds([])
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className={adminPageTitle}>Tasks</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Assign a task to teachers. They see it under Assigned to me.
      </p>

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <label className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Title
          <input
            className={`${adminInput} mt-1`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Due date
          <input
            type="date"
            className={`${adminInput} mt-1`}
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </label>
        <label className="sm:col-span-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Description
          <textarea
            className={`${adminInput} mt-1 min-h-20`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Priority
          <select
            className={`${adminInput} mt-1`}
            value={priority}
            onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <div className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Teachers
          <div className="mt-1 max-h-36 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 font-normal normal-case">
            {tutors.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 rounded px-1 py-1 text-sm text-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={tutorIds.includes(t.id)}
                  onChange={() => toggle(t.id)}
                />
                {t.full_name}
              </label>
            ))}
          </div>
        </div>
        {error ? (
          <p className="sm:col-span-2 text-sm text-red-600">{error}</p>
        ) : null}
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className={adminBtn}>
            {saving ? 'Sending…' : 'Send task'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <AssignmentBoard
          rows={rows}
          loading={loading}
          emptyHint="No admin tasks yet."
          personLabel="Assigned to"
          readOnly
        />
      </div>
    </div>
  )
}
