import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2'
import StudySidebar from './StudySidebar'
import StudyPlaceHeader from './StudyPlaceHeader'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeContext'
import { syncApiSession } from '../../utils/bookingApi'
import {
  fetchStudentXpStats,
  subscribeStudentXp,
} from '../../utils/studentXp'

const SIDEBAR_COLLAPSED_KEY = 'englishcore_study_sidebar_collapsed_v1'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

export default function StudyPlaceLayout() {
  const { user, refreshUser } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const student = user?.role === 'student' ? user : null
  const studentId = student?.id
  const [xp, setXp] = useState(() => student?.xp ?? 0)
  const [boostedToday, setBoostedToday] = useState(false)
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

  useEffect(() => {
    if (!studentId) {
      setXp(0)
      setBoostedToday(false)
      return
    }

    let cancelled = false
    let synced = false
    const load = async () => {
      try {
        if (!synced && student) {
          try {
            await syncApiSession(student)
            synced = true
          } catch {
            /* cookie session may still work */
          }
        }
        const stats = await fetchStudentXpStats()
        if (cancelled) return
        setXp(stats.xp)
        setBoostedToday(stats.boostedToday)
        if ((student?.xp ?? 0) !== stats.xp) {
          void refreshUser()
        }
      } catch {
        if (!cancelled && student) setXp(student.xp ?? 0)
      }
    }

    void load()
    const interval = window.setInterval(() => void load(), 4000)
    const onFocus = () => void load()
    window.addEventListener('focus', onFocus)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVisible)
    const unsubscribe = subscribeStudentXp(() => void load(), studentId)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
      unsubscribe()
    }
  }, [student, studentId, refreshUser, location.pathname])

  return (
    <div className={`study-place flex min-h-svh bg-slate-50 ${theme === 'dark' ? 'dark' : ''}`}>
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${sidebarWidth}`}
      >
        <StudySidebar
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
            <StudySidebar
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
            <StudyPlaceHeader
              fullName={student?.fullName ?? user?.fullName ?? 'Student'}
              cefrLevel={student?.cefrLevel}
              xp={xp}
              boostedToday={boostedToday}
            />
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
