import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import StudySidebar from './StudySidebar'
import StudyPlaceHeader from './StudyPlaceHeader'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeContext'
import { mockStudyHeaderStats } from '../../mocks/studyPlaceMock'

export default function StudyPlaceLayout() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const student = user?.role === 'student' ? user : null
  const closeMobile = () => setMobileOpen(false)

  return (
    <div
      className={`study-place flex min-h-svh bg-slate-50 dark:bg-slate-950 ${isDark ? 'dark' : ''}`}
    >
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
        <StudySidebar activePath={location.pathname} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close sidebar"
            onClick={closeMobile}
          />
          <div className="absolute inset-y-0 left-0 flex w-60 shadow-xl">
            <StudySidebar
              activePath={location.pathname}
              onNavigate={closeMobile}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-100 bg-slate-50/90 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label="Open menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Study Place
          </p>
        </div>

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <StudyPlaceHeader
            fullName={student?.fullName ?? user?.fullName ?? 'Student'}
            cefrLevel={student?.cefrLevel}
            xp={mockStudyHeaderStats.xp}
            hasNotifications={mockStudyHeaderStats.hasNotifications}
            avatarUrl={user?.avatarUrl}
            isOnline
          />
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
