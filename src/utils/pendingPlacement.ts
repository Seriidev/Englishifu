import { isCefrLevel, type CefrLevel } from '../types/cefr'
import { saveStudentPlacementResult } from './authStorage'

const KEY = 'englishcore_pending_placement'

export interface PendingPlacement {
  cefrLevel: CefrLevel
  completedAt: string
}

export function stashPendingPlacement(value: PendingPlacement) {
  sessionStorage.setItem(KEY, JSON.stringify(value))
}

export function readPendingPlacement(): PendingPlacement | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PendingPlacement>
    if (!isCefrLevel(parsed.cefrLevel) || typeof parsed.completedAt !== 'string') {
      return null
    }
    return { cefrLevel: parsed.cefrLevel, completedAt: parsed.completedAt }
  } catch {
    return null
  }
}

export function clearPendingPlacement() {
  sessionStorage.removeItem(KEY)
}

export async function claimPendingPlacement(userId: string) {
  const pending = readPendingPlacement()
  if (!pending) return
  const result = await saveStudentPlacementResult(userId, pending)
  if (!('error' in result)) clearPendingPlacement()
}
