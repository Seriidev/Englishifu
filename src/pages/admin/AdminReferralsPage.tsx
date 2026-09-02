import { useEffect, useState } from 'react'
import { fetchAdminReferrals } from '../../utils/adminPanelApi'
import { StatusBadge } from '../../components/shared/StatusBadge'

export default function AdminReferralsPage() {
  const [status, setStatus] = useState('all')
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [stats, setStats] = useState({ total: 0, converted: 0, pending: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchAdminReferrals(status)
      .then((data) => {
        setRows(data.referrals)
        setStats(data.stats)
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load'),
      )
  }, [status])

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900">Referrals</h1>
      <p className="mt-1 text-sm text-slate-500">
        Rewards are XP + discount credits in the shared ledger — granted after
        the invited student completes a first lesson.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Total invites" value={stats.total} />
        <Stat label="Converted" value={stats.converted} />
        <Stat label="Pending" value={stats.pending} />
      </div>
      <div className="mt-4">
        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Referrer</th>
              <th className="px-4 py-3">Invited</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  {String(row.referrer_name || '')}
                  <span className="block text-xs text-slate-400">
                    {String(row.referrer_email || '')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {String(row.invited_name || row.invited_email || '—')}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {String(row.referral_code || '')}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={String(row.status || '')} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {row.created_at
                    ? new Date(String(row.created_at)).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No referrals yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
