import { useState } from 'react'
import { GraduationCap, LogIn, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Teachers', href: '#tutors' },
  { label: 'Speaking Club', href: '#speaking-club' },
  { label: 'Contacts', href: '#contact' },
] as const

type NavLabel = (typeof navLinks)[number]['label']
type LangCode = 'RU' | 'EN' | 'TM'

const languages: LangCode[] = ['RU', 'EN', 'TM']

export default function Navbar() {
  const [activeNav, setActiveNav] = useState<NavLabel>('Home')
  const [lang, setLang] = useState<LangCode>('RU')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="relative mx-auto flex h-[80px] max-w-7xl items-center justify-between px-6">
        <a href="#home" className="relative z-10 flex shrink-0 items-center gap-2.5">
          <GraduationCap className="h-8 w-8 text-ink" aria-hidden />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-ink">Englishifu</span>
            <span className="text-[11px] text-gray-400">Learn. Practice. Achieve.</span>
          </span>
        </a>

        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex"
          aria-label="Main"
        >
          <div className="flex items-center gap-0.5 rounded-full bg-gray-100 p-1.5">
            {navLinks.map((link) => {
              const isActive = activeNav === link.label
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveNav(link.label)}
                  className={`rounded-full px-6 py-3 text-base font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-white text-ink shadow-sm'
                      : 'bg-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </div>
        </nav>

        <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="flex items-center rounded-full bg-gray-100 p-1.5"
            role="group"
            aria-label="Language"
          >
            {languages.map((code) => {
              const isActive = lang === code
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold transition sm:px-4 sm:text-base ${
                    isActive
                      ? 'bg-white text-ink shadow-sm'
                      : 'bg-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {code}
                </button>
              )
            })}
          </div>

          <a
            href="#login"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-dark"
          >
            <LogIn className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Log In</span>
          </a>

          <button
            type="button"
            className="inline-flex rounded-lg p-2.5 text-ink lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map((link) => {
              const isActive = activeNav === link.label
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    setActiveNav(link.label)
                    setMobileOpen(false)
                  }}
                  className={`rounded-xl px-6 py-3 text-base font-medium transition ${
                    isActive
                      ? 'bg-gray-100 text-ink'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
