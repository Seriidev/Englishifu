import { Link } from 'react-router-dom'
import type { TestAnalysis } from '../../../scoring/testAnalysis'

interface TestWeaknessCardProps {
  analysis: TestAnalysis
}

export default function TestWeaknessCard({ analysis }: TestWeaknessCardProps) {
  return (
    <section>
      <h2 className="text-base font-bold text-slate-900">
        Where you are weak
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        After a full test, this list names the parts that need work.
      </p>

      <div className="mt-3">
        {!analysis.hasResult ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            Finish the full test above. We will mark weak sections and the
            exact question types to practice.
          </p>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
            {analysis.weakSpots.map((spot) => (
              <article
                key={spot.id}
                className="flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {spot.section}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400">
                    Band {spot.band.toFixed(1)}
                  </p>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-500">
                  {spot.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link
                  to={spot.practicePath}
                  className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                >
                  Practice this section
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
