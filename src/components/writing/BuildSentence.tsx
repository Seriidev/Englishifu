import { useMemo, useState } from 'react'

interface Props {
  wordBank: string[]
  onSubmit: (ordered: string[]) => void
}

export default function BuildSentence({ wordBank, onSubmit }: Props) {
  const shuffled = useMemo(() => [...wordBank].sort(() => Math.random() - 0.5), [wordBank])
  const [pool, setPool] = useState<string[]>(shuffled)
  const [built, setBuilt] = useState<string[]>([])

  const add = (word: string, fromPoolIndex: number) => {
    setBuilt((b) => [...b, word])
    setPool((p) => p.filter((_, i) => i !== fromPoolIndex))
  }

  const remove = (index: number) => {
    const word = built[index]
    setBuilt((b) => b.filter((_, i) => i !== index))
    setPool((p) => [...p, word])
  }

  return (
    <div className="flex h-full flex-col">
      <p className="text-sm text-muted">Tap words to build the sentence. Tap a placed word to remove it.</p>

      <div className="mt-4 min-h-16 rounded-2xl border border-dashed border-brand/40 bg-brand-light/40 p-3">
        <div className="flex flex-wrap gap-2">
          {built.length === 0 && (
            <span className="text-sm text-muted">Your sentence appears here…</span>
          )}
          {built.map((w, i) => (
            <button
              key={`${w}-${i}`}
              type="button"
              onClick={() => remove(i)}
              className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white"
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((w, i) => (
          <button
            key={`${w}-pool-${i}`}
            type="button"
            onClick={() => add(w, i)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-brand"
          >
            {w}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={built.length === 0}
        onClick={() => onSubmit(built)}
        className="mt-auto rounded-full bg-brand py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        Submit Sentence
      </button>
    </div>
  )
}
