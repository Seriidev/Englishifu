import { ArrowRight, Clock } from 'lucide-react'
import type { CurrentCourseProgress } from '../../types/gamification'
import LevelProgressBar from './LevelProgressBar'

interface CurrentCourseCardProps {
  course: CurrentCourseProgress
  onContinue?: () => void
}

export default function CurrentCourseCard({
  course,
  onContinue,
}: CurrentCourseCardProps) {
  return (
    <button
      type="button"
      onClick={onContinue}
      className="group flex w-full items-stretch gap-4 rounded-2xl border border-[#c7d7f5]/80 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md hover:shadow-brand/10 sm:p-5"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-light sm:h-24 sm:w-24">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          In Progress
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-bold text-ink">
          {course.courseTitle}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted sm:text-sm">
          <span className="rounded-full bg-brand-light px-2 py-0.5 font-semibold text-brand">
            {course.difficultyTag}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {course.estimatedMinutes} min
          </span>
        </p>
        <div className="mt-3">
          <LevelProgressBar
            current={course.overallProgressPercent}
            max={100}
            label="Progress"
            color="blue"
            showValues={false}
          />
          <p className="mt-1 text-xs font-semibold text-brand">
            {course.overallProgressPercent}%
          </p>
        </div>
      </div>

      <span className="flex shrink-0 items-center self-center text-brand transition group-hover:translate-x-0.5">
        <ArrowRight className="h-5 w-5" aria-hidden />
      </span>
    </button>
  )
}
