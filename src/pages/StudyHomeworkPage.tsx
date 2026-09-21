import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import AssignmentBoard from '../components/study/tasks/AssignmentBoard'
import type { AssignmentRow, AssignmentStatus } from '../types/assignment'
import {
  fetchAssignments,
  updateAssignmentStatus,
} from '../utils/assignmentApi'
import { syncApiSession } from '../utils/bookingApi'

export default function StudyHomeworkPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user || user.role !== 'student') return
    setLoading(true)
    setError(null)
    try {
      await syncApiSession(user)
      setRows(await fetchAssignments('inbox'))
    } catch (err) {
      setRows([])
      setError(err instanceof Error ? err.message : 'Failed to load homework')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      `${row.title} ${row.description} ${row.assignedBy}`
        .toLowerCase()
        .includes(q),
    )
  }, [rows, query])

  const onStatusChange = async (row: AssignmentRow, status: AssignmentStatus) => {
    try {
      if (user) await syncApiSession(user)
      await updateAssignmentStatus({ id: row.id, status })
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, status } : item)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Homework
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Work your teacher assigned to you.
        </p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search homework"
        className="w-full max-w-xs rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
      />
      {error ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <AssignmentBoard
        rows={visible}
        loading={loading}
        emptyHint="No homework yet. Your teacher will assign it here."
        personLabel="Assigned by"
        onStatusChange={(row, status) => void onStatusChange(row, status)}
      />
    </div>
  )
}
