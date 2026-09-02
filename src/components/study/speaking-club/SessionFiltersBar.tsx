import { useSearchParams } from 'react-router-dom'
import { RotateCcw, Search } from 'lucide-react'
import {
  SPEAKING_LEVELS,
  SPEAKING_TOPICS,
} from '../../../mocks/speakingClubMock'

const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

export default function SessionFiltersBar() {
  const [params, setParams] = useSearchParams()

  const setKey = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const reset = () => {
    const chip = params.get('day')
    const next = new URLSearchParams()
    if (chip) next.set('day', chip)
    setParams(next, { replace: true })
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search sessions..."
            value={params.get('q') ?? ''}
            onChange={(e) => setKey('q', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <select
          className={selectClass}
          value={params.get('topic') ?? ''}
          onChange={(e) => setKey('topic', e.target.value)}
          aria-label="Topic"
        >
          <option value="">Topic</option>
          {SPEAKING_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={params.get('level') ?? ''}
          onChange={(e) => setKey('level', e.target.value)}
          aria-label="Level"
        >
          <option value="">Level</option>
          {SPEAKING_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={params.get('date') ?? ''}
          onChange={(e) => setKey('date', e.target.value)}
          aria-label="Date"
        >
          <option value="">Date</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="week">This week</option>
        </select>

        <select
          className={selectClass}
          value={params.get('time') ?? ''}
          onChange={(e) => setKey('time', e.target.value)}
          aria-label="Time"
        >
          <option value="">Time</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>

        <select
          className={selectClass}
          value={params.get('availability') ?? ''}
          onChange={(e) => setKey('availability', e.target.value)}
          aria-label="Availability"
        >
          <option value="">Availability</option>
          <option value="open">Open seats</option>
        </select>
      </div>

      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        Reset
      </button>
    </div>
  )
}
