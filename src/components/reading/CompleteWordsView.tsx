import { useMemo, useRef, useState } from 'react'
import type { ReadingQuestion } from './types'
import InlineBlank, { type InlineBlankHandle } from './InlineBlank'
import { useLanguage } from '../../i18n/LanguageContext'

interface CompleteWordsViewProps {
  question: ReadingQuestion
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
  onSubmit: () => void
}

export default function CompleteWordsView({
  question,
  value,
  onChange,
  onSubmit,
}: CompleteWordsViewProps) {
  const { t } = useLanguage()
  const segments = question.segments ?? []
  const blankIds = useMemo(
    () =>
      segments
        .filter((s) => s.type === 'blank' && s.blankId)
        .map((s) => s.blankId!),
    [segments],
  )

  const [activeBlankId, setActiveBlankId] = useState<string | null>(
    () => blankIds[0] ?? null,
  )
  const blankRefs = useRef<Record<string, InlineBlankHandle | null>>({})

  const complete =
    blankIds.length > 0 &&
    blankIds.every((id) => {
      const seg = segments.find((s) => s.blankId === id)
      const expected = seg?.slotCount ?? 0
      return (value[id] ?? '').length === expected
    })

  const focusBlank = (blankId: string) => {
    setActiveBlankId(blankId)
    blankRefs.current[blankId]?.focus()
  }

  const focusNextBlank = (currentId: string) => {
    const idx = blankIds.indexOf(currentId)
    if (idx < 0 || idx >= blankIds.length - 1) return
    const nextId = blankIds[idx + 1]
    // defer so current onChange finishes first
    requestAnimationFrame(() => focusBlank(nextId))
  }

  const handleBlankChange = (blankId: string, next: string) => {
    onChange({ ...value, [blankId]: next })
    const seg = segments.find((s) => s.blankId === blankId)
    const slotCount = seg?.slotCount ?? 0
    if (slotCount > 0 && next.length === slotCount) {
      focusNextBlank(blankId)
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 pb-1">
      <div className="flex-1">
        <p className="text-base font-semibold text-ink">{question.prompt}</p>
        <p className="mt-4 text-base leading-loose text-ink">
          {segments.map((seg, i) => {
            if (seg.type === 'text') {
              return <span key={`t-${i}`}>{seg.content}</span>
            }

            const blankId = seg.blankId!
            const slotCount = seg.slotCount ?? 0
            return (
              <InlineBlank
                key={blankId}
                ref={(handle) => {
                  blankRefs.current[blankId] = handle
                }}
                blankId={blankId}
                visiblePrefix={seg.visiblePrefix ?? ''}
                slotCount={slotCount}
                value={value[blankId] ?? ''}
                isActive={activeBlankId === blankId}
                onFocus={() => setActiveBlankId(blankId)}
                onChange={(val) => handleBlankChange(blankId, val)}
              />
            )
          })}
        </p>
        <p className="mt-3 text-xs text-muted">
          Type the missing letters to complete each word.
        </p>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-5 pb-2 sm:pb-3">
        <button
          type="button"
          disabled={!complete}
          onClick={onSubmit}
          className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('toefl.submitContinue')}
        </button>
        <p className="mt-2.5 text-center text-xs text-muted">{t('toefl.noBack')}</p>
      </div>
    </div>
  )
}
