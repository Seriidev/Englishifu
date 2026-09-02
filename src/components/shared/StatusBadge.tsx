import { palette } from '../../theme/palette'

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  approved: { bg: '#DCFCE7', text: palette.statusGreen },
  pending: { bg: '#FFEDD5', text: palette.statusOrange },
  incomplete: { bg: '#FEE2E2', text: palette.statusRed },
  rejected: { bg: '#FEE2E2', text: palette.statusRed },
  suspended: { bg: '#FEE2E2', text: palette.statusRed },
  confirmed: { bg: '#E0E7FF', text: palette.primaryHover },
  completed: { bg: '#DCFCE7', text: palette.statusGreen },
  cancelled: { bg: '#FEE2E2', text: palette.statusRed },
  online: { bg: '#DCFCE7', text: palette.statusGreen },
  busy: { bg: '#FEE2E2', text: palette.statusRed },
  away: { bg: '#FFEDD5', text: palette.statusOrange },
  interview: { bg: '#F3E8FF', text: palette.statusPurple },
}

function prettyLabel(status: string) {
  return status
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

export function StatusBadge({
  status,
  label,
}: {
  status: string
  label?: string
}) {
  const key = status.trim().toLowerCase()
  const style = STATUS_STYLES[key] ?? { bg: '#F1F5F9', text: '#64748B' }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label ?? prettyLabel(status)}
    </span>
  )
}

export default StatusBadge
