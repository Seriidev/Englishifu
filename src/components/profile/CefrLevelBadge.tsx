import { MdVerified } from 'react-icons/md'
import {
  CEFR_BADGE_STYLES,
  type CefrLevel,
} from '../../types/cefr'

interface CefrLevelBadgeProps {
  level: CefrLevel
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

/** Same MdVerified rosette shape as VerifiedBadge, tinted by CEFR rank. */
const SIZE = {
  sm: { icon: 20, text: 'text-xs' },
  md: { icon: 24, text: 'text-sm' },
  lg: { icon: 26, text: 'text-sm' },
} as const

export default function CefrLevelBadge({
  level,
  size = 'md',
  showLabel = true,
  className = '',
}: CefrLevelBadgeProps) {
  const style = CEFR_BADGE_STYLES[level]
  const dim = SIZE[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={`CEFR ${level} — ${style.label}`}
      aria-label={`CEFR level ${level}, ${style.label}`}
    >
      <span className={`inline-flex shrink-0 items-center ${style.text}`}>
        <MdVerified size={dim.icon} aria-hidden />
      </span>
      {showLabel ? (
        <span className={`font-bold tracking-tight ${style.text} ${dim.text}`}>
          {level}
        </span>
      ) : null}
    </span>
  )
}
