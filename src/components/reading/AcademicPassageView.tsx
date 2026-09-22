import { useMemo, useState } from 'react'
import type { AcademicPassage, DailyLifeQuestion } from './types'
import { useLanguage } from '../../i18n/LanguageContext'

interface AcademicPassageViewProps {
  passage: AcademicPassage
  onContinue: (correct: number, total: number) => void
}

export default function AcademicPassageView({
  passage,
  onContinue,
}: AcademicPassageViewProps) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [answered, setAnswered] = useState<Record<string, boolean>>({})

  const allAnswered = passage.questions.every((question) => answered[question.id])
  const correctCount = useMemo(
    () =>
      passage.questions.filter(
        (question) => selected[question.id] === question.correct_option_id,
      ).length,
    [passage.questions, selected],
  )

  const markAnswered = (question: DailyLifeQuestion, optionId: string) => {
    if (answered[question.id]) return
    setSelected((prev) => ({ ...prev, [question.id]: optionId }))
    setAnswered((prev) => ({ ...prev, [question.id]: true }))
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="lg:sticky lg:top-4">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          Read an academic passage
        </p>
        <p className="mt-1 text-sm text-muted">{passage.instructions}</p>
        <article className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-bold text-ink">{passage.title}</h3>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/90">
            {passage.paragraphs.map((paragraph, index) => (
              <p key={`${passage.id}-p-${index}`}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>

      <div className="flex flex-col gap-6">
      <div className="space-y-6">
        {passage.questions.map((question, index) => {
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
              <div className="mt-3 flex flex-col gap-2">
                {[...question.options]
                  .sort((a, b) => a.id.localeCompare(b.id))
                  .map((option) => {
                  const active = chosen === option.id
                  return (
                    <label
                      key={option.id}
                      className={`grid cursor-pointer grid-cols-[2.25rem_1fr] items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
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
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold uppercase text-brand">
                        {option.id}
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={active}
                          disabled={isAnswered}
                          onChange={() => markAnswered(question, option.id)}
                          className="sr-only"
                        />
                      </span>
                      <span>{option.text}</span>
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
          onClick={() => onContinue(correctCount, passage.questions.length)}
          className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allAnswered ? 'Continue' : t('toefl.submitContinue')}
        </button>
        <p className="mt-2.5 text-center text-xs text-muted">{t('toefl.noBack')}</p>
      </div>
      </div>
    </div>
  )
}
