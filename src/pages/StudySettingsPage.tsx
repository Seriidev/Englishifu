import { useTheme } from '../theme/ThemeContext'

export default function StudySettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Preferences for your account. Your referral link lives on your
          profile.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-slate-900">Appearance</h3>
        <p className="mt-1 text-sm text-slate-500">
          Light and dark use the same indigo accent. Only background and text
          change.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              theme === 'light'
                ? 'bg-indigo-500 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              theme === 'dark'
                ? 'bg-indigo-500 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
            }`}
          >
            Dark
          </button>
        </div>
      </section>
    </div>
  )
}
