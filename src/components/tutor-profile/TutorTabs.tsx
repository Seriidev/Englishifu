export type TutorTabId =
  | 'classes'
  | 'students'
  | 'bookings'
  | 'kpi'
  | 'certifications'
  | 'account'

interface TabDef {
  id: TutorTabId
  label: string
}

interface TutorTabsProps {
  active: TutorTabId
  onChange: (id: TutorTabId) => void
  showAccount?: boolean
}

const baseTabs: TabDef[] = [
  { id: 'classes', label: 'Classes' },
  { id: 'students', label: 'Students' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'kpi', label: 'KPI' },
  { id: 'certifications', label: 'Certifications' },
]

export default function TutorTabs({
  active,
  onChange,
  showAccount = false,
}: TutorTabsProps) {
  const tabs = showAccount
    ? [...baseTabs, { id: 'account' as const, label: 'Account' }]
    : baseTabs

  return (
    <div
      className="flex gap-1 overflow-x-auto border-b border-gray-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Tutor profile sections"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold whitespace-nowrap transition sm:px-4 ${
              isActive
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
