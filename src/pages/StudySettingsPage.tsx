import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/ThemeContext'

export default function StudySettingsPage() {
  const { isDark, setTheme } = useTheme()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">
          Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Preferences for your Study Place experience.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              {isDark ? (
                <Moon className="h-5 w-5" aria-hidden />
              ) : (
                <Sun className="h-5 w-5" aria-hidden />
              )}
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Dark mode
              </h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Softer colors for studying at night — easier on the eyes.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition ${
              isDark ? 'bg-indigo-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition ${
                isDark ? 'translate-x-7' : 'translate-x-1'
              }`}
            >
              {isDark ? (
                <Moon className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
              ) : (
                <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              )}
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}
