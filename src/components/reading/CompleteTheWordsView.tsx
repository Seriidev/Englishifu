import { useMemo, useRef, useState } from 'react'
import type { CompleteTheWordsPassage } from './types'
import { isBlankCorrect } from './getRandomSession'
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
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const allFilled =
    blanks.length > 0 &&
    blanks.every((blank) => (values[blank.id] ?? '').length === blank.length)

  const perBlank = useMemo(() => {
    const result: Record<number, boolean> = {}
    for (const blank of blanks) {
      result[blank.id] = isBlankCorrect(values[blank.id] ?? '', blank.answer)
    }
    return result
  }, [blanks, values])

  const correctCount = blanks.filter((blank) => perBlank[blank.id]).length

  const focusNext = (currentId: number) => {
    const idx = blanks.findIndex((blank) => blank.id === currentId)
    const next = blanks[idx + 1]
    if (!next) return
    requestAnimationFrame(() => inputRefs.current[next.id]?.focus())
  }

  const handleChange = (id: number, length: number, raw: string) => {
    if (checked) return
    const next = raw.replace(/[^a-zA-Z]/g, '').slice(0, length)
    setValues((prev) => ({ ...prev, [id]: next }))
    if (next.length === length) focusNext(id)
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

          const value = values[token.id] ?? ''
          const ok = perBlank[token.id]
          const border = !checked
            ? 'border-brand'
            : ok
              ? 'border-emerald-500'
              : 'border-red-400'

          return (
            <span
              key={`b-${passage.id}-${token.id}`}
              className="mx-0.5 inline-flex items-baseline align-baseline"
            >
              <span className="font-semibold text-ink">{token.stem}</span>
              <input
                ref={(el) => {
                  inputRefs.current[token.id] = el
                }}
                value={value}
                maxLength={token.length}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={checked}
                aria-label={`Missing letters after ${token.stem}`}
                onChange={(e) =>
                  handleChange(token.id, token.length, e.target.value)
                }
                className={`ml-0.5 inline-block rounded-md border-b-2 bg-brand-light/50 px-1 py-0.5 text-center text-[0.95em] font-semibold text-ink outline-none focus:bg-brand-light disabled:opacity-90 ${border}`}
                style={{ width: `${token.length + 1.5}ch` }}
              />
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
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
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
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
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
