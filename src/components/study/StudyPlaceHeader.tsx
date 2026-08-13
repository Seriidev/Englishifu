import { Bell, Star, User } from 'lucide-react'
import type { CefrLevel } from '../../types/cefr'
import CefrLevelBadge from '../profile/CefrLevelBadge'

export interface StudyPlaceHeaderProps {
  fullName: string
  cefrLevel?: CefrLevel
  xp: number
  hasNotifications: boolean
  avatarUrl?: string
  isOnline?: boolean
}

export default function StudyPlaceHeader({
  fullName,
  cefrLevel,
  xp,
  hasNotifications,
  avatarUrl,
  isOnline = true,
}: StudyPlaceHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            {fullName}
          </h1>
          {cefrLevel ? <CefrLevelBadge level={cefrLevel} size="lg" /> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-slate-200">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
          {xp} XP
        </span>

        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" aria-hidden />
          {hasNotifications ? (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-800" />
          ) : null}
        </button>

        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-2 ring-white dark:bg-indigo-950 dark:text-indigo-300 dark:ring-slate-800">
              <User className="h-4 w-4" aria-hidden />
            </span>
          )}
          {isOnline ? (
            <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
          ) : null}
        </div>
      </div>
    </header>
  )
}
