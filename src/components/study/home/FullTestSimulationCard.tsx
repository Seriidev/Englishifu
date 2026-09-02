import { Link } from 'react-router-dom'

export default function FullTestSimulationCard() {
  return (
    <section className="flex flex-col gap-4 rounded-[22px] bg-indigo-500 px-5 py-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 dark:bg-indigo-600">
      <div className="min-w-0 max-w-xl">
        <h2 className="text-lg font-bold text-white sm:text-xl">Full Test Simulation</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-white/80">
          Take all four sections back-to-back — about 2 hours, with a short
          break in the middle. When you finish, download a PDF of your results.
        </p>
        <p className="mt-3 text-xs font-medium text-indigo-100">
          Reading → Listening → break → Speaking → Writing
        </p>
      </div>
      <Link
        to="/full-test"
        className="keep-white inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
      >
        Start Full Test
      </Link>
    </section>
  )
}
