import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Download, RotateCcw } from 'lucide-react'
import {
  loadFullTestResult,
  type FullTestResult,
} from '../../scoring/overallScoring'
import { downloadResultsPDF } from '../../utils/pdfExport'

const SECTION_KEYS = ['reading', 'listening', 'speaking', 'writing'] as const

export default function ResultsScreen() {
  const navigate = useNavigate()
  const location = useLocation()

  const result = useMemo(() => {
    const fromState = (location.state as { result?: FullTestResult } | null)?.result
    return fromState ?? loadFullTestResult()
  }, [location.state])

  if (!result) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f7f9fc] px-6">
        <div className="max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-ink">No results yet</h1>
          <p className="mt-2 text-sm text-muted">
            Complete a full test to see your score report here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/toefl')}
            className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
          >
            Back to Hub
          </button>
        </div>
      </div>
    )
  }

  const completedLabel = new Date(result.completedAt).toLocaleString()

  return (
    <div className="min-h-svh bg-[#f7f9fc]">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <button
          type="button"
          onClick={() => navigate('/toefl')}
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Back to Hub
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">
            Full Test Results
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Your score report
          </h1>
          <p className="mt-2 text-sm text-muted">
            {completedLabel} · {result.testDurationMinutes} min
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-brand/15 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-muted">Overall Band Score</p>
          <p className="mt-2 text-6xl font-bold tracking-tight text-brand">
            {result.overallBandScore.toFixed(1)}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">
            CEFR {result.cefr}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {SECTION_KEYS.map((key) => {
            const score = result[key]
            return (
              <div
                key={key}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold tracking-wide text-brand uppercase">
                  {key}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-ink">
                      {score.bandScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted">Band</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-ink">{score.rawScore}</p>
                    <p className="text-xs text-muted">Raw</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => downloadResultsPDF(result)}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download Results (PDF)
          </button>
          <button
            type="button"
            onClick={() => navigate('/full-test')}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-ink hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Retake Test
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Practice simulation only — not an official ETS TOEFL score report.
        </p>
      </div>
    </div>
  )
}
