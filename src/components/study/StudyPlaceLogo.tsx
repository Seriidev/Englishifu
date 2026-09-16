import { Link } from 'react-router-dom'
import BrandMark from '../shared/BrandMark'

export default function StudyPlaceLogo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`min-w-0 truncate text-[17px] text-slate-900 ${className}`}
      aria-label="EnglishCore home"
    >
      <BrandMark />
    </Link>
  )
}
