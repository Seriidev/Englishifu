import { useState } from 'react'
import { wordCount } from '../../scoring/writingScoring'

interface Props {
  prompt: string
  contextInfo?: string
  minWords?: number
  maxWords?: number
  onSubmit: (text: string) => void
}

export default function WriteEmail({
  prompt,
  contextInfo,
  minWords = 80,
  maxWords = 150,
  onSubmit,
}: Props) {
  const [text, setText] = useState('')
  const count = wordCount(text)

  return (
    <div className="flex h-full flex-col">
      <p className="text-base font-semibold text-ink">{prompt}</p>
      {contextInfo && (
        <p className="mt-2 rounded-xl bg-brand-light/60 p-3 text-sm text-ink">{contextInfo}</p>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck
        className="mt-4 min-h-48 flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        placeholder="Write your email here…"
      />
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          {count} words
          {minWords ? ` (min ${minWords}` : ''}
          {maxWords ? `, max ${maxWords})` : minWords ? ')' : ''}
        </span>
        <span className={count > maxWords ? 'text-red-500' : ''}>
          {count > maxWords ? 'Over limit' : 'OK'}
        </span>
      </div>
      <button
        type="button"
        disabled={count < minWords || count > maxWords}
        onClick={() => onSubmit(text)}
        className="mt-3 rounded-full bg-brand py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        Submit Email
      </button>
    </div>
  )
}
