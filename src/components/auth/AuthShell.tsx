import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="landing-shell flex min-h-svh flex-col">
      <header className="px-4 pt-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-bold text-ink">Englishcore</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-gray-50"
          >
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-[#c7d7f5]/80 bg-white/90 p-6 shadow-lg shadow-brand/5 backdrop-blur-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  )
}
