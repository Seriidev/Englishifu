import { useEffect, useRef, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  Gift,
  GraduationCap,
  MessageCircle,
  Repeat,
  Star,
  Trophy,
  UserPlus,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import type { CefrLevel } from '../../types/cefr'
import { XP_REWARDS } from '../../utils/xpCalculation'
import { exchangeXpForBoost } from '../../utils/studentXp'
import CefrLevelBadge from '../profile/CefrLevelBadge'
import NotificationBell from '../shared/NotificationBell'
import ProgressGuide from './ProgressGuide'

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
}: StudyPlaceHeaderProps) {
  const [guide, setGuide] = useState<'xp' | 'boost' | null>(null)
  const [exchanging, setExchanging] = useState(false)
  const [exchangeError, setExchangeError] = useState('')
  const clusterRef = useRef<HTMLDivElement>(null)
  const canExchange = xp >= XP_REWARDS.xpForOneBoost

  const close = () => {
    setGuide(null)
    setExchangeError('')
  }

  useEffect(() => {
    if (!guide) return
    const onPointer = (event: MouseEvent) => {
      if (!clusterRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [guide])

  const onExchange = async () => {
    setExchanging(true)
    setExchangeError('')
    try {
      await exchangeXpForBoost()
      close()
    } catch (err) {
      setExchangeError(err instanceof Error ? err.message : 'Could not exchange XP')
    } finally {
      setExchanging(false)
    }
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:gap-3">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 sm:text-lg">
          {fullName}
        </h1>
        {cefrLevel ? <CefrLevelBadge level={cefrLevel} size="sm" /> : null}
      </div>

      <div
        ref={clusterRef}
        className="relative inline-flex shrink-0 items-center rounded-full border border-slate-200/80 bg-white/70 px-1 py-0.5 shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <button
          type="button"
          onClick={() => {
            setExchangeError('')
            setGuide((current) => (current === 'xp' ? null : 'xp'))
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 dark:hover:bg-white/10"
          aria-label={`${xp} XP`}
        >
          <Star className="h-4 w-4 fill-amber-300 text-amber-300" aria-hidden />
          <span key={xp}>{xp}</span>
        </button>
        <span className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-white/15" aria-hidden />
        <button
          type="button"
          onClick={() => {
            setExchangeError('')
            setGuide((current) => (current === 'boost' ? null : 'boost'))
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 dark:hover:bg-white/10"
          aria-label={`${boostCount} boosts`}
        >
          <Zap
            className={`h-4 w-4 fill-violet-400 text-violet-400 ${boostedToday ? '' : 'opacity-70'}`}
            aria-hidden
          />
          {boostCount}
        </button>
        <NotificationBell />

      {guide === 'boost' ? (
        <ProgressGuide
          title="Boosts"
          intro="Boosts mark how far you have come on the platform. Collect them to unlock the next step."
          onClose={close}
          rows={[
            {
              icon: Gift,
              title: 'Mystery gift',
              badge: '5',
              tone: 'added',
              text: '5 Boosts unlock a mystery gift.',
            },
            {
              icon: Trophy,
              title: 'Free Boost contest',
              badge: '10',
              tone: 'added',
              text: '10 Boosts let you compete with other students for a free Boost.',
            },
            {
              icon: Users,
              title: 'Student messages',
              badge: '15',
              tone: 'added',
              text: '15 Boosts let you write to other students.',
            },
            {
              icon: MessageCircle,
              title: 'New section',
              badge: '30',
              tone: 'added',
              text: '30 Boosts open a new section on the platform.',
            },
            {
              icon: GraduationCap,
              title: 'Message a teacher',
              badge: '50',
              tone: 'added',
              text: '50 Boosts let you message a teacher.',
            },
          ]}
        />
      ) : null}

      {guide === 'xp' ? (
        <ProgressGuide
          title="XP"
          intro="XP grows when you keep showing up. A Boost takes real study, not one quick visit."
          onClose={close}
          rows={[
            {
              icon: BookOpen,
              title: 'Reading a book',
              badge: 'Added',
              tone: 'added',
              text: `${XP_REWARDS.readBook} XP for each library book you open. Once per book.`,
            },
            {
              icon: Video,
              title: 'Online lesson',
              badge: 'Added',
              tone: 'added',
              text: `${XP_REWARDS.onlineLesson} XP for every completed online lesson.`,
            },
            {
              icon: UserPlus,
              title: 'Referral',
              badge: 'Added',
              tone: 'added',
              text: `${XP_REWARDS.referral} XP when a friend you invited finishes their first lesson.`,
            },
            {
              icon: CalendarDays,
              title: 'Daily visit',
              badge: 'Added',
              tone: 'added',
              text: `${XP_REWARDS.dailyLoginBonus} XP the first time you open Study Place each day.`,
            },
            {
              icon: Users,
              title: 'Speaking club',
              badge: 'Added',
              tone: 'added',
              text: `${XP_REWARDS.speakingClub} XP the first time you join a speaking club session.`,
            },
            {
              icon: Repeat,
              title: 'Exchange',
              badge: 'Deducted',
              tone: 'deducted',
              text: `${XP_REWARDS.xpForOneBoost} XP converts into 1 Boost.`,
            },
          ]}
          extra={
            canExchange ? (
              <div className="mt-4">
                {exchangeError ? (
                  <p className="mb-2 text-center text-xs text-rose-500">{exchangeError}</p>
                ) : null}
                <button
                  type="button"
                  disabled={exchanging}
                  onClick={() => void onExchange()}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
                >
                  {exchanging
                    ? 'Exchanging…'
                    : `Exchange ${XP_REWARDS.xpForOneBoost} XP`}
                </button>
              </div>
            ) : null
          }
        />
      ) : null}
      </div>
    </div>
  )
}
