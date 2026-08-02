import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
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
import StartAuth from './components/auth/StartAuth'
import RoleSelector from './components/auth/RoleSelector'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import StudentHomeRedirect from './routes/StudentHomeRedirect'
import TutorDashboardRedirect from './components/dashboard/TutorDashboardRedirect'
import CompleteProfileForm from './components/tutor/CompleteProfileForm'
import TutorProfilePage from './components/tutor-profile/TutorProfilePage'
import EditTutorProfileForm from './components/tutor-profile/EditTutorProfileForm'
import StudentProfilePage from './components/profile/StudentProfilePage'
import EditProfileForm from './components/profile/EditProfileForm'
import ProtectedRoute from './routes/ProtectedRoute'
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
  return <PlacementTestFlow onExit={() => navigate('/')} />
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
        <Route path="/start" element={<StartAuth />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<RoleSelector />} />
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
          path="/profile/edit"
          element={
            <ProtectedRoute requiredRole="student">
              <EditProfileForm />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:handle" element={<StudentProfilePage />} />
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
          element={
            <ProtectedRoute requiredRole="tutor">
              <EditTutorProfileForm />
            </ProtectedRoute>
          }
        />
        <Route path="/tutor/profile/:handle" element={<TutorProfilePage />} />
        <Route path="/tutors/:handle" element={<LegacyTutorProfileRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
