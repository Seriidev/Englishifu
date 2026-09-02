import type { FullTestResult, FullTestSection } from './overallScoring'

export type AnalysisAxisId =
  | FullTestSection
  | 'grammar'

export interface RadarAxis {
  id: AnalysisAxisId
  label: string
  value: number
}

export interface WeakSpot {
  id: string
  section: string
  sectionId: AnalysisAxisId
  band: number
  points: string[]
  practicePath: string
}

export interface TestAnalysis {
  hasResult: boolean
  axes: RadarAxis[]
  weakSpots: WeakSpot[]
}

const MAX_BAND = 6

const SUBSKILLS: Record<
  FullTestSection,
  { points: string[]; path: string; label: string }
> = {
  reading: {
    label: 'Reading',
    path: '/reading',
    points: [
      'Inference and implied meaning',
      'Vocabulary in context',
      'Insert-text / sentence insertion',
    ],
  },
  listening: {
    label: 'Listening',
    path: '/listening',
    points: [
      'Speaker attitude and purpose',
      'Connecting details across the lecture',
      'Detail questions under time pressure',
    ],
  },
  speaking: {
    label: 'Speaking',
    path: '/speaking',
    points: [
      'Fluency and pronunciation',
      'Independent task structure',
      'Integrated speaking (campus + lecture)',
    ],
  },
  writing: {
    label: 'Writing',
    path: '/writing',
    points: [
      'Integrated essay organization',
      'Academic vocabulary range',
      'Grammar accuracy in long sentences',
    ],
  },
}

function clampBand(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(MAX_BAND, value))
}

export function buildTestAnalysis(
  result: FullTestResult | null,
): TestAnalysis {
  if (!result) {
    return {
      hasResult: false,
      axes: [
        { id: 'reading', label: 'Reading', value: 0 },
        { id: 'listening', label: 'Listening', value: 0 },
        { id: 'speaking', label: 'Speaking', value: 0 },
        { id: 'writing', label: 'Writing', value: 0 },
        { id: 'grammar', label: 'Grammar', value: 0 },
      ],
      weakSpots: [],
    }
  }

  const reading = clampBand(result.reading.bandScore)
  const listening = clampBand(result.listening.bandScore)
  const speaking = clampBand(result.speaking.bandScore)
  const writing = clampBand(result.writing.bandScore)
  const grammar = clampBand(
    Math.round(((writing * 0.65 + speaking * 0.35) * 2)) / 2,
  )

  const axes: RadarAxis[] = [
    { id: 'reading', label: 'Reading', value: reading },
    { id: 'listening', label: 'Listening', value: listening },
    { id: 'speaking', label: 'Speaking', value: speaking },
    { id: 'writing', label: 'Writing', value: writing },
    { id: 'grammar', label: 'Grammar', value: grammar },
  ]

  const overall = result.overallBandScore
  const sectionScores: { id: FullTestSection; band: number }[] = [
    { id: 'reading', band: reading },
    { id: 'listening', band: listening },
    { id: 'speaking', band: speaking },
    { id: 'writing', band: writing },
  ]

  const weakSpots: WeakSpot[] = sectionScores
    .filter((item) => item.band <= overall || item.band <= 3.5)
    .sort((a, b) => a.band - b.band)
    .slice(0, 3)
    .map((item) => {
      const meta = SUBSKILLS[item.id]
      return {
        id: item.id,
        section: meta.label,
        sectionId: item.id,
        band: item.band,
        points: meta.points,
        practicePath: meta.path,
      }
    })

  if (weakSpots.length === 0) {
    const lowest = [...sectionScores].sort((a, b) => a.band - b.band)[0]
    if (lowest) {
      const meta = SUBSKILLS[lowest.id]
      weakSpots.push({
        id: lowest.id,
        section: meta.label,
        sectionId: lowest.id,
        band: lowest.band,
        points: meta.points,
        practicePath: meta.path,
      })
    }
  }

  return { hasResult: true, axes, weakSpots }
}

export { MAX_BAND }
