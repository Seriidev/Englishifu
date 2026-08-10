import { NavLink, useNavigate } from 'react-router-dom'
import {
  Award,
  BarChart3,
  ClipboardList,
  Headphones,
  Home,
  Medal,
  Mic,
  Settings,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { studentPublicProfilePath } from '../../utils/authStorage'

interface SidebarItem {
  icon: LucideIcon
  label: string
  path: string
  state?: Record<string, string>
  match?: (pathname: string) => boolean
}

interface StudySidebarProps {
  activePath: string
  onNavigate?: () => void
}

export default function StudySidebar({
  activePath,
  onNavigate,
}: StudySidebarProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const profilePath =
    user?.role === 'student' && user.handle
      ? studentPublicProfilePath(user.handle)
      : '/profile'

  const items: SidebarItem[] = [
    {
      icon: Home,
      label: 'Study Place',
      path: '/study',
      match: (p) => p === '/study',
    },
    { icon: Users, label: 'Find a Tutor', path: '/study/tutors' },
    { icon: Mic, label: 'Speaking Club', path: '/study/speaking-club' },
    { icon: BarChart3, label: 'My Progress', path: '/study/progress' },
    {
      icon: ClipboardList,
      label: 'Level Test',
      path: '/placement',
      state: { returnTo: '/study' },
      match: (p) => p.startsWith('/placement'),
    },
    { icon: Medal, label: 'Badges', path: '/study/badges' },
    {
      icon: Award,
      label: 'Certificates of Completion',
      path: '/study/certificates',
    },
    {
      icon: User,
      label: 'Profile',
      path: profilePath,
      match: (p) => p.startsWith('/profile'),
    },
  ]

  const isActive = (item: SidebarItem) =>
    item.match ? item.match(activePath) : activePath.startsWith(item.path)

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
          E
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Englishcore
          </p>
          <p className="text-xs text-slate-400">Study Place</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Study">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <NavLink
              key={item.label}
              to={item.path}
              state={item.state}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border-l-4 border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'border-l-4 border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="leading-snug">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-3 px-3 pb-4">
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            window.open('mailto:support@englishcore.com', '_blank')
          }}
          className="w-full rounded-2xl bg-slate-50 p-3.5 text-left transition hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300">
            <Headphones className="h-4 w-4" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Need help?
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Contact Support
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            navigate('/study/settings')
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Settings className="h-4 w-4" aria-hidden />
          Settings
        </button>
      </div>
    </aside>
  )
}
