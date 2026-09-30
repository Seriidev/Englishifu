import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  wrapperClassName?: string
}

export default function SearchField({
  className = '',
  wrapperClassName = '',
  ...props
}: SearchFieldProps) {
  return (
    <label className={`relative block ${wrapperClassName}`}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        type="search"
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${className}`}
      />
    </label>
  )
}
