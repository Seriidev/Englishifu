import { useCallback, useMemo, useState } from 'react'
import type { ItemRecording, SpeakingSectionConfig, SpeakingTaskType } from '../types'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { calculateSpeakingScore } from '../speakingScoring'
import type { SectionScore } from '../../scoring/overallScoring'
import { useLanguage } from '../../i18n/LanguageContext'
import ListenAndRepeatTask from './ListenAndRepeatTask'
import InterviewTask from './InterviewTask'
import SpeakingIntro from './SpeakingIntro'
import TaskTransition from './TaskTransition'
import SpeakingResults from './SpeakingResults'

type FlowStage =
  | 'intro'
  | 'task1-brief'
  | 'listen-repeat'
  | 'task2-brief'
  | 'interview'
  | 'results'

interface SpeakingSectionProps {
  config: SpeakingSectionConfig
  onExit: () => void
  /** Full-test mode: skip self-rate UI and return a provisional mid-band score. */
  onComplete?: (score: SectionScore) => void
}

export default function SpeakingSection({
  config,
  onExit,
  onComplete,
}: SpeakingSectionProps) {
  const { t } = useLanguage()
  const recorder = useAudioRecorder()
  const [stage, setStage] = useState<FlowStage>('intro')
  const [lrIndex, setLrIndex] = useState(0)
  const [ivIndex, setIvIndex] = useState(0)
  const [recordings, setRecordings] = useState<ItemRecording[]>([])
  const [preparing, setPreparing] = useState(false)

  const totalQuestions =
    config.listenRepeatItems.length + config.interviewItems.length

  const currentQuestionNumber = useMemo(() => {
    if (stage === 'listen-repeat') return lrIndex + 1
    if (stage === 'interview') return config.listenRepeatItems.length + ivIndex + 1
    return 1
  }, [stage, lrIndex, ivIndex, config.listenRepeatItems.length])

  const pushRecording = useCallback(
    (
      itemId: string,
      taskType: SpeakingTaskType,
      blob: Blob | null,
      durationMs: number,
    ) => {
      setRecordings((prev) => [
        ...prev.filter((r) => r.itemId !== itemId),
        { itemId, taskType, blob, durationMs },
      ])
    },
    [],
  )

  const handleStart = async () => {
    setPreparing(true)
    const ok = await recorder.prepare()
    setPreparing(false)
    if (!ok) return
    setStage('task1-brief')
  }

  const handleLrComplete = (blob: Blob | null, durationMs: number) => {
    const item = config.listenRepeatItems[lrIndex]
    pushRecording(item.id, 'listen-and-repeat', blob, durationMs)

    if (lrIndex + 1 < config.listenRepeatItems.length) {
      setLrIndex((i) => i + 1)
    } else {
      setStage('task2-brief')
    }
  }

  const handleIvComplete = (blob: Blob | null, durationMs: number) => {
    const item = config.interviewItems[ivIndex]
    pushRecording(item.id, 'interview', blob, durationMs)

    if (ivIndex + 1 < config.interviewItems.length) {
      setIvIndex((i) => i + 1)
    } else {
      recorder.release()
      if (onComplete) {
        const itemCount =
          config.listenRepeatItems.length + config.interviewItems.length
        // Provisional MVP score for full-test flow (self-rate skipped).
        const scored = calculateSpeakingScore(Array(itemCount).fill(3))
        onComplete({ rawScore: scored.rawScore, bandScore: scored.bandScore })
      } else {
        setStage('results')
      }
    }
  }

  const restart = () => {
    recorder.release()
    setRecordings([])
    setLrIndex(0)
    setIvIndex(0)
    setStage('intro')
  }

  const handleExit = () => {
    const midTest =
      stage !== 'intro' && stage !== 'results'
    if (
      midTest &&
      !window.confirm('Leave the speaking section? Progress will be lost.')
    ) {
      return
    }
    recorder.release()
    onExit()
  }

  const showExitBar = stage !== 'intro' && stage !== 'results'

  return (
    <div className="flex min-h-svh flex-col bg-[#f7f9fc]">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col bg-white shadow-sm sm:my-6 sm:min-h-[640px] sm:rounded-3xl sm:border sm:border-gray-100">
        {showExitBar && (
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs font-bold tracking-wide text-brand uppercase">
                TOEFL Speaking
              </p>
              <p className="text-sm font-medium text-ink">
                {stage === 'listen-repeat' || stage === 'interview'
                  ? `Question ${currentQuestionNumber} / ${totalQuestions}`
                  : 'Instructions'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExit}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
            >
              {t('toefl.exit')}
            </button>
          </div>
        )}

        {stage === 'intro' && (
          <SpeakingIntro
            micError={recorder.error}
            preparing={preparing}
            onStart={() => void handleStart()}
            onBack={onExit}
          />
        )}

        {stage === 'task1-brief' && (
          <TaskTransition
            title="Task 1: Listen and Repeat"
            body="You will hear a sentence related to the image. Listen carefully — it plays only once. Then immediately repeat the sentence. There is no preparation time."
            onContinue={() => setStage('listen-repeat')}
          />
        )}

        {stage === 'listen-repeat' && (
          <ListenAndRepeatTask
            key={config.listenRepeatItems[lrIndex].id}
            item={config.listenRepeatItems[lrIndex]}
            questionNumber={currentQuestionNumber}
            totalQuestions={totalQuestions}
            recorder={recorder}
            onComplete={handleLrComplete}
          />
        )}

        {stage === 'task2-brief' && (
          <TaskTransition
            title="Task 2: Take an Interview"
            body="You have volunteered for a research study about reading habits. You will have a short interview with a researcher. Each response lasts 45 seconds. Recording starts as soon as the interviewer finishes speaking."
            onContinue={() => {
              setIvIndex(0)
              setStage('interview')
            }}
          />
        )}

        {stage === 'interview' && (
          <InterviewTask
            key={config.interviewItems[ivIndex].id}
            item={config.interviewItems[ivIndex]}
            questionNumber={currentQuestionNumber}
            totalQuestions={totalQuestions}
            recorder={recorder}
            onComplete={handleIvComplete}
          />
        )}

        {stage === 'results' && (
          <SpeakingResults
            config={config}
            recordings={recordings}
            onRestart={restart}
            onExit={onExit}
          />
        )}
      </div>
    </div>
  )
}
