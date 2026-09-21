import { useEffect, useState } from 'react'
import ClassesTab from '../../components/tutor-profile/ClassesTab'
import { useOwnTutorProfile } from '../../hooks/useOwnTutorProfile'
import { fetchTutorProfileStats } from '../../utils/platformApi'
import { syncApiSession } from '../../utils/bookingApi'

export default function TutorClassesPage() {
  const { tutor, loading } = useOwnTutorProfile()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    speakingClubSessions: 0,
  })

  useEffect(() => {
    if (!tutor?.id) return
    let cancelled = false
    void (async () => {
      try {
        await syncApiSession(tutor)
        const data = await fetchTutorProfileStats(tutor.id)
        if (cancelled) return
        setStats({
          totalStudents: data.studentsCount,
          totalClasses: data.classesCount,
          speakingClubSessions: data.speakingClubSessions,
        })
      } catch {
        if (!cancelled) {
          setStats({
            totalStudents: 0,
            totalClasses: 0,
            speakingClubSessions: 0,
          })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tutor?.id])

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>
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
