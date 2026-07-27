import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Teachers from './components/Teachers'
import SpeakingClub from './components/SpeakingClub'
import ToeflSimulation from './components/ToeflSimulation'
import Testimonials from './components/Testimonials'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-svh bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Teachers />
        <SpeakingClub />
        <ToeflSimulation />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
