import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  Headphones,
  Lock,
  Mic,
  PenLine,
  type LucideIcon,
} from 'lucide-react'
import type {
  CourseSectionProgress,
  SectionType,
} from '../../types/gamification'

const SECTION_ICONS: Record<SectionType, LucideIcon> = {
  reading: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenLine,
  theory: FileText,
}

interface CourseStructureListProps {
  sections: CourseSectionProgress[]
}

function CourseStructureRow({ section }: { section: CourseSectionProgress }) {
  const Icon = SECTION_ICONS[section.type]
  const isLocked = section.status === 'locked'
  const isDone = section.status === 'completed'
  const isCurrent = section.status === 'in-progress'

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-2 py-2.5 ${
        isCurrent ? 'bg-brand-light/70' : ''
      } ${isLocked ? 'opacity-45' : ''}`}
    >
      {isDone ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
      ) : isLocked ? (
        <Lock className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
      ) : isCurrent ? (
        <Icon className="h-5 w-5 shrink-0 text-brand" aria-hidden />
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-slate-300" aria-hidden />
      )}
      <span
        className={
          isCurrent
            ? 'text-sm font-semibold text-ink'
            : isDone
              ? 'text-sm font-medium text-ink'
              : 'text-sm text-muted'
        }
      >
        {section.title}
        {isCurrent ? (
          <span className="ml-2 text-xs font-semibold text-brand">Current</span>
        ) : null}
      </span>
    </div>
  )
}

export default function CourseStructureList({
  sections,
}: CourseStructureListProps) {
  const [open, setOpen] = useState(true)
  const doneCount = sections.filter((s) => s.status === 'completed').length

  return (
    <div className="rounded-2xl border border-[#c7d7f5]/80 bg-white p-4 shadow-sm sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <h3 className="text-base font-bold text-ink">Course Structure</h3>
          <p className="mt-0.5 text-xs text-muted">
            {doneCount}/{sections.length} sections complete
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="mt-3 space-y-0.5 border-t border-gray-100 pt-3">
          {sections.map((section) => (
            <CourseStructureRow key={section.id} section={section} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
