import { useState } from 'react'
import type { BuildASentenceItem } from './types'
import {
  isBuildSentenceCorrect,
  shuffleSentenceChips,
} from './getRandomWritingSession'
import { useLanguage } from '../../i18n/LanguageContext'

interface Chip {
  id: string
  text: string
}

interface Props {
  item: BuildASentenceItem
  onContinue: (correct: boolean) => void
}

function toChips(words: string[]): Chip[] {
  return words.map((text, index) => ({ id: `${index}:${text}`, text }))
}

function moveChip(from: Chip[], to: Chip[], id: string, insertAt?: number): {
  from: Chip[]
  to: Chip[]
} {
  const index = from.findIndex((chip) => chip.id === id)
  const chip = from[index]
  if (!chip) return { from, to }
  const nextFrom = from.filter((item) => item.id !== id)
  const nextTo = [...to]
  const at =
    insertAt === undefined || insertAt < 0 || insertAt > nextTo.length
      ? nextTo.length
      : insertAt
  nextTo.splice(at, 0, chip)
  return { from: nextFrom, to: nextTo }
}

export default function BuildSentence({ item, onContinue }: Props) {
  const { t } = useLanguage()
  const [pool, setPool] = useState<Chip[]>(() =>
    toChips(shuffleSentenceChips(item)),
  )
  const [built, setBuilt] = useState<Chip[]>([])
  const [checked, setChecked] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const correct = checked && isBuildSentenceCorrect(
    item,
    built.map((chip) => chip.text),
  )

  const addFromPool = (id: string, insertAt?: number) => {
    if (checked) return
    const next = moveChip(pool, built, id, insertAt)
    setPool(next.from)
    setBuilt(next.to)
  }

  const returnToPool = (id: string) => {
    if (checked) return
    const next = moveChip(built, pool, id)
    setBuilt(next.from)
    setPool(next.to)
  }

  const reorderBuilt = (id: string, insertAt: number) => {
    if (checked) return
    const fromIndex = built.findIndex((chip) => chip.id === id)
    if (fromIndex < 0) return
    const chip = built[fromIndex]
    if (!chip) return
    const without = built.filter((itemChip) => itemChip.id !== id)
    const at = insertAt > fromIndex ? insertAt - 1 : insertAt
    without.splice(Math.max(0, at), 0, chip)
    setBuilt(without)
  }

  const handleDropOnBuilt = (insertAt: number) => {
    if (!draggingId) return
    if (built.some((chip) => chip.id === draggingId)) {
      reorderBuilt(draggingId, insertAt)
    } else {
      addFromPool(draggingId, insertAt)
    }
    setDraggingId(null)
  }

  const handleDropOnPool = () => {
    if (!draggingId) return
    if (built.some((chip) => chip.id === draggingId)) {
      returnToPool(draggingId)
    }
    setDraggingId(null)
  }

  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-semibold tracking-wide text-brand uppercase">
        Build a Sentence
      </p>
      <p className="mt-2 text-base font-semibold text-ink">{item.prompt}</p>
      <p className="mt-1 text-sm text-muted">
        Drag chips into the sentence, or tap to add and remove them.
      </p>

      <div
        className="mt-4 min-h-16 rounded-2xl border border-dashed border-brand/40 bg-brand-light/40 p-3"
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => handleDropOnBuilt(built.length)}
      >
        <div className="flex flex-wrap items-center gap-2">
          {item.response_prefix.trim() ? (
            <span className="text-sm font-semibold text-ink">
              {item.response_prefix.trim()}
            </span>
          ) : null}

          {built.length === 0 && (
            <span className="text-sm text-muted">Drop or tap words here…</span>
          )}
          {built.map((chip, index) => (
            <button
              key={chip.id}
              type="button"
              draggable={!checked}
              onDragStart={() => setDraggingId(chip.id)}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.stopPropagation()
                handleDropOnBuilt(index)
              }}
              onClick={() => returnToPool(chip.id)}
              disabled={checked}
              className="rounded-xl bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-90"
            >
              {chip.text}
            </button>
          ))}

          {item.response_suffix.trim() ? (
            <span className="text-sm font-semibold text-ink">
              {item.response_suffix.trim()}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className="mt-4 mb-2 flex min-h-12 flex-wrap gap-2"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDropOnPool}
      >
        {pool.map((chip) => (
          <button
            key={chip.id}
            type="button"
            draggable={!checked}
            onDragStart={() => setDraggingId(chip.id)}
            onDragEnd={() => setDraggingId(null)}
            onClick={() => addFromPool(chip.id)}
            disabled={checked}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-brand disabled:opacity-60"
          >
            {chip.text}
          </button>
        ))}
      </div>

      {checked ? (
        <div className="mt-auto border-t border-gray-100 pt-6 pb-1">
          <p
            className={`mb-2 text-center text-sm font-semibold ${
              correct ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {correct ? 'Correct' : 'Not quite'}
          </p>
          {!correct && (
            <p className="mb-4 text-center text-sm text-ink">{item.answer}</p>
          )}
          <button
            type="button"
            onClick={() => onContinue(correct)}
            className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="mt-auto border-t border-gray-100 pt-6 pb-1">
          <button
            type="button"
            disabled={built.length === 0}
            onClick={() => setChecked(true)}
            className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {t('toefl.submitContinue')}
          </button>
          <p className="mt-2.5 text-center text-xs text-muted">{t('toefl.noBack')}</p>
        </div>
      )}
    </div>
  )
}
