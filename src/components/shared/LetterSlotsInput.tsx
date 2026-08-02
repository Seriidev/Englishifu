import { useRef, useState, type KeyboardEvent } from 'react'

interface LetterSlotsInputProps {
  /** Current answer string (joined letters). */
  value: string
  /** Expected length of the blank (number of slots). */
  length: number
  onChange: (value: string) => void
  ariaLabel?: string
  className?: string
}

/**
 * Per-letter blank slots: empty = underscore, active = light blue box.
 */
export default function LetterSlotsInput({
  value,
  length,
  onChange,
  ariaLabel = 'Blank',
  className = '',
}: LetterSlotsInputProps) {
  const slotCount = Math.max(length, 1)
  const letters = Array.from({ length: slotCount }, (_, i) => value[i] ?? '')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const focusSlot = (index: number) => {
    const next = Math.max(0, Math.min(index, slotCount - 1))
    setActive(next)
    inputRef.current?.focus()
  }

  const commit = (nextLetters: string[]) => {
    onChange(nextLetters.join(''))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...letters]
      if (next[active]) {
        next[active] = ''
        commit(next)
      } else if (active > 0) {
        next[active - 1] = ''
        commit(next)
        setActive(active - 1)
      }
      return
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
      return
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setActive((i) => Math.min(slotCount - 1, i + 1))
      return
    }

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault()
      const next = [...letters]
      next[active] = e.key.toLowerCase()
      commit(next)
      if (active < slotCount - 1) setActive(active + 1)
    }
  }

  return (
    <span
      className={`mx-0.5 inline-flex items-center gap-0.5 align-baseline ${className}`}
      onClick={() => focusSlot(active)}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        aria-label={ariaLabel}
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          const firstEmpty = letters.findIndex((l) => !l)
          setActive(firstEmpty === -1 ? slotCount - 1 : firstEmpty)
        }}
        className="sr-only"
      />
      {letters.map((letter, i) => {
        const isActive = active === i
        return (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation()
              focusSlot(i)
            }}
            className={`inline-flex h-6 min-w-[1.1rem] items-center justify-center rounded px-0.5 font-semibold leading-none transition ${
              isActive
                ? 'bg-[#dce8ff] text-ink ring-1 ring-brand/30'
                : letter
                  ? 'bg-transparent text-ink'
                  : 'bg-transparent text-gray-400'
            }`}
            aria-hidden
          >
            {letter || '_'}
          </button>
        )
      })}
    </span>
  )
}
