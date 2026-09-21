import { Sparkles, Zap } from 'lucide-react'
import type { CefrLevel } from '../../types/cefr'
import { XP_REWARDS } from '../../utils/xpCalculation'
import CefrLevelBadge from '../profile/CefrLevelBadge'
import NotificationBell from '../shared/NotificationBell'

export interface StudyPlaceHeaderProps {
  fullName: string
  cefrLevel?: CefrLevel
  xp: number
  boostCount?: number
  boostedToday?: boolean
  dailyBonusClaimedToday?: boolean
}

export default function StudyPlaceHeader({
  fullName,
  cefrLevel,
  xp,
  boostCount = 0,
  boostedToday = false,
  dailyBonusClaimedToday = false,
}: StudyPlaceHeaderProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:gap-3">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 sm:text-lg">
          {fullName}
        </h1>
        {cefrLevel ? <CefrLevelBadge level={cefrLevel} size="sm" /> : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <span
          key={xp}
          className="pill-accent inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold sm:px-3 sm:py-1.5 sm:text-sm"
        >
          XP {xp}
        </span>
        <span
          className={`hidden items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold sm:inline-flex ${
            dailyBonusClaimedToday
              ? 'pill-accent'
              : 'border border-slate-200 bg-white text-slate-400'
          }`}
          title={
            dailyBonusClaimedToday
              ? `Daily visit bonus claimed (+${XP_REWARDS.dailyLoginBonus} XP)`
              : `Open Study Place to claim +${XP_REWARDS.dailyLoginBonus} XP once a day`
          }
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {dailyBonusClaimedToday
            ? `Daily +${XP_REWARDS.dailyLoginBonus}`
            : `Daily ${XP_REWARDS.dailyLoginBonus}`}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold sm:px-3 sm:py-1.5 sm:text-sm ${
            boostedToday
              ? 'pill-accent'
              : 'border border-slate-200 bg-white text-slate-400'
          }`}
          title={
            boostCount
              ? `You've received ${boostCount} boost${boostCount === 1 ? '' : 's'} from teachers and admins`
              : 'A teacher or admin can boost you once a day'
          }
        >
          <Zap
            className={`h-3.5 w-3.5 ${boostedToday ? 'fill-current' : ''}`}
            aria-hidden
          />
          <span>
            Boost {boostCount}
          </span>
        </span>
        <NotificationBell />
      </div>
    </div>
  )
}
