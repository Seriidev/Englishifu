import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReadingSection from '../reading/ReadingSection'
import ListeningSection from '../listening/ListeningSection'
import WritingSection from '../writing/WritingSection'
import { SpeakingSection, mockSpeakingConfig } from '../../speaking'
import { readingMockConfig } from '../../mocks/readingMock'
import { listeningMockConfig } from '../../mocks/listeningMock'
import { writingMockConfig } from '../../mocks/writingMock'
import {
  buildFullTestResult,
  FULL_TEST_ORDER,
  saveFullTestResult,
  type FullTestSection,
  type SectionScore,
} from '../../scoring/overallScoring'
import { registerToeflTryOnce } from '../../utils/toeflTryCounter'

type Phase = 'section' | 'transition' | 'break'

const SECTION_LABEL: Record<FullTestSection, string> = {
  reading: 'Reading',
  listening: 'Listening',
  speaking: 'Speaking',
  writing: 'Writing',
}

const TRANSITION_SECONDS = 5
const BREAK_SECONDS = 10

export default function FullTestOrchestrator() {
  const navigate = useNavigate()
  const [startedAt] = useState(() => Date.now())
  const [sectionIndex, setSectionIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('section')
  const [countdown, setCountdown] = useState(TRANSITION_SECONDS)
  const [sectionResults, setSectionResults] = useState<
    Partial<Record<FullTestSection, SectionScore>>
  >({})
  const resultsRef = useRef(sectionResults)
  resultsRef.current = sectionResults

  useEffect(() => {
    void registerToeflTryOnce()
  }, [])

  const currentSection = FULL_TEST_ORDER[sectionIndex]
  const nextSection = FULL_TEST_ORDER[sectionIndex + 1]

  const finishTest = useCallback(
    (results: Record<FullTestSection, SectionScore>) => {
      const full = buildFullTestResult(results, startedAt)
      saveFullTestResult(full)
      navigate('/results', { state: { result: full }, replace: true })
    },
    [navigate, startedAt],
  )

  const handleSectionComplete = useCallback(
    (score: SectionScore) => {
      const section = FULL_TEST_ORDER[sectionIndex]
      const nextResults = { ...resultsRef.current, [section]: score }
      resultsRef.current = nextResults
      setSectionResults(nextResults)

      if (sectionIndex >= FULL_TEST_ORDER.length - 1) {
        finishTest(nextResults as Record<FullTestSection, SectionScore>)
        return
      }

      if (section === 'listening') {
        setPhase('break')
        setCountdown(BREAK_SECONDS)
      } else {
        setPhase('transition')
        setCountdown(TRANSITION_SECONDS)
      }
    },
    [finishTest, sectionIndex],
  )

  const advanceFromInterstitial = useCallback(() => {
    setSectionIndex((i) => i + 1)
    setPhase('section')
  }, [])

  useEffect(() => {
    if (phase !== 'transition' && phase !== 'break') return

    if (countdown <= 0) {
      advanceFromInterstitial()
      return
    }

    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, countdown, advanceFromInterstitial])

  const exitToHub = () => {
    if (window.confirm('Leave the full test? Progress will be lost.')) {
      navigate('/toefl')
    }
  }

  const doneCount = Object.keys(sectionResults).length
  const progressLabel = `Section ${Math.min(sectionIndex + 1, 4)} of 4 · ${doneCount}/4 complete`

  if (phase === 'break' || phase === 'transition') {
    const title =
      phase === 'break' ? 'Optional short break' : 'Section complete'
    const body =
      phase === 'break'
        ? `Listening is done. Speaking starts in ${countdown} seconds…`
        : `${SECTION_LABEL[currentSection]} complete. Starting ${SECTION_LABEL[nextSection!]} in ${countdown} seconds…`

    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f7f9fc] px-6">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">
            Full Test
          </p>
          <h2 className="mt-3 text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-3 text-sm text-muted">{body}</p>
          <p className="mt-6 text-5xl font-bold tabular-nums text-brand">
            {countdown}
          </p>
          <button
            type="button"
            onClick={advanceFromInterstitial}
            className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Continue now
          </button>
          <p className="mt-4 text-xs text-muted">{progressLabel}</p>
        </div>
      </div>
    )
  }

  if (currentSection === 'reading') {
    return (
      <ReadingSection
        key="full-reading"
        config={readingMockConfig}
        onExit={exitToHub}
        onComplete={handleSectionComplete}
      />
    )
  }

  if (currentSection === 'listening') {
    return (
      <ListeningSection
        key="full-listening"
        config={listeningMockConfig}
        onExit={exitToHub}
        onComplete={handleSectionComplete}
      />
    )
  }

  if (currentSection === 'speaking') {
    return (
      <SpeakingSection
        key="full-speaking"
        config={mockSpeakingConfig}
        onExit={exitToHub}
        onComplete={handleSectionComplete}
      />
    )
  }

  return (
    <WritingSection
      key="full-writing"
      config={writingMockConfig}
      onExit={exitToHub}
      onComplete={handleSectionComplete}
    />
  )
}
