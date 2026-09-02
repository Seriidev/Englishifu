import type { LibraryCategory, LibraryLevel } from '../types/studyContent'

export const LIBRARY_LEVEL_OPTIONS: { id: LibraryLevel; label: string }[] = [
  { id: 'A2', label: 'A1–A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
  { id: 'C1', label: 'C1' },
  { id: 'C2', label: 'C2' },
]

export const LIBRARY_TOPIC_OPTIONS: { id: LibraryCategory; label: string }[] = [
  { id: 'literature', label: 'Literature' },
  { id: 'study', label: 'Study' },
  { id: 'business', label: 'Business' },
  { id: 'history', label: 'History' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'classics', label: 'Classics' },
  { id: 'academic', label: 'Academic' },
  { id: 'essays', label: 'Essays' },
]

export const LIBRARY_LEVEL_IDS = LIBRARY_LEVEL_OPTIONS.map((item) => item.id)
export const LIBRARY_TOPIC_IDS = LIBRARY_TOPIC_OPTIONS.map((item) => item.id)

export function libraryLevelLabel(level: LibraryLevel | string) {
  return LIBRARY_LEVEL_OPTIONS.find((item) => item.id === level)?.label ?? level
}

export function libraryTopicLabel(category: LibraryCategory | string) {
  return (
    LIBRARY_TOPIC_OPTIONS.find((item) => item.id === category)?.label ?? category
  )
}
