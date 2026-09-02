import { NavLink, useNavigate } from 'react-router-dom'
import type { IconType } from 'react-icons'
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineBookOpen,
  HiOutlineCalendarDays,
  HiOutlineChartBarSquare,
  HiOutlineCheckBadge,
  HiOutlineCog6Tooth,
  HiOutlineLanguage,
  HiOutlineQuestionMarkCircle,
  HiOutlineUser,
  HiOutlineUserGroup,
  HiOutlineVideoCamera,
} from 'react-icons/hi2'
import { useAuth } from '../../auth/AuthContext'
import StudyPlaceLogo from '../study/StudyPlaceLogo'
import ThemeToggle from '../shared/ThemeToggle'

interface SidebarItem {
  icon: IconType
  label: string
  path: string
  match?: (pathname: string) => boolean
}

interface TutorSidebarProps {
  activePath: string
  collapsed?: boolean
  onMenuClick?: () => void
  onNavigate?: () => void
}

const TOP: SidebarItem[] = [
  {
    icon: HiOutlineUser,
    label: 'Profile',
    path: '/tutor/profile',
    match: (p) => p === '/tutor/profile',
  },
]

const PRIMARY: SidebarItem[] = [
  {
    icon: HiOutlineAcademicCap,
    label: 'Classes',
    path: '/tutor',
    match: (p) => p === '/tutor',
  },
  { icon: HiOutlineUserGroup, label: 'Students', path: '/tutor/students' },
  {
    icon: HiOutlineCalendarDays,
    label: 'Bookings',
    path: '/tutor/bookings',
  },
  { icon: HiOutlineChartBarSquare, label: 'KPI', path: '/tutor/kpi' },
  {
    icon: HiOutlineCheckBadge,
    label: 'Certificates',
    path: '/tutor/certificates',
  },
  { icon: HiOutlineBookOpen, label: 'Library', path: '/tutor/library' },
  { icon: HiOutlineLanguage, label: 'Vocabulary', path: '/tutor/vocabulary' },
  {
    icon: HiOutlineVideoCamera,
    label: 'Create meeting',
    path: '/tutor/create-meeting',
  },
]

const UTILITY: SidebarItem[] = [
  {
    icon: HiOutlineCog6Tooth,
    label: 'Settings',
    path: '/tutor/settings',
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

export default function TutorSidebar({
  activePath,
  collapsed = false,
  onMenuClick,
  onNavigate,
}: TutorSidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const renderGroup = (items: SidebarItem[]) =>
    items.map((item) => {
      const Icon = item.icon
      const active = isItemActive(item, activePath)
      return (
        <NavLink
          key={item.label}
          to={item.path}
          title={item.label}
          onClick={onNavigate}
          className={itemClass(active, collapsed)}
          end={item.path === '/tutor'}
        >
          <Icon className="h-[22px] w-[22px] shrink-0" aria-hidden />
          <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
        </NavLink>
      )
    })

  const onLogout = () => {
    onNavigate?.()
    void logout().then(() => navigate('/', { replace: true }))
  }

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
        aria-label="Teacher"
      >
        {renderGroup(TOP)}

        <div
          className={`my-3 h-px bg-slate-200 ${collapsed ? 'w-8' : 'mx-1'}`}
        />

        {renderGroup(PRIMARY)}

        <div
          className={`my-3 h-px bg-slate-200 ${collapsed ? 'w-8' : 'mx-1'}`}
        />

        {renderGroup(UTILITY)}

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
        <button
          type="button"
          title={collapsed ? 'Log out' : undefined}
          onClick={onLogout}
          className={itemClass(false, collapsed)}
        >
          <HiOutlineArrowRightOnRectangle className="h-[22px] w-[22px] shrink-0" aria-hidden />
          <span className={collapsed ? 'sr-only' : 'truncate'}>Log out</span>
        </button>
      </div>
    </aside>
  )
}
