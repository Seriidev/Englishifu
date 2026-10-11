import { Check, Pin, Volume2 } from 'lucide-react'
import type { VocabTopic, VocabWord } from '../../../types/studyContent'

interface VocabWordCardProps {
  item: VocabWord
  saved: boolean
  onToggleSave: (id: string) => void
  onSpeak: (word: string) => void
}

const TOPIC_LABEL: Record<VocabTopic, string> = {
  academic: 'Academic',
  campus: 'Campus',
  science: 'Science',
  conversation: 'Conversation',
  environment: 'Environment',
  history: 'History',
  toefl: 'TOEFL Preparation',
}

function posLabel(partOfSpeech: string) {
  const key = partOfSpeech.replace('.', '').toLowerCase()
  const map: Record<string, string> = {
    v: 'verb',
    verb: 'verb',
    adj: 'adjective',
    n: 'noun',
    noun: 'noun',
    conj: 'conjunction',
    adv: 'adverb',
  }
  return map[key] ?? key
}

export default function VocabWordCard({
  item,
  saved,
  onToggleSave,
  onSpeak,
}: VocabWordCardProps) {
  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          {TOPIC_LABEL[item.topic]}
        </span>
        <button
          type="button"
          onClick={() => onToggleSave(item.id)}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
            saved
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'
          }`}
          aria-label={
            saved ? `Remove ${item.word} from My words` : `Save ${item.word} to My words`
          }
          aria-pressed={saved}
        >
          <Pin className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold text-slate-900">{item.word}</h3>
        <button
          type="button"
          onClick={() => onSpeak(item.word)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 transition hover:bg-indigo-100"
          aria-label={`Pronounce ${item.word}`}
        >
          <Volume2 className="h-4 w-4" aria-hidden />
        </button>
        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-500">
          {posLabel(item.partOfSpeech)}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-400">{item.phonetic}</p>

      <p className="mt-3 text-sm font-semibold text-indigo-500">Example</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.example}</p>

      <div className="mt-4">
        {saved ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-600">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            </span>
            Learned
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-500">
            Learn
          </span>
        )}
      </div>
    </article>
  )
}
