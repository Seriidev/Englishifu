export type ProfileTabId = 'learning' | 'badges' | 'certificates'

interface TabDef {
  id: ProfileTabId
  label: string
  countLabel?: string
}

interface ProfileTabsProps {
  active: ProfileTabId
  onChange: (id: ProfileTabId) => void
  badgesLabel: string
  certificatesCount: number
}

export default function ProfileTabs({
  active,
  onChange,
  badgesLabel,
  certificatesCount,
}: ProfileTabsProps) {
  const tabs: TabDef[] = [
    { id: 'learning', label: 'Learning Progress' },
    { id: 'badges', label: 'Badges', countLabel: badgesLabel },
    {
      id: 'certificates',
      label: 'Certificates of Completion',
      countLabel: `(${certificatesCount})`,
    },
  ]

  return (
    <div
      className="flex gap-1 overflow-x-auto border-b border-gray-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Profile sections"
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
            {tab.countLabel ? (
              <span className="ml-1 font-medium text-muted">
                {tab.countLabel}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
