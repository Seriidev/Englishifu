import { useRef, useState } from 'react'
import type { WriteForAcademicDiscussionItem } from './types'
import WritingCountdown from './WritingCountdown'
import { wordCount } from '../../scoring/writingScoring'
import { useLanguage } from '../../i18n/LanguageContext'

interface Props {
  item: WriteForAcademicDiscussionItem
  onSubmit: (text: string) => void
}

export default function AcademicDiscussion({ item, onSubmit }: Props) {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const submittedRef = useRef(false)
  const textRef = useRef(text)
  textRef.current = text

  const count = wordCount(text)
  const underMin = count < item.min_words

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
            {item.course}
          </p>
          <p className="mt-1 text-sm text-muted">Write for an Academic Discussion</p>
        </div>
        <div className="sticky top-3 shrink-0">
          <WritingCountdown
            timeLimitMinutes={item.time_limit_minutes}
            onExpire={() => submit(textRef.current)}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl bg-brand-light/60 p-4">
          <p className="text-xs font-bold tracking-wide text-brand uppercase">
            {item.professor}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{item.question}</p>
        </div>
        {item.student_posts.map((post) => (
          <div
            key={`${item.id}-${post.name}`}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-ink">{post.name}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{post.text}</p>
          </div>
        ))}
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
        {item.instructions.map((instruction) => (
          <li key={instruction}>{instruction}</li>
        ))}
      </ul>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck
        className="mt-4 min-h-52 flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        placeholder="Write your response…"
      />

      <div className="mt-3 flex justify-between text-xs">
        <span className={underMin ? 'font-semibold text-amber-700' : 'text-muted'}>
          {count} / {item.min_words} words
        </span>
        {underMin ? (
          <span className="text-amber-700">Aim for at least {item.min_words} words</span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => submit(text)}
        className="mt-3 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        {t('toefl.submitContinue')}
      </button>
    </div>
  )
}
