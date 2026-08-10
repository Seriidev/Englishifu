import { Link } from 'react-router-dom'

interface PracticeConnectGrowBannerProps {
  hasPremium?: boolean
}

export default function PracticeConnectGrowBanner({
  hasPremium = false,
}: PracticeConnectGrowBannerProps) {
  if (hasPremium) return null

  return (
    <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-sm sm:p-8">
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <h3 className="text-2xl font-bold tracking-tight">
            Practice. Connect. Grow.
          </h3>
          <p className="mt-2 text-sm text-indigo-100">
            Unlock unlimited Speaking Club seats and priority booking with
            Premium.
          </p>
          <Link
            to="/study/settings"
            className="mt-4 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            onClick={() => console.log('Explore Premium stub')}
          >
            Explore Premium
          </Link>
        </div>

        <svg
          viewBox="0 0 200 120"
          className="h-24 w-40 shrink-0 opacity-95 sm:h-28 sm:w-48"
          aria-hidden
        >
          <circle cx="50" cy="70" r="28" fill="#C7D2FE" />
          <circle cx="50" cy="48" r="16" fill="#E0E7FF" />
          <circle cx="100" cy="65" r="32" fill="#A5B4FC" />
          <circle cx="100" cy="40" r="18" fill="#EEF2FF" />
          <circle cx="150" cy="72" r="26" fill="#818CF8" />
          <circle cx="150" cy="50" r="15" fill="#C7D2FE" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-white/10" />
    </section>
  )
}
