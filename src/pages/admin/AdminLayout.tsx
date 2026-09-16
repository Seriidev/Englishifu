import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { Bell } from 'lucide-react'
import { HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2'
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
} from '../../utils/adminApi'
import { adminBtn, adminInput } from './adminUi'
import BrandMark from '../../components/shared/BrandMark'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      const ok = await checkAdminSession()
      setAuthed(ok)
      setChecking(false)
    })()
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

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

  const onLogout = () => {
    setMobileOpen(false)
    void adminLogout().then(() => {
      setAuthed(false)
      navigate('/admin', { replace: true })
    })
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
            <BrandMark className="font-serif font-semibold" />
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
    <div className="flex min-h-svh min-w-0 bg-[#F9FAFB] text-zinc-900">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[240px] lg:flex-col">
        <AdminSidebar onLogout={onLogout} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex shadow-xl">
            <AdminSidebar
              onLogout={onLogout}
              onMenuClick={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[240px]">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full min-w-0 max-w-6xl items-center gap-2 px-3 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-50 lg:hidden"
              aria-label="Open menu"
            >
              {mobileOpen ? (
                <HiOutlineXMark className="h-6 w-6" />
              ) : (
                <HiOutlineBars3 className="h-6 w-6" />
              )}
            </button>
            <div className="min-w-0 flex-1 lg:hidden">
              <BrandMark className="font-serif text-lg font-semibold" />
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
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
          </div>
        </header>

        <div className="mx-auto w-full min-w-0 max-w-6xl flex-1 overflow-x-clip px-3 py-5 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
