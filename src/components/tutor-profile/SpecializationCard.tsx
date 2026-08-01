import { Star, Users } from 'lucide-react'
import {
  SKILL_COLORS,
  SKILL_LABELS,
  type TutorSpecialization,
} from '../../types/tutorProfile'

interface SpecializationCardProps {
  specialization: TutorSpecialization
}

export default function SpecializationCard({
  specialization,
}: SpecializationCardProps) {
  const popular = specialization.studentsEnrolled >= 20
  const color = SKILL_COLORS[specialization.skillTag]

  return (
    <article className="flex flex-col rounded-2xl border border-[#c7d7f5]/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-ink">{specialization.title}</h3>
        {popular ? (
          <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand uppercase">
            Popular
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
        {specialization.description}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          {SKILL_LABELS[specialization.skillTag]}
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1 font-semibold text-ink">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {specialization.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {specialization.studentsEnrolled}
          </span>
        </span>
      </div>
    </article>
  )
}
