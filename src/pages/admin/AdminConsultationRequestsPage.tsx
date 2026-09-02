import { useEffect, useState } from 'react'
import {
  fetchAdminConsultations,
  patchConsultationStatus,
} from '../../utils/adminPanelApi'

export default function AdminConsultationRequestsPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setRows(await fetchAdminConsultations())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900">
        Requests
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Submissions from the landing page form.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <article
            key={String(row.id)}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {String(row.full_name)}
                </p>
                <p className="text-sm text-slate-500">
                  {String(row.email)} · {String(row.phone)}
                </p>
                <p className="mt-1 text-sm">
                  Goal: {String(row.learning_goal)}
                  {row.toefl_score ? ` · Score ${String(row.toefl_score)}` : ''}
                </p>
                {row.message ? (
                  <p className="mt-2 text-sm text-slate-600">
                    {String(row.message)}
                  </p>
                ) : null}
              </div>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={String(row.status || 'new')}
                onChange={(e) => {
                  void patchConsultationStatus(
                    Number(row.id),
                    e.target.value,
                  ).then(load)
                }}
              >
                <option value="new">new</option>
                <option value="contacted">contacted</option>
                <option value="closed">closed</option>
              </select>
            </div>
          </article>
        ))}
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No requests yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}
