import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { LISTENING_TASK_TYPES } from '../../types/listening'

interface Props {
  /** Close parent mobile menu when a link is chosen */
  onNavigate?: () => void
  variant?: 'desktop' | 'mobile'
}

export default function ListeningDropdown({
  onNavigate,
  variant = 'desktop',
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!open || variant !== 'desktop') return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, variant])

  if (variant === 'mobile') {
    return (
      <div className="rounded-2xl">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Listening
          <ChevronDown
            className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="mt-1 space-y-0.5 border-l-2 border-brand/20 pl-3 ml-4">
            <Link
              to="/listening"
              onClick={onNavigate}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-ink hover:bg-brand-light"
            >
              All Listening practices
            </Link>
            {LISTENING_TASK_TYPES.map((t) => (
              <Link
                key={t.type}
                to={`/listening?type=${t.type}`}
                onClick={onNavigate}
                className="block rounded-xl px-3 py-2 text-sm text-muted hover:bg-brand-light hover:text-ink"
              >
                <span className="font-semibold text-brand">{t.navCode}</span>{' '}
                {t.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors xl:px-4 ${
          open || location.pathname.startsWith('/listening')
            ? 'text-brand'
            : 'text-gray-500 hover:text-ink'
        }`}
      >
        Listening
        <ChevronDown
          className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 z-50 mt-2 w-80 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg shadow-black/8">
          <p className="px-3 py-2 text-[11px] font-bold tracking-wide text-muted uppercase">
            Practice tests
          </p>
          {LISTENING_TASK_TYPES.map((t) => (
            <Link
              key={t.type}
              to={`/listening?type=${t.type}`}
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className="block rounded-xl px-3 py-2.5 transition hover:bg-brand-light"
            >
              <span className="text-xs font-bold text-brand">{t.navCode}</span>
              <span className="mt-0.5 block text-sm font-semibold text-ink">
                {t.label}
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {t.description}
              </span>
            </Link>
          ))}
          <Link
            to="/listening"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-3 py-2 text-center text-xs font-semibold text-brand hover:bg-brand-light"
          >
            Browse all practices →
          </Link>
        </div>
      )}
    </div>
  )
}
