import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Gift,
  GraduationCap,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Mic,
  Newspaper,
  Send,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { HiOutlineBars3 } from 'react-icons/hi2'
import BrandMark from '../../components/shared/BrandMark'

export const ADMIN_NAV: {
  icon: LucideIcon
  label: string
  path: string
}[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: UserCheck, label: 'Applications', path: '/admin/tutors' },
  { icon: Users, label: 'Tutors', path: '/admin/tutors/directory' },
  { icon: GraduationCap, label: 'Students', path: '/admin/students' },
  { icon: Image, label: 'Banners', path: '/admin/banners' },
  { icon: BookOpen, label: 'Books', path: '/admin/books' },
  { icon: Gift, label: 'Referrals', path: '/admin/referrals' },
  { icon: Newspaper, label: 'News', path: '/admin/news' },
  { icon: Mic, label: 'Speaking Club', path: '/admin/speaking-club' },
  { icon: Mail, label: 'Requests', path: '/admin/requests' },
  { icon: Send, label: 'Messages', path: '/admin/messages' },
]

interface AdminSidebarProps {
  onLogout: () => void
  onMenuClick?: () => void
  onNavigate?: () => void
}

export default function AdminSidebar({
  onLogout,
  onMenuClick,
  onNavigate,
}: AdminSidebarProps) {
  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-zinc-200 bg-white">
      <div
        className={`flex shrink-0 items-center gap-3 ${
          onMenuClick ? 'px-3 py-3' : 'px-5 py-5'
        }`}
      >
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-50"
            aria-label="Close menu"
          >
            <HiOutlineBars3 className="h-6 w-6" aria-hidden />
          </button>
        ) : null}
        <p className="min-w-0 font-serif text-xl font-semibold tracking-tight text-zinc-900">
          <BrandMark className="font-serif font-semibold" />
        </p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-zinc-100 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Logout
        </button>
      </div>
    </aside>
  )
}
