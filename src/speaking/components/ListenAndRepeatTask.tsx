import { useEffect, useRef, useState } from 'react'
import type { ListenRepeatItem } from '../types'
import type { ItemPhase } from '../types'
import { cancelPromptAudio, playPromptAudio } from '../hooks/playPromptAudio'
import {
  createDeadline,
  useDeadlineTimer,
  useOnDeadlineExpire,
} from '../hooks/useDeadlineTimer'
import type { AudioRecorderControls } from '../hooks/useAudioRecorder'
import CountdownRing from './CountdownRing'
import RecordingIndicator from './RecordingIndicator'
import ListeningIndicator from '../../components/shared/ListeningIndicator'
import PromptImage from '../../components/shared/PromptImage'

interface ListenAndRepeatTaskProps {
  item: ListenRepeatItem
  questionNumber: number
  totalQuestions: number
  recorder: AudioRecorderControls
  onComplete: (blob: Blob | null, durationMs: number) => void
}

export default function ListenAndRepeatTask({
  item,
  questionNumber,
  totalQuestions,
  recorder,
  onComplete,
}: ListenAndRepeatTaskProps) {
  const [phase, setPhase] = useState<ItemPhase>('idle')
  const [deadlineTs, setDeadlineTs] = useState<number | null>(null)
  const startedAtRef = useRef<number>(0)
  const finishingRef = useRef(false)
  const totalMs = item.responseSeconds * 1000

  const timer = useDeadlineTimer(deadlineTs, totalMs)

  useEffect(() => {
    finishingRef.current = false
    setPhase('idle')
    setDeadlineTs(null)

    let cancelled = false

    const run = async () => {
      setPhase('playing-audio')
      try {
        await playPromptAudio(item.audioUrl, item.transcript)
      } catch {
        // Continue even if audio fails — keep test moving
      }
      if (cancelled) return

      startedAtRef.current = Date.now()
      setDeadlineTs(createDeadline(item.responseSeconds))
      setPhase('recording')
      await recorder.start()
    }

    void run()

    return () => {
      cancelled = true
      cancelPromptAudio()
    }
    // Intentionally re-run only when item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  const finishRecording = async () => {
    if (finishingRef.current) return
    finishingRef.current = true
    setPhase('processing')
    const blob = await recorder.stop()
    const durationMs = Date.now() - startedAtRef.current
    setPhase('submitted')
    window.setTimeout(() => {
      onComplete(blob, durationMs)
    }, 1200)
  }

  useOnDeadlineExpire(deadlineTs, () => {
    if (phase === 'recording') void finishRecording()
  })

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand uppercase">
            Task 1 · Listen and Repeat
          </p>
          <p className="mt-0.5 text-sm font-medium text-ink">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>
        <RecordingIndicator active={phase === 'recording'} />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 sm:p-8">
        {item.visualUrl && (
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
            <PromptImage
              src={item.visualUrl}
              alt="Visual prompt context"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        )}

        {/* Intentionally NO transcript / subtitles during the test */}

        <div className="flex w-full flex-col items-center gap-3 text-center">
          {phase === 'playing-audio' && (
            <ListeningIndicator subtitle="Listen carefully — the audio plays only once." />
          )}
          {phase === 'recording' && (
            <>
              <CountdownRing
                progress={timer.progress}
                remainingMs={timer.remainingMs}
                isUrgent={timer.isUrgent}
              />
              <p className="text-sm text-muted">
                Repeat what you heard. Speak clearly into the microphone.
              </p>
            </>
          )}
          {(phase === 'processing' || phase === 'submitted') && (
            <p className="text-sm font-medium text-brand">Processing…</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
