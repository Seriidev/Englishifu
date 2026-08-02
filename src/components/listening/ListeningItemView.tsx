import { useEffect, useRef, useState } from 'react'
import type { ListeningItem } from './types'
import { playPromptAudio, cancelPromptAudio } from '../../speaking/hooks/playPromptAudio'
import ListeningIndicator from '../shared/ListeningIndicator'
import PromptImage from '../shared/PromptImage'
import { useLanguage } from '../../i18n/LanguageContext'
import LetterSlotsInput from '../shared/LetterSlotsInput'

interface Props {
  item: ListeningItem
  onSubmit: (payload: ListeningAnswerPayload) => void
  /** When false, skip playback (audio already heard in a multi-question practice). */
  playAudio?: boolean
}

export type ListeningAnswerPayload =
  | { type: 'fill-in-blank'; blanks: string[] }
  | { type: 'multiple-choice'; optionIndex: number }
  | { type: 'map-matching'; mapping: Record<string, string> }

export default function ListeningItemView({
  item,
  onSubmit,
  playAudio = true,
}: Props) {
  const [phase, setPhase] = useState<'playing' | 'answering'>(
    playAudio ? 'playing' : 'answering',
  )
  const started = useRef(false)

  useEffect(() => {
    started.current = false
    if (!playAudio) {
      setPhase('answering')
      return
    }
    setPhase('playing')
    let cancelled = false
    const run = async () => {
      try {
        await playPromptAudio(item.audioUrl, item.speakText)
      } catch {
        /* continue */
      }
      if (!cancelled) setPhase('answering')
    }
    void run()
    return () => {
      cancelled = true
      cancelPromptAudio()
    }
  }, [item.id, item.audioUrl, item.speakText, playAudio])

  return (
    <div className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      {phase === 'playing' ? (
        <div className="flex flex-1 items-center justify-center">
          <ListeningIndicator />
        </div>
      ) : (
        <AnswerPanel item={item} onSubmit={onSubmit} />
      )}
    </div>
  )
}

function AnswerPanel({
  item,
  onSubmit,
}: {
  item: ListeningItem
  onSubmit: (payload: ListeningAnswerPayload) => void
}) {
  if (item.questionType === 'fill-in-blank') {
    return <FillInBlank item={item} onSubmit={onSubmit} />
  }
  if (item.questionType === 'map-matching') {
    return <MapMatching item={item} onSubmit={onSubmit} />
  }
  return <ListeningMC item={item} onSubmit={onSubmit} />
}

function FillInBlank({
  item,
  onSubmit,
}: {
  item: ListeningItem
  onSubmit: (payload: ListeningAnswerPayload) => void
}) {
  const blankCount = item.blankAnswers?.length ?? 0
  const [blanks, setBlanks] = useState<string[]>(() => Array(blankCount).fill(''))
  const parts = (item.transcriptWithBlanks ?? '').split('___')

  const complete = blanks.every((b, i) => {
    const expected = item.blankAnswers?.[i]?.length ?? 0
    return b.length === expected
  })

  return (
    <div className="flex h-full flex-col gap-6 pb-2 sm:pb-3">
      <div className="flex-1">
        <p className="text-base font-semibold text-ink">{item.prompt}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink">
          {parts.map((part, i) => {
            const answerLen = item.blankAnswers?.[i]?.length ?? 4
            return (
              <span key={i}>
                {part}
                {i < blankCount && (
                  <LetterSlotsInput
                    value={blanks[i] ?? ''}
                    length={answerLen}
                    ariaLabel={`Blank ${i + 1}`}
                    onChange={(v) => {
                      const next = [...blanks]
                      next[i] = v
                      setBlanks(next)
                    }}
                  />
                )}
              </span>
            )
          })}
        </p>
      </div>
      <div className="mt-auto border-t border-gray-100 pt-5">
        <button
          type="button"
          disabled={!complete}
          onClick={() => onSubmit({ type: 'fill-in-blank', blanks })}
          className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          <SubmitLabel />
        </button>
      </div>
    </div>
  )
}

function SubmitLabel() {
  const { t } = useLanguage()
  return <>{t('toefl.submitContinue')}</>
}

function ListeningMC({
  item,
  onSubmit,
}: {
  item: ListeningItem
  onSubmit: (payload: ListeningAnswerPayload) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex-1">
        <p className="text-xs font-semibold text-brand uppercase">
          {item.mcSubtype?.replace('-', ' ') ?? 'multiple choice'}
        </p>
        <p className="mt-2 text-base font-semibold text-ink">{item.prompt}</p>
        <div className="mt-4 space-y-2">
          {(item.options ?? []).map((opt, idx) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(idx)}
              className={`flex w-full rounded-xl border px-4 py-3 text-left text-sm ${
                selected === idx
                  ? 'border-brand bg-brand-light'
                  : 'border-gray-200 hover:border-brand/40'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={selected == null}
        onClick={() =>
          selected != null &&
          onSubmit({ type: 'multiple-choice', optionIndex: selected })
        }
        className="rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        <SubmitLabel />
      </button>
    </div>
  )
}

function MapMatching({
  item,
  onSubmit,
}: {
  item: ListeningItem
  onSubmit: (payload: ListeningAnswerPayload) => void
}) {
  const cues = item.mapCues ?? []
  const [activeCue, setActiveCue] = useState(0)
  const [mapping, setMapping] = useState<Record<string, string>>({})

  const complete = cues.every((c) => mapping[c])

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex-1 space-y-4">
        <p className="text-base font-semibold text-ink">{item.prompt}</p>
        <p className="text-sm text-muted">
          Select: <strong className="text-brand">{cues[activeCue]}</strong>
        </p>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200">
          <PromptImage
            src={item.imageUrl ?? ''}
            alt="Map"
            className="aspect-[16/10] w-full object-cover"
          />
          {(item.hotspots ?? []).map((h) => {
            const selected = Object.values(mapping).includes(h.id)
            return (
              <button
                key={h.id}
                type="button"
                aria-label={h.label}
                onClick={() => {
                  const cue = cues[activeCue]
                  if (!cue) return
                  setMapping((prev) => ({ ...prev, [cue]: h.id }))
                  if (activeCue < cues.length - 1) setActiveCue((i) => i + 1)
                }}
                className={`absolute rounded-xl border-2 transition ${
                  selected
                    ? 'border-brand bg-brand/30'
                    : 'border-white/80 bg-white/25 hover:bg-brand/20'
                }`}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.width}%`,
                  height: `${h.height}%`,
                  minWidth: 44,
                  minHeight: 44,
                }}
              />
            )
          })}
        </div>
        <ul className="text-xs text-muted">
          {cues.map((c) => (
            <li key={c}>
              {c}: {mapping[c] ? 'selected' : '—'}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        disabled={!complete}
        onClick={() => onSubmit({ type: 'map-matching', mapping })}
        className="rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        <SubmitLabel />
      </button>
    </div>
  )
}
