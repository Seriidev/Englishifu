import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'
import TutorFiltersBar from '../components/study/tutors/TutorFiltersBar'
import TutorCard from '../components/study/tutors/TutorCard'
import TutorGridPagination from '../components/study/tutors/TutorGridPagination'
import {
  TUTOR_PRICE_PRESETS,
} from '../mocks/tutorListingsMock'
import type { TutorListingCard, TutorSortBy, TutorViewMode } from '../types/tutorListing'
import { fetchApprovedTutors, fetchTutorReviews } from '../utils/platformApi'

const PAGE_SIZE = 8
const FAV_KEY = 'englishcore_tutor_favorites_v1'

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveFavorites(ids: Set<string>) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...ids]))
}

export default function FindTutorPage() {
  const [params, setParams] = useSearchParams()
  const [favorites, setFavorites] = useState(() => loadFavorites())
  const [viewMode, setViewMode] = useState<TutorViewMode>('grid')
  const [tutors, setTutors] = useState<TutorListingCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchApprovedTutors()
      .then((rows) => {
        if (!cancelled) setTutors(rows)
      })
      .catch(() => {
        if (!cancelled) setTutors([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const specialization = params.get('specialization') ?? ''
  const priceLabel = params.get('price') ?? ''
  const minRating = Number(params.get('rating') ?? '0') || 0
  const availability = params.get('availability') ?? 'any'
  const language = params.get('language') ?? ''
  const sortBy = (params.get('sort') as TutorSortBy) || 'recommended'

  const filtered = useMemo(() => {
    let list = [...tutors]

    if (specialization) {
      list = list.filter((t) => t.specialtyTags.includes(specialization))
    }

    const preset = TUTOR_PRICE_PRESETS.find((p) => p.label === priceLabel)
    if (preset?.range) {
      const [min, max] = preset.range
      list = list.filter((t) => t.pricePerHour >= min && t.pricePerHour <= max)
    }

    if (minRating > 0) {
      list = list.filter((t) => t.rating >= minRating)
    }

    if (availability === 'online') {
      list = list.filter((t) => t.availabilityStatus === 'online')
    }

    if (language) {
      list = list.filter((t) => t.languages.includes(language))
    }

    const availabilityRank = { online: 0, busy: 1, away: 2 }

    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => a.pricePerHour - b.pricePerHour)
        break
      case 'price-high':
        list.sort((a, b) => b.pricePerHour - a.pricePerHour)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
        break
      case 'availability':
        list.sort(
          (a, b) =>
            availabilityRank[a.availabilityStatus] -
            availabilityRank[b.availabilityStatus],
        )
        break
      default:
        list.sort((a, b) => {
          if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1
          return b.rating - a.rating
        })
    }

    return list
  }, [tutors, specialization, priceLabel, minRating, availability, language, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const [liveRatings, setLiveRatings] = useState<
    Record<string, { rating: number; reviewsCount: number }>
  >({})

  const pageHandlesKey = pageItems.map((t) => t.handle).join(',')

  useEffect(() => {
    let cancelled = false
    const handles = pageHandlesKey ? pageHandlesKey.split(',') : []
    void Promise.all(
      handles.map(async (handle) => {
        try {
          const data = await fetchTutorReviews(handle)
          return [
            handle.toLowerCase(),
            { rating: data.averageRating, reviewsCount: data.totalReviews },
          ] as const
        } catch {
          return null
        }
      }),
    ).then((entries) => {
      if (cancelled) return
      setLiveRatings((prev) => {
        const next = { ...prev }
        for (const entry of entries) {
          if (!entry) continue
          const [handle, stats] = entry
          if (stats.reviewsCount > 0) next[handle] = stats
        }
        return next
      })
    })
    return () => {
      cancelled = true
    }
  }, [pageHandlesKey])

  const displayItems: TutorListingCard[] = pageItems.map((tutor) => {
    const live = liveRatings[tutor.handle.toLowerCase()]
    if (!live) return tutor
    return {
      ...tutor,
      rating: live.rating,
      reviewsCount: live.reviewsCount,
    }
  })

  const setPage = (next: number) => {
    const n = new URLSearchParams(params)
    if (next <= 1) n.delete('page')
    else n.set('page', String(next))
    setParams(n, { replace: true })
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveFavorites(next)
      return next
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Find a Tutor
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Find the perfect tutor and book 1-on-1 lessons that fit your goals.
        </p>
      </div>

      <TutorFiltersBar />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">
          {filtered.length} tutor{filtered.length === 1 ? '' : 's'} found
        </p>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          <span className="px-2 text-xs text-slate-400">View as:</span>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Loading tutors…
        </div>
      ) : pageItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="font-semibold text-slate-900">
            {tutors.length === 0 ? 'No tutors yet' : 'No tutors match'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {tutors.length === 0
              ? 'Approved teachers will appear here for students.'
              : 'Try resetting filters to see more results.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {displayItems.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              isFavorited={favorites.has(tutor.id)}
              onFavorite={() => toggleFavorite(tutor.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              viewMode="list"
              isFavorited={favorites.has(tutor.id)}
              onFavorite={() => toggleFavorite(tutor.id)}
            />
          ))}
        </div>
      )}

      <TutorGridPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}
