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
  toefl: 'TOEFL',
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
    <article className="vocab-word-card relative rounded-[20px] px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-start justify-between gap-3">
        <span className="vocab-chip rounded-lg px-3 py-1 text-xs font-semibold">
          {TOPIC_LABEL[item.topic]}
        </span>
        <button
          type="button"
          onClick={() => onToggleSave(item.id)}
          className={`vocab-chip inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
            saved ? 'vocab-chip-active' : ''
          }`}
          aria-label={
            saved ? `Remove ${item.word} from My words` : `Save ${item.word} to My words`
          }
          aria-pressed={saved}
        >
          <Pin className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} aria-hidden />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h3 className="text-2xl font-bold tracking-tight">{item.word}</h3>
        <button
          type="button"
          onClick={() => onSpeak(item.word)}
          className="vocab-chip inline-flex h-8 w-8 items-center justify-center rounded-lg transition"
          aria-label={`Pronounce ${item.word}`}
        >
          <Volume2 className="h-4 w-4" aria-hidden />
        </button>
        <span className="vocab-chip rounded-lg px-2.5 py-1 text-xs font-medium">
          {posLabel(item.partOfSpeech)}
        </span>
      </div>

      <p className="vocab-phonetic mt-2 text-sm">{item.phonetic}</p>

      <p className="vocab-example-label mt-4 text-sm font-semibold">Example</p>
      <p className="vocab-example mt-1 text-sm leading-relaxed">{item.example}</p>

      <div className="mt-4">
        {saved ? (
          <span className="vocab-learned inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-semibold">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            </span>
            Learned
          </span>
        ) : (
          <span className="vocab-learn inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold">
            Learn
          </span>
        )}
      </div>
    </article>
  )
}
