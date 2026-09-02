import { useEffect, useState, type FormEvent } from 'react'
import {
  fetchPendingTutors,
  type PendingTutorRow,
} from '../../utils/adminApi'
import TutorApplicationCard from '../../components/admin/TutorApplicationCard'

type StatusFilter = 'pending' | 'rejected' | 'all'

export default function AdminPendingTutorsPage() {
  const [filter, setFilter] = useState<StatusFilter>('pending')
  const [tutors, setTutors] = useState<PendingTutorRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (status: StatusFilter = filter) => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchPendingTutors(status)
      setTutors(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
      setTutors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const onFilter = (e: FormEvent<HTMLSelectElement>) => {
    setFilter((e.currentTarget.value || 'pending') as StatusFilter)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900">
            Tutor applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Approve, reject, and open submitted resumes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => void onFilter(e)}
          >
            <option value="pending">Pending</option>
            <option value="rejected">Rejected recently</option>
            <option value="all">All tutors</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        </div>
      ) : tutors.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No applications in this filter.
        </p>
      ) : (
        <div className="space-y-4">
          {tutors.map((tutor) => (
            <TutorApplicationCard
              key={tutor.id}
              tutor={tutor}
              onDecision={(id) =>
                setTutors((prev) => prev.filter((t) => t.id !== id))
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
