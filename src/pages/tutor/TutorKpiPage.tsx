import KPITab from '../../components/tutor-profile/KPITab'
import { useOwnTutorProfile } from '../../hooks/useOwnTutorProfile'

export default function TutorKpiPage() {
  const { tutor, profile, loading } = useOwnTutorProfile()
  const tutorId = tutor?.id ?? profile?.id ?? ''

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          KPI
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Satisfaction, lessons, and booking trends.
        </p>
      </div>
      {tutorId ? (
        <KPITab
          tutorId={tutorId}
          fallbackKpis={profile?.kpis}
          fallbackChart={profile?.kpiChart}
        />
      ) : (
        <p className="text-sm text-slate-500">Sign in as a tutor to see KPI.</p>
      )}
    </div>
  )
}
