import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2'
import TutorSidebar from './TutorSidebar'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeContext'
import { isTutorProfileComplete } from '../../types/user'
import NotificationBell from '../shared/NotificationBell'
import TutorApprovedModal from './TutorApprovedModal'

const SIDEBAR_COLLAPSED_KEY = 'englishcore_tutor_sidebar_collapsed_v1'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

export default function TutorWorkspaceLayout() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const tutor = user?.role === 'tutor' ? user : null
  const closeMobile = () => setMobileOpen(false)
  const sidebarWidth = collapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'
  const contentPad = collapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  if (tutor && tutor.status === 'incomplete' && !isTutorProfileComplete(tutor)) {
    return <Navigate to="/tutor/complete-profile" replace />
  }

  return (
    <div className={`study-place flex min-h-svh bg-slate-50 ${theme === 'dark' ? 'dark' : ''}`}>
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${sidebarWidth}`}
      >
        <TutorSidebar
          activePath={location.pathname}
          collapsed={collapsed}
          onMenuClick={() => setCollapsed((value) => !value)}
        />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close sidebar"
            onClick={closeMobile}
          />
          <div className="absolute inset-y-0 left-0 flex shadow-xl">
            <TutorSidebar
              activePath={location.pathname}
              onMenuClick={closeMobile}
              onNavigate={closeMobile}
            />
          </div>
        </div>
      ) : null}

      <div className={`flex min-w-0 flex-1 flex-col ${contentPad}`}>
        <header className="study-header sticky top-0 z-30 border-b border-slate-100 bg-slate-50/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-700 hover:bg-white lg:hidden"
              aria-label="Open menu"
            >
              {mobileOpen ? (
                <HiOutlineXMark className="h-6 w-6" />
              ) : (
                <HiOutlineBars3 className="h-6 w-6" />
              )}
            </button>
            <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              {tutor?.fullName ?? 'Teacher'}
            </h1>
            <NotificationBell buttonClassName="border-0 bg-transparent text-slate-800 hover:bg-slate-100" />
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </div>
      <TutorApprovedModal />
    </div>
  )
}
