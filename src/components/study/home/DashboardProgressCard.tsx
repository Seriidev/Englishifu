import type { StudyStatData } from '../../../types/studyPlace'

interface DashboardProgressCardProps {
  stats: StudyStatData[]
}

export default function DashboardProgressCard({
  stats,
}: DashboardProgressCardProps) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <ul className="divide-y divide-slate-100">
        {stats.map((stat) => (
          <li key={stat.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {stat.label}
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
            <p
              className={`shrink-0 pt-0.5 text-xs font-medium ${
                stat.trendPositive
                  ? 'text-emerald-600'
                  : 'text-red-500'
              }`}
            >
              {stat.trend}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
