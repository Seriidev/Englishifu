import { MdVerified } from 'react-icons/md'

interface VerifiedBadgeProps {
  size?: 'md' | 'lg'
  className?: string
  title?: string
}

export default function VerifiedBadge({
  size = 'lg',
  className = '',
  title = 'Verified',
}: VerifiedBadgeProps) {
  const dim = size === 'lg' ? 26 : 20
  return (
    <span
      className={`inline-flex shrink-0 items-center text-brand ${className}`}
      title={title}
      aria-label={title}
    >
      <MdVerified size={dim} aria-hidden />
    </span>
  )
}
