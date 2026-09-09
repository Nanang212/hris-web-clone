// document-stats-cards.tsx — Reusable stats metric card grid matching Document Center design
import type React from 'react'

export interface DocumentStatCardItem {
  id: string
  label: string
  value: string | number
  subtext: string
  iconBadgeText: string
  iconBgClass: string
  iconTextClass: string
}

interface DocumentStatsCardsProps {
  items: DocumentStatCardItem[]
}

export function DocumentStatsCards({ items }: DocumentStatsCardsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {items.map((item) => (
        <div
          key={item.id}
          className='flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors hover:border-border'
        >
          <div
            className={`flex size-11 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold ${item.iconBgClass} ${item.iconTextClass}`}
          >
            {item.iconBadgeText}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-2xl font-bold tracking-tight text-foreground'>{item.value}</p>
            <p className='truncate text-xs font-semibold text-foreground/80'>{item.label}</p>
            <p className='truncate text-[11px] text-muted-foreground'>{item.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
