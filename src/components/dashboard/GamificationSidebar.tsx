import { Flame, Snowflake, Sparkles } from 'lucide-react'
import type { CefrLevel, StudentGamificationState } from '../../types/gamification'
import LevelProgressBar from './LevelProgressBar'

const CEFR_ORDER: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface GamificationSidebarProps {
  firstName: string
  gamification: StudentGamificationState
  avatarUrl?: string
}

function CefrDots({ level }: { level: CefrLevel }) {
  const filled = CEFR_ORDER.indexOf(level) + 1
  return (
    <div className="flex gap-1" aria-label={`CEFR ${level}`}>
      {CEFR_ORDER.map((tier, i) => (
        <span
          key={tier}
          className={`h-2.5 w-2.5 rounded-full ${
            i < filled ? 'bg-brand' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function GamificationSidebar({
  firstName,
  gamification,
  avatarUrl,
}: GamificationSidebarProps) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-[#c7d7f5]/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={
              avatarUrl ??
              `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(firstName)}`
            }
            alt=""
            className="h-14 w-14 rounded-full border-2 border-brand-light bg-brand-light object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-ink">{firstName}</p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                Free
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-ink">
                <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
                {gamification.tokens} Tokens
              </span>
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-end justify-between">
            <p className="text-2xl font-bold text-ink">Lvl {gamification.level}</p>
            <p className="text-xs font-medium text-muted">Level XP</p>
          </div>
          <LevelProgressBar
            current={gamification.currentXP}
            max={gamification.xpToNextLevel}
            color="blue"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#c7d7f5]/80 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold tracking-wide text-brand uppercase">
          CEFR Level
        </p>
        <p className="mt-2 text-xl font-bold text-ink">{gamification.cefrLevel}</p>
        <p className="mt-0.5 text-sm text-muted">
          {gamification.cefrLevel === 'A1' || gamification.cefrLevel === 'A2'
            ? 'Beginner'
            : gamification.cefrLevel === 'B1' || gamification.cefrLevel === 'B2'
              ? 'Intermediate'
              : gamification.cefrLevel === 'C1'
                ? 'Advanced'
                : 'Proficiency'}
        </p>
        <div className="mt-3">
          <CefrDots level={gamification.cefrLevel} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#c7d7f5]/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold tracking-wide text-brand uppercase">
              Weekly Streak
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xl font-bold text-ink">
              <Flame className="h-5 w-5 text-orange-500" aria-hidden />
              {gamification.weeklyStreak}{' '}
              {gamification.weeklyStreak === 1 ? 'week' : 'weeks'}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
            <Snowflake className="h-3.5 w-3.5" aria-hidden />
            {gamification.streakFreezesAvailable}
          </div>
        </div>
        <div className="mt-4">
          <LevelProgressBar
            current={gamification.weeklyXP}
            max={gamification.weeklyXPGoal}
            label="Weekly XP"
            color="purple"
          />
        </div>
      </div>
    </aside>
  )
}
