import { useMemo, useRef, useState } from 'react'
import type { CompleteTheWordsPassage } from './types'
import { useLanguage } from '../../i18n/LanguageContext'

interface CompleteTheWordsViewProps {
  passage: CompleteTheWordsPassage
  onContinue: (correct: number, total: number) => void
}

export default function CompleteTheWordsView({
  passage,
  onContinue,
}: CompleteTheWordsViewProps) {
  const { t } = useLanguage()
  const blanks = useMemo(
    () => passage.tokens.filter((token) => token.type === 'blank'),
    [passage.tokens],
  )
  const [values, setValues] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const lettersOf = (id: number, length: number) => {
    const raw = (values[id] ?? '').padEnd(length, ' ')
    return Array.from({ length }, (_, index) => {
      const char = raw[index] ?? ' '
      return /[a-zA-Z]/.test(char) ? char : ''
    })
  }

  const allFilled =
    blanks.length > 0 &&
    blanks.every((blank) =>
      lettersOf(blank.id, blank.length).every((letter) => letter !== ''),
    )

  const perBlank = useMemo(() => {
    const result: Record<number, boolean> = {}
    for (const blank of blanks) {
      const typed = (values[blank.id] ?? '')
        .padEnd(blank.length, ' ')
        .slice(0, blank.length)
      result[blank.id] = [...blank.answer].every(
        (char, index) =>
          (typed[index] ?? '').toLowerCase() === char.toLowerCase(),
      )
    }
    return result
  }, [blanks, values])

  const correctCount = blanks.filter((blank) => perBlank[blank.id]).length

  const slotKey = (id: number, index: number) => `${id}:${index}`

  const focusSlot = (id: number, index: number) => {
    requestAnimationFrame(() => inputRefs.current[slotKey(id, index)]?.focus())
  }

  const writeLetters = (
    id: number,
    length: number,
    start: number,
    raw: string,
  ) => {
    const incoming = raw.replace(/[^a-zA-Z]/g, '').toLowerCase()
    if (!incoming) return
    const chars = lettersOf(id, length)
    let cursor = start
    for (const letter of incoming) {
      if (cursor >= length) break
      chars[cursor] = letter
      cursor += 1
    }
    setValues((prev) => ({
      ...prev,
      [id]: chars.map((letter) => letter || ' ').join(''),
    }))
    if (cursor >= length) {
      const blankIndex = blanks.findIndex((blank) => blank.id === id)
      const nextBlank = blanks[blankIndex + 1]
      if (nextBlank) focusSlot(nextBlank.id, 0)
      return
    }
    focusSlot(id, cursor)
  }

  const clearSlot = (id: number, length: number, index: number) => {
    const chars = lettersOf(id, length)
    if (chars[index]) {
      chars[index] = ''
      setValues((prev) => ({
        ...prev,
        [id]: chars.map((letter) => letter || ' ').join(''),
      }))
      return
    }
    if (index > 0) {
      chars[index - 1] = ''
      setValues((prev) => ({
        ...prev,
        [id]: chars.map((letter) => letter || ' ').join(''),
      }))
      focusSlot(id, index - 1)
      return
    }
    const blankIndex = blanks.findIndex((blank) => blank.id === id)
    const prevBlank = blanks[blankIndex - 1]
    if (!prevBlank) return
    const prevChars = lettersOf(prevBlank.id, prevBlank.length)
    prevChars[prevBlank.length - 1] = ''
    setValues((prev) => ({
      ...prev,
      [prevBlank.id]: prevChars.map((letter) => letter || ' ').join(''),
    }))
    focusSlot(prevBlank.id, prevBlank.length - 1)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          Complete the words
        </p>
        <h3 className="mt-1 text-lg font-bold text-ink">{passage.title}</h3>
        <p className="mt-1 text-sm text-muted">{passage.instructions}</p>
      </div>

      <p className="text-base leading-loose text-ink">
        {passage.tokens.map((token, index) => {
          if (token.type === 'text') {
            return <span key={`t-${passage.id}-${index}`}>{token.value}</span>
          }

          const letters = lettersOf(token.id, token.length)
          const ok = perBlank[token.id]

          return (
            <span
              key={`b-${passage.id}-${token.id}`}
              className="mx-0.5 inline-flex items-baseline align-baseline"
            >
              <span className="font-semibold text-ink">{token.stem}</span>
              <span className="ml-0.5 inline-flex items-center gap-0.5">
                {letters.map((letter, index) => {
                  const border = !checked
                    ? 'border-brand/50'
                    : ok
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-red-400 bg-red-50'
                  return (
                    <input
                      key={slotKey(token.id, index)}
                      ref={(el) => {
                        inputRefs.current[slotKey(token.id, index)] = el
                      }}
                      value={letter}
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      disabled={checked}
                      aria-label={`Letter ${index + 1} of ${token.length} after ${token.stem}`}
                      onChange={(e) => {
                        if (checked) return
                        writeLetters(token.id, token.length, index, e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (checked) return
                        if (e.key === 'Backspace') {
                          e.preventDefault()
                          clearSlot(token.id, token.length, index)
                        }
                      }}
                      className={`inline-block h-7 w-6 rounded-md border bg-brand-light/40 text-center text-sm font-semibold text-ink outline-none focus:border-brand focus:bg-brand-light disabled:opacity-90 ${border}`}
                    />
                  )
                })}
              </span>
            </span>
          )
        })}
      </p>

      {checked ? (
        <div className="mt-auto border-t border-gray-100 pt-5">
          <p className="mb-3 text-center text-sm text-muted">
            {correctCount} of {blanks.length} blanks correct
          </p>
          <button
            type="button"
            onClick={() => onContinue(correctCount, blanks.length)}
            className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="mt-auto border-t border-gray-100 pt-5">
          <button
            type="button"
            disabled={!allFilled}
            onClick={() => setChecked(true)}
            className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('toefl.submitContinue')}
          </button>
          <p className="mt-2.5 text-center text-xs text-muted">
            {t('toefl.noBack')}
          </p>
        </div>
      )}
    </div>
  )
}
