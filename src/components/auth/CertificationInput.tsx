import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

export interface CertificationInputProps {
  value: string[]
  onChange: (certs: string[]) => void
}

export default function CertificationInput({
  value,
  onChange,
}: CertificationInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addCertification = () => {
    const trimmed = inputValue.trim().replace(/,$/, '')
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setInputValue('')
    }
  }

  const removeCertification = (cert: string) => {
    onChange(value.filter((c) => c !== cert))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addCertification()
    }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/15">
        {value.map((cert) => (
          <span
            key={cert}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-sm font-medium text-brand"
          >
            {cert}
            <button
              type="button"
              onClick={() => removeCertification(cert)}
              className="rounded-full text-brand/70 transition hover:bg-white/70 hover:text-brand"
              aria-label={`Remove ${cert}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={addCertification}
          placeholder={value.length ? 'Add another…' : 'Type and press Enter…'}
          className="min-w-[140px] flex-1 bg-transparent py-1 text-sm text-ink outline-none placeholder:text-gray-400"
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Press Enter or comma to add. Examples: TEFL, CELTA, TESOL
      </p>
    </div>
  )
}
