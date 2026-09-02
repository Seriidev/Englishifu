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
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {results.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-100 bg-white px-4 py-4 text-center shadow-sm"
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
