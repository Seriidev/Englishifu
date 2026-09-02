import { useEffect, useMemo, useState } from 'react'
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2'
import { useAuth } from '../auth/AuthContext'
import VocabWordCard from '../components/study/vocabulary/VocabWordCard'
import { mockToeflVocabulary } from '../mocks/studyContentMock'
import type { VocabTopic } from '../types/studyContent'
import { readSavedVocabIds, writeSavedVocabIds } from '../utils/vocabStorage'

const PAGE_SIZE = 10

const TOPICS: { id: 'all' | VocabTopic; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'academic', label: 'Academic' },
  { id: 'campus', label: 'Campus' },
  { id: 'science', label: 'Science' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'environment', label: 'Environment' },
]

export default function StudyVocabularyPage() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [topic, setTopic] = useState<'all' | VocabTopic>('all')
  const [myWordsOnly, setMyWordsOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readSavedVocabIds(userId),
  )

  useEffect(() => {
    setSavedIds(readSavedVocabIds(userId))
  }, [userId])

  const savedSet = useMemo(() => new Set(savedIds), [savedIds])

  const filtered = useMemo(() => {
    return mockToeflVocabulary.filter((item) => {
      if (myWordsOnly && !savedSet.has(item.id)) return false
      if (topic !== 'all' && item.topic !== topic) return false
      return true
    })
  }, [myWordsOnly, savedSet, topic])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [topic, myWordsOnly])

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
      writeSavedVocabIds(userId, next)
      return next
    })
  }

  const speak = (word: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(word)
    utter.lang = 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Vocabulary
        </h2>
        <button
          type="button"
          onClick={() => setMyWordsOnly((value) => !value)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            myWordsOnly
              ? 'border-indigo-500 bg-indigo-600 text-white'
              : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-500'
          }`}
          aria-pressed={myWordsOnly}
        >
          My words
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((item) => {
            const active = topic === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTopic(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            aria-label="Previous page"
          >
            <HiOutlineChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-6 text-center text-sm font-semibold text-slate-800">
            {safePage}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages || filtered.length === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            aria-label="Next page"
          >
            <HiOutlineChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {myWordsOnly
            ? 'No saved words yet. Tap + on a card to add it here.'
            : 'No words in this topic.'}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {pageItems.map((item) => (
            <li key={item.id}>
              <VocabWordCard
                item={item}
                saved={savedSet.has(item.id)}
                onToggleSave={toggleSave}
                onSpeak={speak}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
