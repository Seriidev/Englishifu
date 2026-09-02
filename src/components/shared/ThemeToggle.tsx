import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2'
import { useTheme } from '../../theme/ThemeContext'

interface ThemeToggleProps {
  collapsed?: boolean
  className?: string
}

export default function ThemeToggle({
  collapsed = false,
  className = '',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={
        className ||
        [
          'flex items-center rounded-[10px] text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50',
          collapsed ? 'h-10 w-10 justify-center' : 'h-10 w-full gap-4 px-3',
        ].join(' ')
      }
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <HiOutlineSun className="h-[22px] w-[22px] shrink-0" aria-hidden />
      ) : (
        <HiOutlineMoon className="h-[22px] w-[22px] shrink-0" aria-hidden />
      )}
      {collapsed ? (
        <span className="sr-only">{isDark ? 'Light mode' : 'Dark mode'}</span>
      ) : (
        <span className="truncate">{isDark ? 'Light mode' : 'Dark mode'}</span>
      )}
    </button>
  )
}
