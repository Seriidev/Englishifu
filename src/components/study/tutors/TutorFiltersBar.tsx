import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import type { TutorSortBy } from '../../../types/tutorListing'
import {
  TUTOR_LANGUAGES,
  TUTOR_PRICE_PRESETS,
  TUTOR_SPECIALIZATIONS,
} from '../../../mocks/tutorListingsMock'
import LibraryFilterMenu from '../library/LibraryFilterMenu'

const SORT_OPTIONS: { id: TutorSortBy; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'availability', label: 'Availability' },
]

export default function TutorFiltersBar() {
  const [params, setParams] = useSearchParams()

  const values = useMemo(
    () => ({
      specialization: params.get('specialization') ?? '',
      price: params.get('price') ?? '',
      rating: params.get('rating') ?? '',
      availability: params.get('availability') ?? 'any',
      language: params.get('language') ?? '',
      sort: (params.get('sort') as TutorSortBy) || 'recommended',
    }),
    [params],
  )

  const setKey = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'any' || value === 'recommended') {
      if (key === 'sort' && value === 'recommended') next.delete(key)
      else if (key !== 'sort') next.delete(key)
      else next.set(key, value)
    } else {
      next.set(key, value)
    }
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const reset = () => setParams({}, { replace: true })

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <LibraryFilterMenu
          label="All specializations"
          value={values.specialization}
          defaultValue=""
          options={[
            ...TUTOR_SPECIALIZATIONS.map((item) => ({ id: item, label: item })),
            { id: '', label: 'All specializations' },
          ]}
          onChange={(value) => setKey('specialization', value)}
        />
        <LibraryFilterMenu
          label="Any price"
          value={values.price}
          defaultValue=""
          options={[
            ...TUTOR_PRICE_PRESETS.filter((preset) => preset.range).map(
              (preset) => ({ id: preset.label, label: preset.label }),
            ),
            { id: '', label: 'Any price' },
          ]}
          onChange={(value) => setKey('price', value)}
        />
        <LibraryFilterMenu
          label="Any rating"
          value={values.rating}
          defaultValue=""
          options={[
            { id: '4.5', label: '4.5+' },
            { id: '4.0', label: '4.0+' },
            { id: '3.5', label: '3.5+' },
            { id: '', label: 'Any rating' },
          ]}
          onChange={(value) => setKey('rating', value)}
        />
        <LibraryFilterMenu
          label="Any availability"
          value={values.availability}
          defaultValue="any"
          options={[
            { id: 'online', label: 'Online now' },
            { id: 'any', label: 'Any availability' },
          ]}
          onChange={(value) => setKey('availability', value)}
        />
        <LibraryFilterMenu
          label="All languages"
          value={values.language}
          defaultValue=""
          options={[
            ...TUTOR_LANGUAGES.map((item) => ({ id: item, label: item })),
            { id: '', label: 'All languages' },
          ]}
          onChange={(value) => setKey('language', value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          Sort:
          <LibraryFilterMenu
            label="Recommended"
            value={values.sort}
            defaultValue="recommended"
            options={SORT_OPTIONS}
            onChange={(value) => setKey('sort', value)}
          />
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
      </div>
    </div>
  )
}
