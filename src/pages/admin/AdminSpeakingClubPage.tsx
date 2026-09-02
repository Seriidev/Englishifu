import { useEffect, useState } from 'react'
import { fetchAdminSpeakingClub } from '../../utils/adminPanelApi'
import { AdminMessageLink, AdminUserId } from './AdminUserId'

export default function AdminSpeakingClubPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchAdminSpeakingClub()
      .then(setRows)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load'),
      )
  }, [])

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900">
        Speaking club
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Read-only overview. Tutors create sessions from their workspace.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
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
            {rows.map((row) => (
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
                        label={String(row.host_name || row.host_handle || 'Tutor')}
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
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No sessions yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}
