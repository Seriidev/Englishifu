import { BookOpen, Mic, Users } from 'lucide-react'
import type { TutorClassesStats } from '../../types/tutorProfile'
import StatCard from '../profile/StatCard'

export default function ClassesTab({ stats }: { stats: TutorClassesStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard
        icon={Users}
        value={stats.totalStudents}
        label="Total Students"
      />
      <StatCard
        icon={BookOpen}
        value={stats.totalClasses}
        label="Total Classes"
      />
      <StatCard
        icon={Mic}
        value={stats.speakingClubSessions}
        label="Speaking Club Sessions"
      />
    </div>
  )
}
