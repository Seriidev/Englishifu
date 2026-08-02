import { ArrowDown, ArrowUp } from 'lucide-react'
import type { TutorKPI } from '../../types/tutorProfile'

export default function KPITab({ kpis }: { kpis: TutorKPI[] }) {
  if (kpis.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
        <p className="text-base font-semibold text-ink">No KPI data yet</p>
        <p className="mt-1 text-sm text-muted">
          Metrics will appear as you teach more lessons.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-muted">{kpi.label}</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-ink">
              {kpi.value}
              {kpi.unit ?? ''}
            </span>
            {kpi.trend === 'up' ? (
              <ArrowUp className="h-4 w-4 text-emerald-500" aria-hidden />
            ) : null}
            {kpi.trend === 'down' ? (
              <ArrowDown className="h-4 w-4 text-red-500" aria-hidden />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
