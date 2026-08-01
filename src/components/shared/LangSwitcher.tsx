import { LANG_OPTIONS, type LangCode } from '../../i18n/dictionaries'
import { useLanguage } from '../../i18n/LanguageContext'

export default function LangSwitcher({
  className = '',
}: {
  className?: string
}) {
  const { lang, setLang } = useLanguage()

  return (
    <div
      className={`inline-flex items-center rounded-full bg-gray-100 p-0.5 ${className}`}
      role="group"
      aria-label="Language"
    >
      {LANG_OPTIONS.map(({ code, label }) => {
        const active = lang === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code as LangCode)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              active ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-ink'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
