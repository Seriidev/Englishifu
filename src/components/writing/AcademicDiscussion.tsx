import { useState } from 'react'
import type { AcademicDiscussionSubtype } from './types'
import { wordCount } from '../../scoring/writingScoring'

interface Props {
  prompt: string
  subtype?: AcademicDiscussionSubtype
  minWords?: number
  maxWords?: number
  onSubmit: (text: string) => void
}

export default function AcademicDiscussion({
  prompt,
  subtype,
  minWords = 80,
  maxWords = 200,
  onSubmit,
}: Props) {
  const [text, setText] = useState('')
  const count = wordCount(text)

  return (
    <div className="flex h-full flex-col">
      {subtype && (
        <p className="text-xs font-bold tracking-wide text-brand uppercase">
          {subtype.replace(/-/g, ' ')}
        </p>
      )}
      <p className="mt-2 whitespace-pre-line text-base font-semibold text-ink">{prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck
        className="mt-4 min-h-52 flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        placeholder="Write your response…"
      />
      <div className="mt-3 flex justify-between text-xs text-muted">
        <span>
          {count} words (min {minWords}, max {maxWords})
        </span>
      </div>
      <button
        type="button"
        disabled={count < minWords || count > maxWords}
        onClick={() => onSubmit(text)}
        className="mt-3 rounded-full bg-brand py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        Submit Response
      </button>
    </div>
  )
}
