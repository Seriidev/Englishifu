import { useNavigate } from 'react-router-dom'
import { Mic, Users } from 'lucide-react'
import ContinueSelfStudyCard from '../components/study/ContinueSelfStudyCard'
import QuickActionCard from '../components/study/QuickActionCard'
import UpcomingBookingsList from '../components/study/UpcomingBookingsList'
import StudyStatCard from '../components/study/StudyStatCard'
import {
  mockSelfStudyProgress,
  mockSpeakingAvatars,
  mockStudyStats,
  mockTutorAvatars,
  mockUpcomingBookings,
} from '../mocks/studyPlaceMock'

function TutorIllustration() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
      <Users className="h-6 w-6" aria-hidden />
    </div>
  )
}

function SpeakingIllustration() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
      <Mic className="h-6 w-6" aria-hidden />
    </div>
  )
}

const sparkColors: Record<string, string> = {
  words: '#8b5cf6',
  lessons: '#3b82f6',
  speaking: '#f97316',
  accuracy: '#10b981',
}

export default function StudyPlaceHome() {
  const navigate = useNavigate()
  const selfStudy = mockSelfStudyProgress

  return (
    <div className="space-y-6">
      <ContinueSelfStudyCard
        empty={!selfStudy}
        courseName={selfStudy?.courseName}
        unitLabel={selfStudy?.unitLabel}
        progressPercent={selfStudy?.progressPercent}
        estimatedMinutes={selfStudy?.estimatedMinutes}
        onContinue={() => navigate('/toefl')}
        onViewCourse={() => navigate('/toefl')}
        onBrowseCourses={() => navigate('/toefl')}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <QuickActionCard
          illustration={<TutorIllustration />}
          title="Find a Tutor"
          description="Book 1:1 lessons with certified teachers tailored to your goals."
          avatarStack={mockTutorAvatars}
          metaText="24 tutors available"
          metaColor="indigo"
          ctaLabel="Browse tutors"
          ctaPath="/study/tutors"
          accentBg="bg-indigo-50/50"
        />
        <QuickActionCard
          illustration={<SpeakingIllustration />}
          title="Speaking Club"
          description="Join live group sessions and practice real conversation."
          avatarStack={mockSpeakingAvatars}
          metaText="6 sessions this week"
          metaColor="orange"
          ctaLabel="View sessions"
          ctaPath="/study/speaking-club"
          accentBg="bg-orange-50/50"
        />
      </div>

      <UpcomingBookingsList bookings={mockUpcomingBookings} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {mockStudyStats.map((stat) => (
          <StudyStatCard
            key={stat.id}
            icon={stat.icon}
            iconBg={stat.iconBg}
            iconColor={stat.iconColor}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            trendPositive={stat.trendPositive}
            sparkline={stat.sparkline}
            sparkStroke={sparkColors[stat.id]}
          />
        ))}
      </div>
    </div>
  )
}
