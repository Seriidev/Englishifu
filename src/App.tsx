import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScrollToTopButton from './components/ScrollToTopButton'
import Hero from './components/Hero'
import PlacementTestCTA from './components/home/PlacementTestCTA'
import Features from './components/Features'
import Teachers from './components/Teachers'
import SpeakingClub from './components/SpeakingClub'
import ToeflSimulation from './components/ToeflSimulation'
import Testimonials from './components/Testimonials'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import Reveal from './components/Reveal'
import { SpeakingSection, mockSpeakingConfig } from './speaking'
import ToeflHub from './components/toefl/ToeflHub'
import FullTestOrchestrator from './components/toefl/FullTestOrchestrator'
import ResultsScreen from './components/toefl/ResultsScreen'
import ReadingSection from './components/reading/ReadingSection'
import ListeningSection from './components/listening/ListeningSection'
import ListeningLibrary from './components/listening/ListeningLibrary'
import ListeningPracticeRunner from './components/listening/ListeningPracticeRunner'
import WritingSection from './components/writing/WritingSection'
import PlacementTestFlow from './components/placement/PlacementTestFlow'
import RoleSelector from './components/auth/RoleSelector'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import StudentHomeRedirect from './routes/StudentHomeRedirect'
import TutorDashboardRedirect from './components/dashboard/TutorDashboardRedirect'
import CompleteProfileForm from './components/tutor/CompleteProfileForm'
import TutorProfilePage from './components/tutor-profile/TutorProfilePage'
import StudentProfilePage from './components/profile/StudentProfilePage'
import EditProfileForm from './components/profile/EditProfileForm'
import ProtectedRoute from './routes/ProtectedRoute'
import StudyPlaceLayout from './components/study/StudyPlaceLayout'
import StudyPlaceHome from './pages/StudyPlaceHome'
import StudyBadgesPage from './pages/StudyBadgesPage'
import StudyEssayPage from './pages/StudyEssayPage'
import StudyCertificatesPage from './pages/StudyCertificatesPage'
import FindTutorPage from './pages/FindTutorPage'
import StudyTutorDetailPage from './pages/StudyTutorDetailPage'
import SpeakingClubPage from './pages/SpeakingClubPage'
import StudySettingsPage from './pages/StudySettingsPage'
import StudyBookingsPage from './pages/StudyBookingsPage'
import StudyLevelTestPage from './pages/StudyLevelTestPage'
import StudyLeaderboardPage from './pages/StudyLeaderboardPage'
import StudyVocabularyPage from './pages/StudyVocabularyPage'
import StudyLibraryPage from './pages/StudyLibraryPage'
import LibraryReaderPage from './pages/LibraryReaderPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminPendingTutorsPage from './pages/admin/AdminPendingTutorsPage'
import AdminTutorsDirectoryPage from './pages/admin/AdminTutorsDirectoryPage'
import AdminStudentsPage from './pages/admin/AdminStudentsPage'
import AdminBannersPage from './pages/admin/AdminBannersPage'
import AdminBooksPage from './pages/admin/AdminBooksPage'
import AdminReferralsPage from './pages/admin/AdminReferralsPage'
import AdminNewsPage from './pages/admin/AdminNewsPage'
import AdminSpeakingClubPage from './pages/admin/AdminSpeakingClubPage'
import AdminConsultationRequestsPage from './pages/admin/AdminConsultationRequestsPage'
import AdminSendMessagePage from './pages/admin/AdminSendMessagePage'
import TutorWorkspaceLayout from './components/tutor/TutorWorkspaceLayout'
import TutorClassesPage from './pages/tutor/TutorClassesPage'
import TutorStudentsPage from './pages/tutor/TutorStudentsPage'
import TutorKpiPage from './pages/tutor/TutorKpiPage'
import TutorCertificatesPage from './pages/tutor/TutorCertificatesPage'
import TutorWorkspaceProfilePage from './pages/tutor/TutorWorkspaceProfilePage'
import TutorBookingsInbox from './pages/tutor/TutorBookingsInbox'
import TutorCreateMeetingPage from './pages/tutor/TutorCreateMeetingPage'
import { readingMockConfig } from './mocks/readingMock'
import { listeningMockConfig } from './mocks/listeningMock'
import { writingMockConfig } from './mocks/writingMock'

