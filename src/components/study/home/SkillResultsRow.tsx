import type { SkillResultItem } from '../../../types/studyPlace'

interface SkillResultsRowProps {
  results: SkillResultItem[]
}

export default function SkillResultsRow({ results }: SkillResultsRowProps) {
  return (
    <section>
      <h2 className="text-base font-bold text-slate-900">
        Your results
      </h2>
      <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {results.map((item) => (
          <article
            key={item.id}
            className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-3 text-center shadow-sm sm:px-4 sm:py-4"
          >
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              {item.score}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {item.label}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
