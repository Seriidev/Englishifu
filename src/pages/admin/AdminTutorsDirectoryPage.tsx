import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminTutorsDirectory,
  patchAdminTutor,
  type AdminTutorDirRow,
} from '../../utils/adminPanelApi'
import { AdminMessageLink, AdminUserId } from './AdminUserId'
import { StatusBadge } from '../../components/shared/StatusBadge'

export default function AdminTutorsDirectoryPage() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('rating')
  const [rows, setRows] = useState<AdminTutorDirRow[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      setRows(
        await fetchAdminTutorsDirectory({
          q,
          city,
          minRating,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sort,
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900">Tutors</h1>
      <p className="mt-1 text-sm text-slate-500">
        Approved tutors for internal control. Pause an account without deleting
        data.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-6">
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
          placeholder="Search name / email / username / user ID"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Min $"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white"
        >
          Filter
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <label className="flex items-center gap-2">
          Min rating
          <select
            className="rounded-lg border border-slate-200 px-2 py-1"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value={0}>Any</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={4.5}>4.5+</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Sort
          <select
            className="rounded-lg border border-slate-200 px-2 py-1"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="rating">Rating</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Tutor</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Price/hr</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Fragment key={row.id}>
                <tr
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  onClick={() => setOpenId(openId === row.id ? null : row.id)}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{row.full_name}</p>
                    <p className="text-xs text-slate-400">{row.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.handle ? `@${row.handle}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <AdminUserId id={row.id} />
                  </td>
                  <td className="px-4 py-3">{row.city || '—'}</td>
                  <td className="px-4 py-3">
                    {Number(row.average_rating || 0).toFixed(1)} (
                    {row.reviews_count || 0})
                  </td>
                  <td className="px-4 py-3">
                    {row.price_per_hour != null ? `$${row.price_per_hour}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.is_suspended ? 'suspended' : row.status}
                    />
                  </td>
                </tr>
                {openId === row.id ? (
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminMessageLink
                          userId={row.id}
                          label={row.full_name || row.handle}
                          className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200"
                        />
                        <Link
                          to={`/tutor/profile/${row.handle}`}
                          className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200"
                        >
                          Open public profile
                        </Link>
                        <select
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          value={row.status}
                          onChange={(e) => {
                            void patchAdminTutor(row.id, {
                              status: e.target.value,
                            }).then(load)
                          }}
                        >
                          <option value="approved">approved</option>
                          <option value="pending">pending</option>
                          <option value="incomplete">incomplete</option>
                        </select>
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                          onClick={() => {
                            void patchAdminTutor(row.id, {
                              isSuspended: !row.is_suspended,
                            }).then(load)
                          }}
                        >
                          {row.is_suspended ? 'Unsuspend' : 'Suspend account'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
