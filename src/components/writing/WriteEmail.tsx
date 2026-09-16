import { useRef, useState } from 'react'
import type { WriteAnEmailItem } from './types'
import WritingCountdown from './WritingCountdown'
import { wordCount } from '../../scoring/writingScoring'
import { useLanguage } from '../../i18n/LanguageContext'

interface Props {
  item: WriteAnEmailItem
  onSubmit: (text: string) => void
}

export default function WriteEmail({ item, onSubmit }: Props) {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [showSample, setShowSample] = useState(false)
  const submittedRef = useRef(false)
  const textRef = useRef(text)
  textRef.current = text

  const count = wordCount(text)
  const hasDraft = text.trim().length > 0
  const sample = item.sample_answer

  const submit = (value: string) => {
    if (submittedRef.current) return
    submittedRef.current = true
    onSubmit(value)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand uppercase">
            Write an Email
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{item.scenario}</p>
        </div>
        <div className="sticky top-3 shrink-0">
          <WritingCountdown
            timeLimitMinutes={item.time_limit_minutes}
            onExpire={() => submit(textRef.current)}
          />
        </div>
      </div>

      <dl className="mt-4 grid gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 font-semibold text-muted">To</dt>
          <dd className="text-ink">{item.to}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 font-semibold text-muted">Subject</dt>
          <dd className="text-ink">{item.subject}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-2">
        {item.instructions.map((instruction, index) => (
          <li key={`${item.id}-ins-${index}`}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={Boolean(checked[index])}
                onChange={() =>
                  setChecked((prev) => ({ ...prev, [index]: !prev[index] }))
                }
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand"
              />
              <span>{instruction}</span>
            </label>
          </li>
        ))}
      </ul>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck
        className="mt-4 min-h-48 flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        placeholder="Write your email here…"
      />

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{count} words</span>
        {sample ? (
          <button
            type="button"
            disabled={!hasDraft}
            onClick={() => setShowSample(true)}
            className="font-semibold text-brand disabled:cursor-not-allowed disabled:text-muted"
          >
            Show example
          </button>
        ) : null}
      </div>

      {showSample && sample ? (
        <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4 text-sm leading-relaxed whitespace-pre-line text-ink">
          {sample}
        </div>
      ) : null}

      <button
        type="button"
        disabled={!hasDraft}
        onClick={() => submit(text)}
        className="mt-3 rounded-full bg-brand py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {t('toefl.submitContinue')}
      </button>
    </div>
  )
}
