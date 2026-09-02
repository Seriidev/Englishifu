/** Shared UI palette — accent and status colors stay the same in both themes. */
export const palette = {
  light: {
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
  },
  dark: {
    background: '#0F172A',
    cardBackground: '#1E293B',
    border: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
  },
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  statusRed: '#EF4444',
  statusGreen: '#22C55E',
  statusPurple: '#A855F7',
  statusOrange: '#F97316',
} as const
