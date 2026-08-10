import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import SessionFiltersBar from '../components/study/speaking-club/SessionFiltersBar'
import SessionRow from '../components/study/speaking-club/SessionRow'
import HowItWorksCard from '../components/study/speaking-club/HowItWorksCard'
import MyBookedSessionsWidget from '../components/study/speaking-club/MyBookedSessionsWidget'
import PracticeConnectGrowBanner from '../components/study/speaking-club/PracticeConnectGrowBanner'
import { mockSpeakingClubSessions } from '../mocks/speakingClubMock'
import type { SpeakingClubSession } from '../types/speakingClubSession'

type DayChip = 'today' | 'tomorrow' | 'this-week' | 'all'

const DAY_CHIPS: { id: DayChip; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'this-week', label: 'This Week' },
  { id: 'all', label: 'All' },
]

function parseHour(time: string): number {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 12
  let h = Number(m[1])
  const ampm = m[3].toUpperCase()
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h
}

export default function SpeakingClubPage() {
  const [params, setParams] = useSearchParams()
  const [sessions, setSessions] = useState(mockSpeakingClubSessions)
  const [showAll, setShowAll] = useState(false)

  const dayChip = (params.get('day') as DayChip) || 'all'
  const q = (params.get('q') ?? '').trim().toLowerCase()
  const topic = params.get('topic') ?? ''
  const level = params.get('level') ?? ''
  const date = params.get('date') ?? ''
  const time = params.get('time') ?? ''
  const availability = params.get('availability') ?? ''

  const filtered = useMemo(() => {
    let list: SpeakingClubSession[] = [...sessions]

    if (dayChip === 'today') list = list.filter((s) => s.dayGroup === 'today')
    else if (dayChip === 'tomorrow')
      list = list.filter((s) => s.dayGroup === 'tomorrow')
    else if (dayChip === 'this-week')
      list = list.filter(
        (s) =>
          s.dayGroup === 'today' ||
          s.dayGroup === 'tomorrow' ||
          s.dayGroup === 'this-week',
      )

    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.hostName.toLowerCase().includes(q) ||
          s.topicTags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    if (topic) list = list.filter((s) => s.topicTags.includes(topic))
    if (level) list = list.filter((s) => s.levelTag === level)

    if (date === 'today') list = list.filter((s) => s.dayGroup === 'today')
    if (date === 'tomorrow')
      list = list.filter((s) => s.dayGroup === 'tomorrow')
    if (date === 'week')
      list = list.filter((s) => s.dayGroup !== 'later')

    if (time === 'morning')
      list = list.filter((s) => parseHour(s.time) < 12)
    if (time === 'afternoon')
      list = list.filter((s) => {
        const h = parseHour(s.time)
        return h >= 12 && h < 17
      })
    if (time === 'evening')
      list = list.filter((s) => parseHour(s.time) >= 17)

    if (availability === 'open')
      list = list.filter((s) => s.spotsFilled < s.spotsTotal)

    return list
  }, [sessions, dayChip, q, topic, level, date, time, availability])

  const visible = showAll ? filtered : filtered.slice(0, 5)

  const setDay = (id: DayChip) => {
    const next = new URLSearchParams(params)
    if (id === 'all') next.delete('day')
    else next.set('day', id)
    setParams(next, { replace: true })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Find a Speaking Club
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Join live group sessions and practice English in real conversations.
        </p>
      </div>

      <SessionFiltersBar />

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  <span aria-hidden>📅 </span>Upcoming Sessions
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  All times shown in your local timezone (GMT +5)
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DAY_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setDay(chip.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      dayChip === chip.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2">
              {visible.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No sessions match your filters.
                </p>
              ) : (
                visible.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    onJoin={() =>
                      console.log('Join Session stub', session.id)
                    }
                    onSave={() =>
                      setSessions((prev) =>
                        prev.map((s) =>
                          s.id === session.id
                            ? { ...s, isSaved: !s.isSaved }
                            : s,
                        ),
                      )
                    }
                  />
                ))
              )}
            </div>

            {filtered.length > 5 ? (
              <div className="mt-2 flex justify-center border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {showAll ? 'Show fewer sessions' : 'View all sessions'}
                  <ChevronDown
                    className={`h-4 w-4 transition ${showAll ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
              </div>
            ) : null}
          </div>

          <PracticeConnectGrowBanner />
        </div>

        <div className="space-y-4">
          <HowItWorksCard />
          <MyBookedSessionsWidget />
        </div>
      </div>
    </div>
  )
}
