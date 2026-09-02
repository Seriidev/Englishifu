import { Zap } from 'lucide-react'
import type { CefrLevel } from '../../types/cefr'
import CefrLevelBadge from '../profile/CefrLevelBadge'
import NotificationBell from '../shared/NotificationBell'

export interface StudyPlaceHeaderProps {
  fullName: string
  cefrLevel?: CefrLevel
  xp: number
  boostedToday?: boolean
}

export default function StudyPlaceHeader({
  fullName,
  cefrLevel,
  xp,
  boostedToday = false,
}: StudyPlaceHeaderProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {fullName}
        </h1>
        {cefrLevel ? <CefrLevelBadge level={cefrLevel} size="sm" /> : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          key={xp}
          className="pill-accent inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
        >
          XP {xp}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
            boostedToday
              ? 'pill-accent'
              : 'border border-slate-200 bg-white text-slate-400'
          }`}
          title={
            boostedToday
              ? 'Your teacher boosted you today (+30 XP)'
              : 'Boost comes from your teacher after a lesson or once a day'
          }
        >
          <Zap
            className={`h-3.5 w-3.5 ${boostedToday ? 'fill-current' : ''}`}
            aria-hidden
          />
          {boostedToday ? 'Boosted +30' : 'Boost'}
        </span>
        <NotificationBell buttonClassName="border-0 bg-transparent text-slate-800 hover:bg-slate-100" />
      </div>
    </div>
  )
}
