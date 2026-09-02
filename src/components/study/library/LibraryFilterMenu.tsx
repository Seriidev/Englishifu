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
        className="inline-flex items-center gap-2 rounded-full bg-[#1B3A56] px-3.5 py-1.5 text-xs font-semibold text-white"
      >
        {current}
        <HiOutlineChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
      </button>
      {open ? (
        <ul
          id={menuId}
          role="listbox"
          className="absolute z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-md bg-[#16324A] py-1 shadow-lg ring-1 ring-white/10"
        >
          {options.map((item) => {
            const selected = item.id === value
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`block w-full px-3 py-1.5 text-left text-sm ${
                    selected
                      ? 'bg-[#D7E8F5] font-medium text-[#0B1C2C]'
                      : 'text-white hover:bg-white/10'
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
