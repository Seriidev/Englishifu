import { useMemo } from 'react'
import type { ReadingQuestion } from './types'
import { useLanguage } from '../../i18n/LanguageContext'
import CompleteWordsView from './CompleteWordsView'

interface Props {
  question: ReadingQuestion
  value: string | Record<string, string> | null
  onChange: (value: string | Record<string, string>) => void
  onSubmit: () => void
}

export default function ReadingQuestionView({
  question,
  value,
  onChange,
  onSubmit,
}: Props) {
  if (question.type === 'multiple-choice') {
    const selected = typeof value === 'string' ? value : null
    return (
      <div className="flex h-full flex-col">
        <p className="text-base font-semibold text-ink">{question.prompt}</p>
        <div className="mt-4 space-y-2">
          {question.options.map((opt, idx) => {
            const key = String(idx)
            const active = selected === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                  active
                    ? 'border-brand bg-brand-light text-ink'
                    : 'border-gray-200 hover:border-brand/40'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active ? 'bg-brand text-white' : 'bg-gray-100'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>
        <SubmitBar disabled={selected == null} onSubmit={onSubmit} />
      </div>
    )
  }

  if (question.type === 'complete-words') {
    return (
      <CompleteWordsView
        question={question}
        value={typeof value === 'object' && value ? value : {}}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    )
  }

  return (
    <MatchQuestionView
      question={question}
      value={typeof value === 'object' && value ? value : {}}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  )
}

function MatchQuestionView({
  question,
  value,
  onChange,
  onSubmit,
}: {
  question: ReadingQuestion
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
  onSubmit: () => void
}) {
  const refs = question.paragraphRefs ?? []
  const complete = refs.every((id) => Boolean(value[id]))

  const rows = useMemo(() => {
    if (question.type === 'match-sentence-ending' && refs.length === 1) {
      return [{ id: refs[0], label: 'Sentence ending' }]
    }
    return refs.map((id, i) => ({ id, label: `Paragraph ${i + 1} (${id})` }))
  }, [question.type, refs])

  return (
    <div className="flex h-full flex-col">
      <p className="text-base font-semibold text-ink">{question.prompt}</p>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <label key={row.id} className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink">{row.label}</span>
            <select
              value={value[row.id] ?? ''}
              onChange={(e) =>
                onChange({ ...value, [row.id]: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option value="" disabled>
                Select…
              </option>
              {question.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <SubmitBar disabled={!complete} onSubmit={onSubmit} />
    </div>
  )
}

function SubmitBar({
  disabled,
  onSubmit,
}: {
  disabled: boolean
  onSubmit: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className="mt-auto border-t border-gray-100 pt-5 pb-2 sm:pb-3">
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('toefl.submitContinue')}
      </button>
      <p className="mt-2.5 text-center text-xs text-muted">{t('toefl.noBack')}</p>
    </div>
  )
}
