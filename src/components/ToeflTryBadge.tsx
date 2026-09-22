import { useEffect, useMemo, useState } from 'react'
import { FaUserPlus } from 'react-icons/fa6'
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
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-base font-semibold text-muted shadow-sm"
        aria-hidden
      >
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-base font-semibold text-ink shadow-sm">
      <FaUserPlus className="text-brand" size={22} aria-hidden />
      <span>
        <span className="font-bold tabular-nums text-brand">{formatCount(count)}</span>
        {label}
      </span>
    </div>
  )
}
