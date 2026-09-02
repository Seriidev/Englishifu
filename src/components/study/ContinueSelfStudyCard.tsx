interface ContinueSelfStudyCardProps {
  courseName?: string
  unitLabel?: string
  progressPercent?: number
  estimatedMinutes?: number
  onContinue: () => void
  onViewCourse: () => void
  onBrowseCourses?: () => void
  empty?: boolean
}

function BooksIllustration() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="h-28 w-36 sm:h-32 sm:w-40"
      aria-hidden
    >
      <rect x="18" y="28" width="42" height="72" rx="6" fill="#818CF8" />
      <rect x="28" y="36" width="22" height="4" rx="2" fill="#EEF2FF" opacity="0.7" />
      <rect x="28" y="46" width="18" height="3" rx="1.5" fill="#EEF2FF" opacity="0.5" />
      <rect x="52" y="20" width="48" height="80" rx="6" fill="#4F46E5" />
      <rect x="64" y="32" width="24" height="5" rx="2.5" fill="#C7D2FE" opacity="0.8" />
      <rect x="64" y="44" width="20" height="3" rx="1.5" fill="#C7D2FE" opacity="0.55" />
      <rect x="64" y="52" width="16" height="3" rx="1.5" fill="#C7D2FE" opacity="0.4" />
      <rect x="92" y="34" width="40" height="66" rx="6" fill="#A5B4FC" />
      <rect x="102" y="44" width="20" height="4" rx="2" fill="#EEF2FF" opacity="0.7" />
      <circle cx="128" cy="28" r="14" fill="#FDE68A" opacity="0.9" />
      <circle cx="36" cy="22" r="8" fill="#FBCFE8" opacity="0.85" />
    </svg>
  )
}

export default function ContinueSelfStudyCard({
  courseName,
  unitLabel,
  progressPercent = 0,
  estimatedMinutes = 0,
  onContinue,
  onViewCourse,
  onBrowseCourses,
  empty = false,
}: ContinueSelfStudyCardProps) {
  if (empty) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
              Self-Study
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
              Get started with your first course
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Build skills at your own pace with structured TOEFL and CEFR
              pathways.
            </p>
            <button
              type="button"
              onClick={onBrowseCourses ?? onViewCourse}
              className="mt-4 inline-flex items-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
            >
              Browse Courses
            </button>
          </div>
          <div className="hidden shrink-0 sm:block">
            <BooksIllustration />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            Continue Self-Study
          </p>
          <h2 className="mt-1 truncate text-lg font-bold text-slate-900 sm:text-xl">
            {courseName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{unitLabel}</p>

          <div className="mt-4 max-w-md">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>{progressPercent}% complete</span>
              <span>~{estimatedMinutes} min left</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
          <div className="hidden shrink-0 md:block">
            <BooksIllustration />
          </div>
          <div className="flex flex-col gap-2 sm:min-w-[160px]">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
            >
              Continue Learning →
            </button>
            <button
              type="button"
              onClick={onViewCourse}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Course
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
