export type DifficultyTier = 'baseline' | 'easy' | 'hard'

export interface AdaptiveStageResult {
  stage: number
  tier: DifficultyTier
  correctCount: number
  totalCount: number
}

export interface AdaptiveEngineConfig {
  stage1ItemCount: number
  /** Percent correct in stage 1 above which Stage 2 uses hard module */
  stage2ThresholdPercent: number
}

export function determineNextTier(
  stage1Result: AdaptiveStageResult,
  config: AdaptiveEngineConfig,
): DifficultyTier {
  if (stage1Result.totalCount === 0) return 'easy'
  const pct = stage1Result.correctCount / stage1Result.totalCount
  return pct >= config.stage2ThresholdPercent / 100 ? 'hard' : 'easy'
}

export function countCorrect(flags: boolean[]): { correctCount: number; totalCount: number } {
  return {
    correctCount: flags.filter(Boolean).length,
    totalCount: flags.length,
  }
}

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveEngineConfig = {
  stage1ItemCount: 4,
  stage2ThresholdPercent: 60,
}
