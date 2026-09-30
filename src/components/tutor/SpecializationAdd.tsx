import { X } from 'lucide-react'
import LibraryFilterMenu from '../study/library/LibraryFilterMenu'
import { TUTOR_POSITIONS } from '../../types/user'

export function specializationsFromProfile(profile: {
  position?: string
  specializations?: string[]
}) {
  const stored = (profile.specializations ?? []).filter((item) =>
    (TUTOR_POSITIONS as readonly string[]).includes(item),
  )
  if (stored.length > 0) return stored
  return profile.position ? [profile.position] : []
}

export function SpecializationAdd({
  selected,
  onAdd,
}: {
  selected: string[]
  onAdd: (value: string) => void
}) {
  const remaining = TUTOR_POSITIONS.filter((item) => !selected.includes(item))

  if (remaining.length === 0) {
    return (
      <p className="text-sm text-slate-500">All specializations added.</p>
    )
  }

  return (
    <LibraryFilterMenu
      label="Add specialization"
      value=""
      defaultValue=""
      options={[
        ...remaining.map((item) => ({ id: item, label: item })),
        { id: '', label: 'Add specialization' },
      ]}
      onChange={(value) => {
        if (value) onAdd(value)
      }}
    />
  )
}

export function SpecializationChips({
  selected,
  onRemove,
}: {
  selected: string[]
  onRemove: (value: string) => void
}) {
  if (selected.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2">
      {selected.map((item) => (
        <li key={item}>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="rounded-full p-0.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        </li>
      ))}
    </ul>
  )
}
