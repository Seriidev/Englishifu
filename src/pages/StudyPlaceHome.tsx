import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { firstNameFromFullName } from '../utils/name'
import MeetInvitesBanner from '../components/study/MeetInvitesBanner'
import WelcomeBanner from '../components/study/home/WelcomeBanner'
import FullTestSimulationCard from '../components/study/home/FullTestSimulationCard'
import TestWeaknessCard from '../components/study/home/TestWeaknessCard'
import SkillResultsRow from '../components/study/home/SkillResultsRow'
import PracticeExercisesList from '../components/study/home/PracticeExercisesList'
import DashboardTutors from '../components/study/home/DashboardTutors'
import ToeflNewsCard from '../components/study/home/ToeflNewsCard'
import DashboardSpeakingClubs from '../components/study/home/DashboardSpeakingClubs'
import DashboardProgressCard from '../components/study/home/DashboardProgressCard'
import { mockSpeakingClubSessions } from '../mocks/speakingClubMock'
import {
  mockPracticeExercises,
  mockSkillResults,
  mockStudyStats,
  mockToeflNews,
  mockWelcomeSlides,
} from '../mocks/studyPlaceMock'
import { loadFullTestResult } from '../scoring/overallScoring'
import { buildTestAnalysis } from '../scoring/testAnalysis'
import {
  fetchPublicBanners,
  fetchPublicNews,
} from '../utils/adminPanelApi'
import { fetchApprovedTutors } from '../utils/platformApi'
import type { TutorListingCard } from '../types/tutorListing'

export default function StudyPlaceHome() {
  const { user } = useAuth()
  const studentId = user?.role === 'student' ? user.id : null
  const firstName = firstNameFromFullName(user?.fullName ?? 'Student')
  const [tutors, setTutors] = useState<TutorListingCard[]>([])
  const clubs = mockSpeakingClubSessions.slice(0, 3)
  const fullResult = useMemo(() => loadFullTestResult(), [])
  const analysis = useMemo(() => buildTestAnalysis(fullResult), [fullResult])
  const skillResults = fullResult
    ? [
        {
          id: 'reading',
          label: 'Reading',
          score: fullResult.reading.bandScore.toFixed(1),
        },
        {
          id: 'speaking',
          label: 'Speaking',
          score: fullResult.speaking.bandScore.toFixed(1),
        },
        {
          id: 'writing',
          label: 'Writing',
          score: fullResult.writing.bandScore.toFixed(1),
        },
        {
          id: 'listening',
          label: 'Listening',
          score: fullResult.listening.bandScore.toFixed(1),
        },
      ]
    : mockSkillResults

  const [bannerSlides, setBannerSlides] = useState(mockWelcomeSlides)
  const [newsItems, setNewsItems] = useState(
    mockToeflNews ? [mockToeflNews] : [],
  )

  useEffect(() => {
    void fetchApprovedTutors()
      .then((rows) => setTutors(rows.slice(0, 4)))
      .catch(() => setTutors([]))
    void fetchPublicBanners().then((banners) => {
      if (!banners.length) return
      setBannerSlides(
        banners.map((b) => ({
          id: String(b.id),
          title: b.title,
          body: b.subtitle || '',
          backgroundColor: b.background_color || undefined,
          imageUrl: b.image_url || undefined,
          ctaLabel: b.cta_label || undefined,
          ctaLink: b.cta_link || undefined,
        })),
      )
    })
    void fetchPublicNews().then((posts) => {
      if (!posts.length) return
      setNewsItems(
        posts.map((p) => ({
          id: String(p.id),
          title: p.title,
          excerpt: p.body.slice(0, 160),
          body: p.body,
          imageUrl: p.cover_image_url || undefined,
        })),
      )
    })
  }, [])

  return (
    <div className="space-y-6">
      {studentId ? <MeetInvitesBanner studentId={studentId} /> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18.5rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <WelcomeBanner firstName={firstName} slides={bannerSlides} />
          <FullTestSimulationCard />
          <SkillResultsRow results={skillResults} />
          <PracticeExercisesList items={mockPracticeExercises} />
        </div>

        <div className="space-y-5">
          <DashboardTutors tutors={tutors} />
          <ToeflNewsCard news={newsItems} />
          <DashboardSpeakingClubs sessions={clubs} />
          <DashboardProgressCard stats={mockStudyStats} />
          <TestWeaknessCard analysis={analysis} />
        </div>
      </div>
    </div>
  )
}
