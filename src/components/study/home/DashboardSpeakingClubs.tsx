import { Link } from 'react-router-dom'

export default function DashboardSpeakingClubs() {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">Speaking clubs</h2>
        <Link
          to="/study/speaking-club"
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          See all
        </Link>
      </div>
      <p className="mt-3 rounded-2xl border border-slate-100 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No speaking clubs yet.
      </p>
    </section>
  )
}
