import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  LANG_STORAGE_KEY,
  normalizeLang,
  translate,
  type LangCode,
} from './dictionaries'

interface LanguageContextValue {
  lang: LangCode
  setLang: (lang: LangCode) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLang(): LangCode {
  try {
    return normalizeLang(localStorage.getItem(LANG_STORAGE_KEY))
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => readStoredLang())

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === 'tm' ? 'tk' : lang
  }, [lang])

  const setLang = useCallback((next: LangCode) => {
    setLangState(next)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
