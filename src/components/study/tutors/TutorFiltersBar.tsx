import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import type { TutorSortBy } from '../../../types/tutorListing'
import {
  TUTOR_LANGUAGES,
  TUTOR_PRICE_PRESETS,
  TUTOR_SPECIALIZATIONS,
} from '../../../mocks/tutorListingsMock'

const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

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
        <select
          className={selectClass}
          value={values.specialization}
          onChange={(e) => setKey('specialization', e.target.value)}
          aria-label="Specialization"
        >
          <option value="">Specialization</option>
          {TUTOR_SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={values.price}
          onChange={(e) => setKey('price', e.target.value)}
          aria-label="Price range"
        >
          {TUTOR_PRICE_PRESETS.map((p) => (
            <option key={p.label} value={p.range ? p.label : ''}>
              {p.range ? p.label : 'Price range'}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={values.rating}
          onChange={(e) => setKey('rating', e.target.value)}
          aria-label="Rating"
        >
          <option value="">Rating</option>
          <option value="4.5">4.5+</option>
          <option value="4.0">4.0+</option>
          <option value="3.5">3.5+</option>
        </select>

        <select
          className={selectClass}
          value={values.availability}
          onChange={(e) => setKey('availability', e.target.value)}
          aria-label="Availability"
        >
          <option value="any">Availability</option>
          <option value="online">Online now</option>
        </select>

        <select
          className={selectClass}
          value={values.language}
          onChange={(e) => setKey('language', e.target.value)}
          aria-label="Language"
        >
          <option value="">Language</option>
          {TUTOR_LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Sort:
          <select
            className={selectClass}
            value={values.sort}
            onChange={(e) => setKey('sort', e.target.value)}
            aria-label="Sort by"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest rated</option>
            <option value="availability">Availability</option>
          </select>
        </label>
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
