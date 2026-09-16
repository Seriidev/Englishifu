import { useEffect, useMemo, useRef, useState } from 'react'
import type { ListeningPlayable, ListeningQuestion } from './types'
import {
  cancelAudio,
  contextForItem,
  playAudio,
  transcriptForItem,
} from './playAudio'
import ListeningIndicator from '../shared/ListeningIndicator'
import { useLanguage } from '../../i18n/LanguageContext'

interface ListeningTaskViewProps {
  playable: ListeningPlayable
  questions: ListeningQuestion[]
  onContinue: (correct: number, total: number) => void
}

type Phase = 'playing' | 'questions'

export default function ListeningTaskView({
  playable,
  questions,
  onContinue,
}: ListeningTaskViewProps) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState<Phase>('playing')
  const [needsGesture, setNeedsGesture] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const playableRef = useRef(playable)
  playableRef.current = playable
  const clickAbortRef = useRef<AbortController | null>(null)

  const context = contextForItem(playable)
  const transcript = useMemo(() => transcriptForItem(playable), [playable])
  const question = questions[questionIndex]
  const lastQuestion = questionIndex >= questions.length - 1
  const allDone = phase === 'questions' && answered && lastQuestion

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    setPhase('playing')
    setNeedsGesture(false)
    setQuestionIndex(0)
    setSelected(null)
    setAnswered(false)
    setCorrectCount(0)
    setShowTranscript(false)

    const run = async () => {
      try {
        await playAudio(playableRef.current, controller.signal)
        if (!cancelled) setPhase('questions')
      } catch {
        if (controller.signal.aborted || cancelled) return
        setNeedsGesture(true)
      }
    }
    void run()

    return () => {
      cancelled = true
      controller.abort()
      clickAbortRef.current?.abort()
      cancelAudio()
    }
  }, [playable.kind, playable.item.id])

  const startFromClick = () => {
    setNeedsGesture(false)
    clickAbortRef.current?.abort()
    const controller = new AbortController()
    clickAbortRef.current = controller
    void (async () => {
      try {
        await playAudio(playableRef.current, controller.signal)
        if (!controller.signal.aborted) setPhase('questions')
      } catch {
        if (!controller.signal.aborted) setPhase('questions')
      }
    })()
  }

  const markAnswer = (optionId: string) => {
    if (!question || answered) return
    setSelected(optionId)
    setAnswered(true)
    if (optionId === question.correct_option_id) {
      setCorrectCount((count) => count + 1)
    }
  }

  const nextQuestion = () => {
    if (!lastQuestion) {
      setQuestionIndex((i) => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  if (phase === 'playing') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 py-6">
        <ListeningIndicator
          title="Listening…"
          subtitle="Audio plays once. No replay. Speakers are not announced."
        />
        {context ? (
          <p className="max-w-md text-center text-sm text-muted">{context}</p>
        ) : (
          <p className="max-w-md text-center text-sm text-muted">
            Listen, then choose the best response. The line is not shown on screen.
          </p>
        )}
        {needsGesture ? (
          <button
            type="button"
            onClick={startFromClick}
            className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Play audio
          </button>
        ) : null}
      </div>
    )
  }

  if (!question) {
    return (
      <div className="flex h-full flex-col justify-end">
        <button
          type="button"
          onClick={() => onContinue(correctCount, questions.length)}
          className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    )
  }

  const isCorrect = selected === question.correct_option_id

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          Question {questionIndex + 1} of {questions.length}
        </p>
        <p className="mt-2 text-base font-semibold text-ink">{question.prompt}</p>
      </div>

      <div className="space-y-2">
        {question.options.map((option) => {
          const active = selected === option.id
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                active
                  ? answered
                    ? isCorrect
                      ? 'border-emerald-400 bg-emerald-50'
                      : option.id === question.correct_option_id
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-red-300 bg-red-50'
                    : 'border-brand bg-brand-light text-ink'
                  : answered && option.id === question.correct_option_id
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-200 hover:border-brand/40'
              } ${answered ? 'cursor-default' : ''}`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={active}
                disabled={answered}
                onChange={() => markAnswer(option.id)}
                className="mt-1 h-4 w-4 accent-brand"
              />
              <span>
                <span className="mr-2 font-bold uppercase text-brand">{option.id}</span>
                {option.text}
              </span>
            </label>
          )
        })}
      </div>

      {answered ? (
        <p className="text-sm leading-relaxed text-muted">{question.explanation}</p>
      ) : null}

      {allDone ? (
        <div className="rounded-2xl border border-gray-100 bg-mist/60 p-4">
          <button
            type="button"
            onClick={() => setShowTranscript((open) => !open)}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {showTranscript ? 'Hide transcript' : 'Show transcript'}
          </button>
          {showTranscript ? (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/90">
              {transcript.map((line, index) => (
                <p key={`${playable.item.id}-t-${index}`}>
                  {line.label ? (
                    <span className="font-semibold text-ink">{line.label}. </span>
                  ) : null}
                  {line.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted">
              Available after you answer. The audio never announced who was speaking.
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-auto border-t border-gray-100 pt-5">
        {answered && !lastQuestion ? (
          <button
            type="button"
            onClick={nextQuestion}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Next question
          </button>
        ) : (
          <button
            type="button"
            disabled={!allDone}
            onClick={() => onContinue(correctCount, questions.length)}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {allDone ? 'Continue' : t('toefl.submitContinue')}
          </button>
        )}
        <p className="mt-2.5 text-center text-xs text-muted">{t('toefl.noBack')}</p>
      </div>
    </div>
  )
}
