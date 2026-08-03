import { useState, type MouseEvent } from 'react'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { smoothScrollTo } from '../utils/scroll'
import { useLanguage } from '../i18n/LanguageContext'
import { LANG_OPTIONS, type LangCode } from '../i18n/dictionaries'
import { dashboardPathForRole } from '../utils/authStorage'

const navKeys = [
  { key: 'nav.home', href: '#home', label: 'Home' },
  { key: 'nav.teachers', href: '#tutors', label: 'Teachers' },
  { key: 'nav.speakingClub', href: '#speaking-club', label: 'Speaking Club' },
  { key: 'nav.toefl', href: '#toefl', label: 'TOEFL' },
  { key: 'nav.contacts', href: '#contact', label: 'Contacts' },
] as const

type NavLabel = (typeof navKeys)[number]['label']

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const [activeNav, setActiveNav] = useState<NavLabel>('Home')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavClick = (
    e: MouseEvent<HTMLAnchorElement>,
    label: NavLabel | null,
    href: string,
  ) => {
    e.preventDefault()
    if (label) setActiveNav(label)
    setMobileOpen(false)

    if (location.pathname !== '/') {
      navigate('/' + href)
      return
    }
    smoothScrollTo(href)
  }

  const goPrimary = () => {
    setMobileOpen(false)
    if (user) {
      navigate(dashboardPathForRole(user.role, user))
      return
    }
    navigate('/login')
  }

  const isLoggedIn = Boolean(user)
  const primaryLabel = isLoggedIn ? t('nav.profile') : t('nav.login')

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      type="button"
      onClick={goPrimary}
      className={
        mobile
          ? 'rounded-full bg-brand px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white'
          : 'rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-brand-dark'
      }
    >
      {primaryLabel}
    </button>
  )

  const LangSwitcher = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`flex items-center rounded-full bg-gray-50 p-1 ${compact ? 'flex-1' : ''}`}
      role="group"
      aria-label="Language"
    >
      {LANG_OPTIONS.map(({ code, label }) => {
        const isActive = lang === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code as LangCode)}
            className={`${compact ? 'flex-1' : ''} rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
              isActive
                ? 'bg-white text-ink shadow-sm'
                : 'text-gray-400 hover:text-ink'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3 rounded-full border border-[#d7e3f8]/80 bg-white/80 px-3 py-2.5 shadow-[0_8px_30px_rgba(79,124,255,0.1)] backdrop-blur-xl sm:px-4 sm:py-3 lg:px-5">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'Home', '#home')}
            className="flex shrink-0 items-center gap-2.5 pl-1"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white sm:h-10 sm:w-10">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-base font-bold tracking-tight text-ink sm:text-lg">
              Englishifu
            </span>
          </a>

          <nav
            className="absolute top-1/2 left-1/2 hidden max-w-[min(52%,420px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 overflow-hidden xl:flex"
            aria-label="Main"
          >
            {navKeys.map((link) => {
              const isActive = activeNav === link.label
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.label, link.href)}
                  className={`rounded-full px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 2xl:px-4 ${
                    isActive ? 'text-brand' : 'text-gray-500 hover:text-ink'
                  }`}
                >
                  {t(link.key)}
                </a>
              )
            })}
          </nav>

          <div className="relative z-20 flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex">
              <LangSwitcher />
            </div>

            <div className="hidden items-center gap-1.5 sm:flex">
              <AuthButtons />
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-gray-50 xl:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`origin-top overflow-hidden transition-all duration-300 ease-out xl:hidden ${
            mobileOpen
              ? 'mt-2 max-h-[420px] scale-100 opacity-100'
              : 'pointer-events-none max-h-0 scale-95 opacity-0'
          }`}
        >
          <div className="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(11,27,61,0.1)] ring-1 ring-black/[0.04]">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {navKeys.map((link) => {
                const isActive = activeNav === link.label
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.label, link.href)}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? 'bg-brand-light text-brand'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-ink'
                    }`}
                  >
                    {t(link.key)}
                  </a>
                )
              })}
            </nav>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <div className="w-full sm:hidden">
                <LangSwitcher compact />
              </div>
              <AuthButtons mobile />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
