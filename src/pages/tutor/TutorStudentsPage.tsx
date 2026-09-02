import StudentsTab from '../../components/tutor-profile/StudentsTab'
import { useOwnTutorProfile } from '../../hooks/useOwnTutorProfile'

export default function TutorStudentsPage() {
  const { tutor, profile, loading } = useOwnTutorProfile()
  const tutorId = tutor?.id ?? profile?.id ?? ''

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Students
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Boost a student once a day (+30 XP). They also get +30 XP after each
          completed lesson.
        </p>
      </div>
      {tutorId ? (
        <StudentsTab tutorId={tutorId} />
      ) : (
        <p className="text-sm text-slate-500">Sign in as a tutor to see students.</p>
      )}
    </div>
  )
}
