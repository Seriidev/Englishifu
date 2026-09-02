export type ProfileTabId = 'learning' | 'account'

interface TabDef {
  id: ProfileTabId
  label: string
}

interface ProfileTabsProps {
  active: ProfileTabId
  onChange: (id: ProfileTabId) => void
  showAccount?: boolean
}

export default function ProfileTabs({
  active,
  onChange,
  showAccount = false,
}: ProfileTabsProps) {
  const tabs: TabDef[] = [
    { id: 'learning', label: 'Learning Progress' },
    ...(showAccount ? [{ id: 'account' as const, label: 'Account' }] : []),
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
          </button>
        )
      })}
    </div>
  )
}
