import { useEffect, useRef, useState } from 'react'
import type { InterviewItem, ItemPhase } from '../types'
import { cancelPromptAudio, playPromptAudio } from '../hooks/playPromptAudio'
import {
  createDeadline,
  useDeadlineTimer,
  useOnDeadlineExpire,
} from '../hooks/useDeadlineTimer'
import type { AudioRecorderControls } from '../hooks/useAudioRecorder'
import CountdownRing from './CountdownRing'
import RecordingIndicator from './RecordingIndicator'

interface InterviewTaskProps {
  item: InterviewItem
  questionNumber: number
  totalQuestions: number
  recorder: AudioRecorderControls
  onComplete: (blob: Blob | null, durationMs: number) => void
}

export default function InterviewTask({
  item,
  questionNumber,
  totalQuestions,
  recorder,
  onComplete,
}: InterviewTaskProps) {
  const [phase, setPhase] = useState<ItemPhase>('idle')
  const [deadlineTs, setDeadlineTs] = useState<number | null>(null)
  const startedAtRef = useRef(0)
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
        await playPromptAudio(item.audioUrl, item.questionText)
      } catch {
        // keep flow moving
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
            Task 2 · Take an Interview
          </p>
          <p className="mt-0.5 text-sm font-medium text-ink">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>
        <RecordingIndicator active={phase === 'recording'} />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 sm:p-8">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-brand-light ring-4 ring-brand/20 sm:h-36 sm:w-36">
          {item.videoUrl ? (
            <video
              src={item.videoUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
              autoPlay
            />
          ) : (
            <div className="flex flex-col items-center text-brand">
              <span className="text-4xl font-bold">AI</span>
              <span className="mt-1 text-xs font-semibold tracking-wide uppercase">
                Interviewer
              </span>
            </div>
          )}
        </div>

        {/* Question text intentionally hidden during the live test */}

        <div className="flex flex-col items-center gap-3 text-center">
          {phase === 'playing-audio' && (
            <p className="text-sm font-medium text-muted">
              The interviewer is speaking…
            </p>
          )}
          {phase === 'recording' && (
            <>
              <CountdownRing
                progress={timer.progress}
                remainingMs={timer.remainingMs}
                isUrgent={timer.isUrgent}
                size={100}
              />
              <p className="max-w-md text-sm text-muted">
                Answer the question. You have {item.responseSeconds} seconds.
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
