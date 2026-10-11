import { Link } from 'react-router-dom'
import type { PracticeExerciseItem } from '../../../types/studyPlace'
import { STUDY_RETURN_STATE } from '../../../utils/sectionReturn'

interface PracticeExercisesListProps {
  items: PracticeExerciseItem[]
}

export default function PracticeExercisesList({
  items,
}: PracticeExercisesListProps) {
  return (
    <section className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <h3 className="min-w-0 text-sm font-bold text-slate-900">
            {item.title}
          </h3>
          <Link
            to={item.path}
            state={STUDY_RETURN_STATE}
            className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:w-auto"
          >
            Start
          </Link>
        </article>
      ))}
    </section>
  )
}
