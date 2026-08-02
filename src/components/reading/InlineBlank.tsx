import { forwardRef, useImperativeHandle, useRef } from 'react'

export interface InlineBlankHandle {
  focus: () => void
}

interface InlineBlankProps {
  blankId: string
  visiblePrefix: string
  slotCount: number
  /** Letters typed so far (without prefix) */
  value: string
  isActive: boolean
  onFocus: () => void
  onChange: (value: string) => void
}

const InlineBlank = forwardRef<InlineBlankHandle, InlineBlankProps>(
  function InlineBlank(
    { blankId, visiblePrefix, slotCount, value, isActive, onFocus, onChange },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }))

    return (
      <span className="mx-0.5 inline-flex items-baseline align-baseline">
        <span className="font-semibold text-ink">{visiblePrefix}</span>
        <span
          className="relative ml-px inline-block"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            id={`blank-${blankId}`}
            value={value}
            onFocus={onFocus}
            onChange={(e) => {
              const next = e.target.value
                .replace(/[^a-zA-Z]/g, '')
                .slice(0, slotCount)
                .toLowerCase()
              onChange(next)
            }}
            maxLength={slotCount}
            autoComplete="off"
            spellCheck={false}
            aria-label={`Complete word starting with ${visiblePrefix}`}
            className="absolute inset-0 z-10 w-full cursor-text opacity-0"
          />
          <span className="inline-flex items-baseline gap-px" aria-hidden>
            {Array.from({ length: slotCount }).map((_, i) => {
              const filled = Boolean(value[i])
              return (
                <span
                  key={i}
                  className={`inline-flex h-[1.15em] min-w-[0.7rem] items-end justify-center border-b-2 text-center text-[0.95em] font-semibold leading-none ${
                    isActive
                      ? 'border-brand bg-[#dce8ff] text-ink'
                      : filled
                        ? 'border-transparent text-ink'
                        : 'border-gray-400 text-transparent'
                  }`}
                >
                  {value[i] || '\u00A0'}
                </span>
              )
            })}
          </span>
        </span>
      </span>
    )
  },
)

export default InlineBlank
