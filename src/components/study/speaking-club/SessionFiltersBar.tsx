import { useSearchParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import SearchField from '../../shared/SearchField'
import LibraryFilterMenu from '../library/LibraryFilterMenu'
import {
  SPEAKING_LEVELS,
  SPEAKING_TOPICS,
} from '../../../mocks/speakingClubMock'

function withAll(items: string[], allLabel: string) {
  return [
    ...items.map((item) => ({ id: item, label: item })),
    { id: '', label: allLabel },
  ]
}

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
        <SearchField
          wrapperClassName="min-w-[180px] flex-1 sm:max-w-xs"
          placeholder="Search sessions..."
          value={params.get('q') ?? ''}
          onChange={(e) => setKey('q', e.target.value)}
        />

        <LibraryFilterMenu
          label="All topics"
          value={params.get('topic') ?? ''}
          defaultValue=""
          options={withAll(SPEAKING_TOPICS, 'All topics')}
          onChange={(value) => setKey('topic', value)}
        />
        <LibraryFilterMenu
          label="All levels"
          value={params.get('level') ?? ''}
          defaultValue=""
          options={withAll(SPEAKING_LEVELS, 'All levels')}
          onChange={(value) => setKey('level', value)}
        />
        <LibraryFilterMenu
          label="All dates"
          value={params.get('date') ?? ''}
          defaultValue=""
          options={[
            { id: 'today', label: 'Today' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'week', label: 'This week' },
            { id: '', label: 'All dates' },
          ]}
          onChange={(value) => setKey('date', value)}
        />
        <LibraryFilterMenu
          label="All times"
          value={params.get('time') ?? ''}
          defaultValue=""
          options={[
            { id: 'morning', label: 'Morning' },
            { id: 'afternoon', label: 'Afternoon' },
            { id: 'evening', label: 'Evening' },
            { id: '', label: 'All times' },
          ]}
          onChange={(value) => setKey('time', value)}
        />
        <LibraryFilterMenu
          label="All seats"
          value={params.get('availability') ?? ''}
          defaultValue=""
          options={[
            { id: 'open', label: 'Open seats' },
            { id: '', label: 'All seats' },
          ]}
          onChange={(value) => setKey('availability', value)}
        />
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
