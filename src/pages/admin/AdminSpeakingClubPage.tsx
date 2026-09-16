import { useEffect, useState } from 'react'
import {
  fetchAdminSpeakingClub,
  patchSpeakingClubRequestStatus,
} from '../../utils/adminPanelApi'
import { AdminMessageLink, AdminUserId } from './AdminUserId'

export default function AdminSpeakingClubPage() {
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([])
  const [requests, setRequests] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await fetchAdminSpeakingClub()
      setSessions(data.sessions)
      setRequests(data.requests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Speaking club
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Student requests plus live sessions created by tutors.
        </p>
      </div>
      {error ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">Student requests</h2>
        <div className="mt-3 space-y-3">
          {requests.map((row) => (
            <article
              key={String(row.id)}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {String(row.topic)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {String(row.student_name || 'Student')}
                    {row.student_handle ? ` · @${String(row.student_handle)}` : ''}
                    {row.student_email ? ` · ${String(row.student_email)}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {row.level_tag ? String(row.level_tag) : 'All levels'}
                    {row.preferred_time
                      ? ` · ${String(row.preferred_time)}`
                      : ''}
                  </p>
                  {row.note ? (
                    <p className="mt-2 text-sm text-slate-600">
                      {String(row.note)}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2">
                    <AdminUserId id={String(row.student_id || '')} />
                    {row.student_id ? (
                      <AdminMessageLink
                        userId={String(row.student_id)}
                        label={String(
                          row.student_name || row.student_handle || 'Student',
                        )}
                      />
                    ) : null}
                  </div>
                </div>
                <select
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={String(row.status || 'new')}
                  onChange={(e) => {
                    void patchSpeakingClubRequestStatus(
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
          {requests.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
              No student requests yet.
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">Live sessions</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Host</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Starts</th>
                <th className="px-4 py-3">Fill</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((row) => (
                <tr key={String(row.id)} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{String(row.title)}</p>
                    <p className="text-xs text-slate-400">
                      {String(row.level_tag || '')}
                    </p>
                  </td>
                  <td className="px-4 py-3">{String(row.host_name || '—')}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.host_handle ? `@${String(row.host_handle)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <AdminUserId id={String(row.host_user_id || '')} />
                      {row.host_user_id ? (
                        <AdminMessageLink
                          userId={String(row.host_user_id)}
                          label={String(
                            row.host_name || row.host_handle || 'Tutor',
                          )}
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.starts_at
                      ? new Date(String(row.starts_at)).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {String(row.spots_filled ?? 0)} /{' '}
                    {String(row.max_participants ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No sessions yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
