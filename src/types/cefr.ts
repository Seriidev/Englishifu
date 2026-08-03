/** CEFR ranks from Placement Test */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export const CEFR_LEVELS: CefrLevel[] = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
]

/** Badge / checkmark colors for student ranks */
export const CEFR_BADGE_STYLES: Record<
  CefrLevel,
  { bg: string; text: string; ring: string; label: string }
> = {
  A1: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    ring: 'ring-red-200',
    label: 'Beginner',
  },
  A2: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    ring: 'ring-orange-200',
    label: 'Elementary',
  },
  B1: {
    bg: 'bg-yellow-400',
    text: 'text-yellow-400',
    ring: 'ring-yellow-200',
    label: 'Intermediate',
  },
  B2: {
    bg: 'bg-lime-500',
    text: 'text-lime-600',
    ring: 'ring-lime-200',
    label: 'Upper Intermediate',
  },
  C1: {
    bg: 'bg-green-600',
    text: 'text-green-600',
    ring: 'ring-green-200',
    label: 'Advanced',
  },
  C2: {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    ring: 'ring-purple-200',
    label: 'Proficiency',
  },
}

export function isCefrLevel(value: unknown): value is CefrLevel {
  return (
    typeof value === 'string' &&
    (CEFR_LEVELS as string[]).includes(value)
  )
}
