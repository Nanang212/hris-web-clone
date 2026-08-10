import { IconSpeakerphone } from '@tabler/icons-react'

export function AnnouncementBanner() {
  const announcements = [
    {
      id: 'ann-1',
      title: 'Town Hall',
      subtitle: 'System Maintenance · Updated Hybrid Work Policy',
    },
  ]

  return (
    <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-foreground/5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
          <IconSpeakerphone size={18} stroke={1.75} />
        </div>
        <div>
          {announcements.map((a) => (
            <div key={a.id}>
              <span className="text-sm font-semibold">{a.title}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {a.subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
      >
        View announcements
      </button>
    </div>
  )
}
