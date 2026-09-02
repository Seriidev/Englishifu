import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import {
  Bell,
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
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
} from '../../utils/adminApi'
import { adminBtn, adminInput } from './adminUi'

const ADMIN_NAV: {
  icon: LucideIcon
  label: string
  path: string
}[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
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

export default function AdminLayout() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const ok = await checkAdminSession()
      setAuthed(ok)
      setChecking(false)
    })()
  }, [])

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await adminLogin(password)
      setAuthed(true)
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F9FAFB]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F9FAFB] px-4">
        <form
          onSubmit={(e) => void onLogin(e)}
          className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-7"
        >
          <p className="font-serif text-2xl font-semibold text-zinc-900">
            Englishcore
          </p>
          <h1 className="mt-4 text-lg font-semibold text-zinc-900">
            Admin login
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Enter the admin password to continue.
          </p>
          <input
            type="password"
            required
            className={`${adminInput} mt-5`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <button type="submit" className={`${adminBtn} mt-4 w-full`}>
            Sign in
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh bg-[#F9FAFB] text-zinc-900">
      <aside className="hidden w-[232px] shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="px-5 py-5">
          <p className="font-serif text-xl font-semibold tracking-tight text-zinc-900">
            Englishcore
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
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
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
            onClick={() => {
              void adminLogout().then(() => {
                setAuthed(false)
                navigate('/admin', { replace: true })
              })
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto lg:hidden">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-zinc-500 hover:bg-zinc-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-500">
              <Bell className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
                AD
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-medium text-zinc-900">
                  Admin
                </span>
                <span className="block text-xs text-zinc-500">
                  admin@englishcore.com
                </span>
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
