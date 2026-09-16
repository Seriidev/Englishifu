import { useMemo, useState } from 'react'
import type { DailyLifeQuestion, ReadInDailyLifeItem } from './types'
import { useLanguage } from '../../i18n/LanguageContext'

interface ReadInDailyLifeViewProps {
  item: ReadInDailyLifeItem
  onContinue: (correct: number, total: number) => void
}

export default function ReadInDailyLifeView({
  item,
  onContinue,
}: ReadInDailyLifeViewProps) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [answered, setAnswered] = useState<Record<string, boolean>>({})

  const allAnswered = item.questions.every((question) => answered[question.id])
  const correctCount = useMemo(
    () =>
      item.questions.filter(
        (question) => selected[question.id] === question.correct_option_id,
      ).length,
    [item.questions, selected],
  )

  const markAnswered = (question: DailyLifeQuestion, optionId: string) => {
    if (answered[question.id]) return
    setSelected((prev) => ({ ...prev, [question.id]: optionId }))
    setAnswered((prev) => ({ ...prev, [question.id]: true }))
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          Read in daily life
        </p>
        <p className="mt-1 text-sm text-muted">{item.instructions}</p>
      </div>

      <DailyLifePassage item={item} />

      <div className="space-y-6">
        {item.questions.map((question, index) => {
          const chosen = selected[question.id]
          const isAnswered = Boolean(answered[question.id])
          const isCorrect = chosen === question.correct_option_id

          return (
            <fieldset
              key={question.id}
              className="rounded-2xl border border-gray-100 bg-mist/60 p-4"
            >
              <legend className="px-1 text-sm font-semibold text-ink">
                {index + 1}. {question.prompt}
              </legend>
              <div className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const active = chosen === option.id
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                        active
                          ? isAnswered
                            ? isCorrect
                              ? 'border-emerald-400 bg-emerald-50'
                              : option.id === question.correct_option_id
                                ? 'border-emerald-400 bg-emerald-50'
                                : 'border-red-300 bg-red-50'
                            : 'border-brand bg-brand-light text-ink'
                          : isAnswered && option.id === question.correct_option_id
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-brand/40'
                      } ${isAnswered ? 'cursor-default' : ''}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={active}
                        disabled={isAnswered}
                        onChange={() => markAnswered(question, option.id)}
                        className="mt-1 h-4 w-4 accent-brand"
                      />
                      <span>
                        <span className="mr-2 font-bold uppercase text-brand">
                          {option.id}
                        </span>
                        {option.text}
                      </span>
                    </label>
                  )
                })}
              </div>
              {isAnswered ? (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {question.explanation}
                </p>
              ) : null}
            </fieldset>
          )
        })}
      </div>

      <div className="mt-auto border-t border-gray-100 pt-5">
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => onContinue(correctCount, item.questions.length)}
          className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allAnswered ? 'Continue' : t('toefl.submitContinue')}
        </button>
        <p className="mt-2.5 text-center text-xs text-muted">{t('toefl.noBack')}</p>
      </div>
    </div>
  )
}

function DailyLifePassage({ item }: { item: ReadInDailyLifeItem }) {
  if (item.type === 'email') {
    return (
      <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          Email
        </p>
        <h3 className="mt-1 text-base font-bold text-ink">
          Subject: {item.subject}
        </h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/90">
          {item.body.map((paragraph, index) => (
            <p key={`${item.id}-p-${index}`}>{paragraph}</p>
          ))}
        </div>
      </article>
    )
  }

  if (item.type === 'announcement') {
    return (
      <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          Announcement
        </p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/90">
          {item.body.map((paragraph, index) => (
            <p key={`${item.id}-p-${index}`}>{paragraph}</p>
          ))}
        </div>
      </article>
    )
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        Text chain
      </p>
      <div className="mt-3 space-y-3">
        {item.messages.map((message, index) => (
          <div
            key={`${item.id}-m-${index}`}
            className="rounded-2xl bg-mist px-3 py-2.5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-ink">{message.sender}</p>
              <p className="text-[11px] text-muted">{message.time}</p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink/90">
              {message.text}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}
