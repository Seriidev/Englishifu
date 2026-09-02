import ClassesTab from '../../components/tutor-profile/ClassesTab'
import { useOwnTutorProfile } from '../../hooks/useOwnTutorProfile'

export default function TutorClassesPage() {
  const { profile, loading } = useOwnTutorProfile()

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>
  }

  const stats = profile?.classesStats ?? {
    totalStudents: 0,
    totalClasses: 0,
    speakingClubSessions: 0,
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Classes
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your teaching volume at a glance.
        </p>
      </div>
      <ClassesTab stats={stats} />
    </div>
  )
}
