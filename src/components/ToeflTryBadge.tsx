import { useEffect, useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { fetchToeflTryCount } from '../utils/toeflTryCounter'
import { useLanguage } from '../i18n/LanguageContext'

function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export default function ToeflTryBadge() {
  const { t } = useLanguage()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchToeflTryCount().then((n) => {
      if (!cancelled) setCount(n)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const label = useMemo(() => {
    if (count == null) return t('common.loading')
    return count === 1 ? t('toeflSim.triedOne') : t('toeflSim.triedMany')
  }, [count, t])

  if (count == null) {
    return (
      <div
        className="pointer-events-none absolute right-4 bottom-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs text-muted shadow-sm backdrop-blur-sm sm:right-6 sm:bottom-5"
        aria-hidden
      >
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur-sm sm:right-6 sm:bottom-5">
      <Users className="h-3.5 w-3.5 text-brand" aria-hidden />
      <span>
        <span className="font-bold tabular-nums text-brand">{formatCount(count)}</span>
        {label}
      </span>
    </div>
  )
}