function LandingPage() {
  return (
    <div className="landing-shell min-h-svh">
      <Navbar />
      <main>
        <Reveal>
          <Hero />
        </Reveal>
        <Reveal delayMs={40}>
          <PlacementTestCTA />
        </Reveal>
        <Reveal delayMs={60}>
          <Features />
        </Reveal>
        <Reveal delayMs={80}>
          <Teachers />
        </Reveal>
        <Reveal delayMs={80}>
          <SpeakingClub />
        </Reveal>
        <Reveal delayMs={80}>
          <ToeflSimulation />
        </Reveal>
        <Reveal delayMs={80}>
          <Testimonials />
        </Reveal>
        <Reveal delayMs={80}>
          <ContactSection />
        </Reveal>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}

function SpeakingPage() {
  const navigate = useNavigate()
  return (
    <SpeakingSection
      config={mockSpeakingConfig}
      onExit={() => navigate('/toefl')}
    />
  )
}

function ReadingPage() {
  const navigate = useNavigate()
  return (
    <ReadingSection
      config={readingMockConfig}
      onExit={() => navigate('/toefl')}
    />
  )
}

function ListeningAdaptivePage() {
  const navigate = useNavigate()
  return (
    <ListeningSection
      config={listeningMockConfig}
      onExit={() => navigate('/listening')}
    />
  )
}

function WritingPage() {
  const navigate = useNavigate()
  return (
    <WritingSection
      config={writingMockConfig}
      onExit={() => navigate('/toefl')}
    />
  )
}

function PlacementPage() {
  const navigate = useNavigate()
  return (
    <PlacementTestFlow
      onExit={() => {
        navigate('/')
      }}
    />
  )
}

function SignupToStartRedirect() {
  const [params] = useSearchParams()
  const q = params.toString()
  return <Navigate to={q ? `/start?${q}` : '/start'} replace />
}

function LegacyTutorProfileRedirect() {
  const { handle = '' } = useParams()
  return <Navigate to={`/tutor/profile/${handle}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/placement" element={<PlacementPage />} />
        <Route path="/toefl" element={<ToeflHub />} />
        <Route path="/full-test" element={<FullTestOrchestrator />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/listening" element={<ListeningLibrary />} />
        <Route path="/listening/adaptive" element={<ListeningAdaptivePage />} />
        <Route
          path="/listening/practice/:practiceId"
          element={<ListeningPracticeRunner />}
        />
        <Route path="/speaking" element={<SpeakingPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/start" element={<RoleSelector />} />
        <Route path="/signup" element={<SignupToStartRedirect />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup/student" element={<SignupForm role="student" />} />
        <Route path="/signup/tutor" element={<SignupForm role="tutor" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentHomeRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute requiredRole="student">
              <StudyPlaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudyPlaceHome />} />
          <Route path="tutors" element={<FindTutorPage />} />
          <Route path="tutors/:handle" element={<StudyTutorDetailPage />} />
          <Route path="speaking-club" element={<SpeakingClubPage />} />
          <Route path="essay" element={<StudyEssayPage />} />
          <Route path="progress" element={<Navigate to="/study/essay" replace />} />
          <Route path="badges" element={<StudyBadgesPage />} />
          <Route path="certificates" element={<StudyCertificatesPage />} />
          <Route path="level-test" element={<StudyLevelTestPage />} />
          <Route path="leaderboard" element={<StudyLeaderboardPage />} />
          <Route path="vocabulary" element={<StudyVocabularyPage />} />
          <Route path="library" element={<StudyLibraryPage />} />
          <Route path="library/:bookId" element={<LibraryReaderPage />} />
          <Route path="bookings" element={<StudyBookingsPage />} />
          <Route path="settings" element={<StudySettingsPage />} />
        </Route>
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute requiredRole="student">
              <EditProfileForm />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:handle" element={<StudentProfilePage />} />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute requiredRole="tutor">
              <TutorWorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TutorClassesPage />} />
          <Route path="students" element={<TutorStudentsPage />} />
          <Route path="bookings" element={<TutorBookingsInbox />} />
          <Route path="kpi" element={<TutorKpiPage />} />
          <Route path="certificates" element={<TutorCertificatesPage />} />
          <Route path="library" element={<StudyLibraryPage />} />
          <Route path="library/:bookId" element={<LibraryReaderPage />} />
          <Route path="vocabulary" element={<StudyVocabularyPage />} />
          <Route path="create-meeting" element={<TutorCreateMeetingPage />} />
          <Route path="profile" element={<TutorWorkspaceProfilePage />} />
          <Route path="settings" element={<StudySettingsPage />} />
        </Route>
        <Route
          path="/tutor/dashboard"
          element={
            <ProtectedRoute requiredRole="tutor">
              <TutorDashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/complete-profile"
          element={
            <ProtectedRoute requiredRole="tutor">
              <CompleteProfileForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/profile/edit"
          element={<Navigate to="/tutor/profile" replace />}
        />
        <Route path="/tutor/profile/:handle" element={<TutorProfilePage />} />
        <Route path="/tutors/:handle" element={<LegacyTutorProfileRedirect />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="tutors" element={<AdminPendingTutorsPage />} />
          <Route path="tutors/directory" element={<AdminTutorsDirectoryPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="books" element={<AdminBooksPage />} />
          <Route path="referrals" element={<AdminReferralsPage />} />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="speaking-club" element={<AdminSpeakingClubPage />} />
          <Route path="requests" element={<AdminConsultationRequestsPage />} />
          <Route path="messages" element={<AdminSendMessagePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
