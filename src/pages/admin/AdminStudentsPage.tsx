import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchAdminStudents,
  suspendAdminUser,
  type AdminStudentRow,
} from '../../utils/adminPanelApi'
import { AdminMessageLink, AdminUserId } from './AdminUserId'

export default function AdminStudentsPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('xp')
  const [rows, setRows] = useState<AdminStudentRow[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      setRows(await fetchAdminStudents({ q, sort }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  const chosen = useMemo(
    () => rows.filter((r) => selected[r.id]),
    [rows, selected],
  )

  const exportCsv = () => {
    const emails = chosen.map((r) => r.email).join('\n')
    const blob = new Blob([`email\n${emails}\n`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students-emails.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900">Students</h1>
      <p className="mt-1 text-sm text-slate-500">
        XP, streaks, and best saved TOEFL score. Select rows to export or
        message.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Search name / email / username / user ID"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
        >
          Search
        </button>
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="xp">Sort by XP</option>
          <option value="score">Sort by best score</option>
          <option value="streak">Sort by streak</option>
          <option value="name">Sort by name</option>
        </select>
        <button
          type="button"
          disabled={chosen.length === 0}
          onClick={exportCsv}
          className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 disabled:opacity-40"
        >
          Export selected emails as CSV
        </button>
        <button
          type="button"
          disabled={chosen.length === 0}
          onClick={() =>
            navigate('/admin/messages', {
              state: {
                userIds: chosen.map((r) => r.id),
                labels: chosen.map((r) => r.full_name),
              },
            })
          }
          className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Send message to selected
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const next: Record<string, boolean> = {}
                    if (e.target.checked) {
                      for (const r of rows) next[r.id] = true
                    }
                    setSelected(next)
                  }}
                />
              </th>
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Username</th>
              <th className="px-3 py-3">User ID</th>
              <th className="px-3 py-3">CEFR</th>
              <th className="px-3 py-3">XP</th>
              <th className="px-3 py-3">Streak</th>
              <th className="px-3 py-3">Best score</th>
              <th className="px-3 py-3">Account</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[row.id])}
                    onChange={(e) =>
                      setSelected((s) => ({ ...s, [row.id]: e.target.checked }))
                    }
                  />
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold">{row.full_name}</p>
                  <p className="text-xs text-slate-400">{row.email}</p>
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {row.handle ? `@${row.handle}` : '—'}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <AdminUserId id={row.id} />
                    <AdminMessageLink userId={row.id} label={row.full_name} />
                  </div>
                </td>
                <td className="px-3 py-3">{row.cefr_level || '—'}</td>
                <td className="px-3 py-3">{row.xp ?? 0}</td>
                <td className="px-3 py-3">{row.daily_streak ?? 0}</td>
                <td className="px-3 py-3">
                  {row.best_toefl_score != null
                    ? Number(row.best_toefl_score).toFixed(1)
                    : '—'}
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-700"
                    onClick={() => {
                      void suspendAdminUser(row.id, !row.is_suspended).then(load)
                    }}
                  >
                    {row.is_suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
