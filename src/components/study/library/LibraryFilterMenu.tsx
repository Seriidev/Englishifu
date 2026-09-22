import { useEffect, useId, useRef, useState } from 'react'
import { HiOutlineChevronDown } from 'react-icons/hi2'

interface Option<T extends string> {
  id: T
  label: string
}

interface LibraryFilterMenuProps<T extends string> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

export default function LibraryFilterMenu<T extends string>({
  label,
  value,
  options,
  onChange,
}: LibraryFilterMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const current = options.find((item) => item.id === value)?.label ?? label
  const isDefault = value === 'all'

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          isDefault
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
            : 'bg-indigo-500 text-white hover:bg-indigo-600'
        }`}
      >
        {current}
        <HiOutlineChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
      </button>
      {open ? (
        <ul
          id={menuId}
          role="listbox"
          className="absolute z-20 mt-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-slate-800"
        >
          {options.map((item) => {
            const selected = item.id === value
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm transition ${
                    selected
                      ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5'
                  }`}
                  onClick={() => {
                    onChange(item.id)
                    setOpen(false)
                  }}
                >
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
