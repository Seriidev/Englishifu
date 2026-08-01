import { Mic } from 'lucide-react'
import {
  getMicrophoneAvailabilityStatus,
  microphoneAvailabilityMessage,
} from '../hooks/useAudioRecorder'
import LangSwitcher from '../../components/shared/LangSwitcher'
import { useLanguage } from '../../i18n/LanguageContext'

interface SpeakingIntroProps {
  micError: string | null
  preparing: boolean
  onStart: () => void
  onBack: () => void
}

export default function SpeakingIntro({
  micError,
  preparing,
  onStart,
  onBack,
}: SpeakingIntroProps) {
  const { t } = useLanguage()
  const micStatus = getMicrophoneAvailabilityStatus()
  const proactiveError = microphoneAvailabilityMessage(micStatus)
  const shownError = micError ?? proactiveError
  const micBlocked = micStatus !== 'available'

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
        >
          {t('toefl.exit')}
        </button>
        <LangSwitcher />
      </div>
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <Mic className="h-8 w-8" aria-hidden />
      </span>
      <p className="mt-4 text-xs font-medium text-brand">
        {t('toefl.questionsInEnglish')}
      </p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        TOEFL Speaking Simulator
      </h1>
      <p className="mt-2 text-sm font-semibold text-brand">New 2026 Format</p>
      <p className="mt-4 text-base leading-relaxed text-muted">
        This practice follows the current TOEFL iBT Speaking section: Task 1
        Listen and Repeat (7 prompts) and Task 2 Take an Interview (4
        questions). About 8 minutes total. No pause, replay, or skip.
      </p>

      <ul className="mt-6 w-full space-y-2 rounded-2xl bg-brand-light/50 p-5 text-left text-sm text-ink">
        <li>• Microphone access is required before you begin</li>
        <li>• Each prompt is played once — then recording starts immediately</li>
        <li>• Prep time is 0 seconds (same as the real test)</li>
        <li>• Scoring MVP: self-rate each response after the section</li>
      </ul>

      {shownError && (
        <p className="mt-4 text-sm font-medium text-red-600">{shownError}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          disabled={preparing || micBlocked}
          onClick={onStart}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-60"
        >
          {preparing ? 'Requesting microphone…' : 'Begin Speaking Section'}
        </button>
      </div>
    </div>
  )
}
