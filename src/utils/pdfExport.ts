import jsPDF from 'jspdf'
import type { FullTestResult } from '../scoring/overallScoring'

export function downloadResultsPDF(result: FullTestResult): void {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text('TOEFL Practice Test Results', 20, 24)

  doc.setFontSize(11)
  doc.setTextColor(80)
  doc.text(`Date: ${new Date(result.completedAt).toLocaleString()}`, 20, 38)
  doc.text(`Duration: ${result.testDurationMinutes} minutes`, 20, 46)

  doc.setTextColor(0)
  doc.setFontSize(14)
  doc.text(
    `Overall Band Score: ${result.overallBandScore.toFixed(1)} (${result.cefr})`,
    20,
    60,
  )

  doc.setFontSize(12)
  let y = 78
  const sections: [string, { rawScore: number; bandScore: number }][] = [
    ['Reading', result.reading],
    ['Listening', result.listening],
    ['Speaking', result.speaking],
    ['Writing', result.writing],
  ]

  doc.text('Section breakdown', 20, y)
  y += 10

  sections.forEach(([name, score]) => {
    doc.text(
      `${name}: Band ${score.bandScore.toFixed(1)}  (raw: ${score.rawScore})`,
      24,
      y,
    )
    y += 10
  })

  y += 8
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text('Englishifu · Practice simulation (not an official ETS score report)', 20, y)

  doc.save(`toefl-results-${Date.now()}.pdf`)
}
