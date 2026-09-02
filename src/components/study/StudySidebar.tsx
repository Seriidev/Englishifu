import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { IconType } from 'react-icons'
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineBookOpen,
  HiOutlineChartBarSquare,
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineEllipsisHorizontal,
  HiOutlineHome,
  HiOutlineLanguage,
  HiOutlineMicrophone,
  HiOutlinePencilSquare,
  HiOutlineQuestionMarkCircle,
  HiOutlineTrophy,
  HiOutlineUser,
  HiOutlineUserGroup,
} from 'react-icons/hi2'
import { useAuth } from '../../auth/AuthContext'
import { studentPublicProfilePath } from '../../utils/authStorage'
import StudyPlaceLogo from './StudyPlaceLogo'
import ThemeToggle from '../shared/ThemeToggle'

interface SidebarItem {
  icon: IconType
  label: string
  path: string
  state?: Record<string, string>
  match?: (pathname: string) => boolean
}

interface StudySidebarProps {
  activePath: string
  collapsed?: boolean
  onMenuClick?: () => void
  onNavigate?: () => void
}

const PRIMARY: SidebarItem[] = [
  {
    icon: HiOutlineHome,
    label: 'Dashboard',
    path: '/study',
    match: (p) => p === '/study',
  },
  { icon: HiOutlineUserGroup, label: 'Find a Tutor', path: '/study/tutors' },
  {
    icon: HiOutlineMicrophone,
    label: 'Speaking Club',
    path: '/study/speaking-club',
  },
  {
    icon: HiOutlineChartBarSquare,
    label: 'Leaderboard',
    path: '/study/leaderboard',
  },
  {
    icon: HiOutlinePencilSquare,
    label: 'Essay',
    path: '/study/essay',
    match: (p) => p.startsWith('/study/essay'),
  },
  {
    icon: HiOutlineLanguage,
    label: 'Vocabulary',
    path: '/study/vocabulary',
  },
  {
    icon: HiOutlineBookOpen,
    label: 'Library',
    path: '/study/library',
  },
]

const SECONDARY: SidebarItem[] = [
  {
    icon: HiOutlineClipboardDocumentList,
    label: 'Level Test',
    path: '/study/level-test',
    match: (p) => p.startsWith('/study/level-test'),
  },
  { icon: HiOutlineTrophy, label: 'Badges', path: '/study/badges' },
  {
    icon: HiOutlineCheckBadge,
    label: 'Certificates',
    path: '/study/certificates',
    match: (p) => p.startsWith('/study/certificates'),
  },
]

function isItemActive(item: SidebarItem, pathname: string) {
  return item.match ? item.match(pathname) : pathname.startsWith(item.path)
}

function itemClass(active: boolean, collapsed: boolean) {
  return [
    'flex items-center rounded-[10px] text-sm font-medium transition-colors',
    collapsed ? 'h-10 w-10 justify-center' : 'h-10 gap-4 px-3',
    active
      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
      : 'text-slate-500 hover:bg-slate-50',
  ].join(' ')
}

export default function StudySidebar({
  activePath,
  collapsed = false,
  onMenuClick,
  onNavigate,
}: StudySidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const profilePath =
    user?.role === 'student' && user.handle
      ? studentPublicProfilePath(user.handle)
      : '/profile'
  const displayName = user?.fullName?.trim() || 'Student'
  const initial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const go = (path: string, state?: Record<string, string>) => {
    setMenuOpen(false)
    onNavigate?.()
    navigate(path, state ? { state } : undefined)
  }

  const renderGroup = (items: SidebarItem[]) =>
    items.map((item) => {
      const Icon = item.icon
      const active = isItemActive(item, activePath)
      return (
        <NavLink
          key={item.label}
          to={item.path}
          state={item.state}
          title={item.label}
          onClick={onNavigate}
          className={itemClass(active, collapsed)}
        >
          <Icon className="h-[22px] w-[22px] shrink-0" aria-hidden />
          <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
        </NavLink>
      )
    })

  return (
    <aside
      className={`study-sidebar flex h-full flex-col border-r border-slate-200 bg-white text-slate-900 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      <div
        className={`flex shrink-0 items-center py-3 ${collapsed ? 'justify-center px-2' : 'gap-4 px-4'}`}
      >
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <HiOutlineBars3 className="h-6 w-6" aria-hidden />
        </button>
        {collapsed ? null : <StudyPlaceLogo />}
      </div>

      <nav
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${collapsed ? 'items-center gap-1 px-2' : 'gap-0.5 px-3'}`}
        aria-label="Study"
      >
        {renderGroup(PRIMARY)}

        <div
          className={`my-3 h-px bg-slate-200 ${collapsed ? 'w-8' : 'mx-1'}`}
        />

        {renderGroup(SECONDARY)}

        <div
          className={`my-3 h-px bg-slate-200 ${collapsed ? 'w-8' : 'mx-1'}`}
        />

        <button
          type="button"
          title={collapsed ? 'Help' : undefined}
          onClick={() => {
            onNavigate?.()
            window.open('mailto:support@englishcore.com', '_blank')
          }}
          className={itemClass(false, collapsed)}
        >
          <HiOutlineQuestionMarkCircle className="h-[22px] w-[22px] shrink-0" aria-hidden />
          <span className={collapsed ? 'sr-only' : 'truncate'}>Help</span>
        </button>
      </nav>

      <div
        className={`shrink-0 pb-3 ${collapsed ? 'flex flex-col items-center gap-3 px-2' : 'space-y-3 px-4'}`}
      >
        <ThemeToggle collapsed={collapsed} />
        <div className="relative" ref={menuRef}>
          {collapsed ? (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full"
              aria-label="Account menu"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f2] text-xs font-semibold">
                  {initial}
                </span>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                onClick={() => go(profilePath)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-xs font-semibold">
                    {initial}
                  </span>
                )}
                <span className="truncate text-sm font-medium">{displayName}</span>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-slate-50"
                aria-label="Account menu"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <HiOutlineEllipsisHorizontal className="h-5 w-5" aria-hidden />
              </button>
            </div>
          )}

          {menuOpen ? (
            <div
              role="menu"
              className={`absolute z-50 min-w-[11.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
                collapsed ? 'bottom-0 left-[calc(100%+8px)]' : 'right-0 bottom-full mb-2'
              }`}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => go(profilePath)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <HiOutlineUser className="h-4 w-4 shrink-0" aria-hidden />
                View profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => go('/study/settings')}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <HiOutlineCog6Tooth className="h-4 w-4 shrink-0" aria-hidden />
                Settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onNavigate?.()
                  void logout().then(() => navigate('/', { replace: true }))
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <HiOutlineArrowRightOnRectangle className="h-4 w-4 shrink-0" aria-hidden />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
