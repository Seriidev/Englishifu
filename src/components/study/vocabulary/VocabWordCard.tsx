import { useState } from 'react'
import {
  HiBookmark,
  HiOutlineBookmark,
  HiOutlineChevronDown,
  HiOutlineSpeakerWave,
} from 'react-icons/hi2'
import type { VocabWord } from '../../../types/studyContent'

interface VocabWordCardProps {
  item: VocabWord
  saved: boolean
  onToggleSave: (id: string) => void
  onSpeak: (word: string) => void
}

function posLabel(partOfSpeech: string) {
  const key = partOfSpeech.replace('.', '').toLowerCase()
  const map: Record<string, string> = {
    v: 'VERB',
    verb: 'VERB',
    adj: 'ADJECTIVE',
    n: 'NOUN',
    noun: 'NOUN',
    conj: 'CONJUNCTION',
    adv: 'ADVERB',
  }
  return map[key] ?? partOfSpeech.replace('.', '').toUpperCase()
}

export default function VocabWordCard({
  item,
  saved,
  onToggleSave,
  onSpeak,
}: VocabWordCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-11 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {item.word}
            </h3>
            <button
              type="button"
              onClick={() => onSpeak(item.word)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
              aria-label={`Pronounce ${item.word}`}
            >
              <HiOutlineSpeakerWave className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {posLabel(item.partOfSpeech)}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          {saved ? 'Saved' : 'Not memorized'}
        </span>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-expanded={open}
          aria-label={open ? 'Hide example' : 'Show example'}
        >
          <HiOutlineChevronDown
            className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

      </div>

      <button
        type="button"
        onClick={() => onToggleSave(item.id)}
        className={`absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-lg transition ${
          saved
            ? 'text-indigo-500 hover:bg-indigo-500/10'
            : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-500'
        }`}
        aria-label={saved ? `Remove ${item.word} from My words` : `Save ${item.word}`}
        aria-pressed={saved}
      >
        {saved ? (
          <HiBookmark className="h-5 w-5" aria-hidden />
        ) : (
          <HiOutlineBookmark className="h-5 w-5" aria-hidden />
        )}
      </button>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {item.definition}
      </p>

      {open ? (
        <p className="mt-2 text-sm text-slate-500 italic">
          “{item.example}”
        </p>
      ) : null}
    </article>
  )
}
