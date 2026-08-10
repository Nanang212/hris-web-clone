import { IconArrowRight } from '@tabler/icons-react'

import { cn } from '@/shared/lib/utils'

const variantStyles = {
  info: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  warning: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  danger: {
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  success: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
}

interface QueueItem {
  id: string
  label: string
  subLabel: string
  count: number
  variant: 'info' | 'warning' | 'danger' | 'success'
}

export function ManagerApprovalQueue({ items: propItems }: { items?: QueueItem[] }) {
  const defaultItems: QueueItem[] = [
    {
      id: 'leave',
      label: 'Leave requests',
      subLabel: '3 employees',
      count: 3,
      variant: 'info' as const,
    },
    {
      id: 'attendance',
      label: 'Attendance correction',
      subLabel: '2 employees',
      count: 2,
      variant: 'warning' as const,
    },
    {
      id: 'overtime',
      label: 'Overtime requests',
      subLabel: '2 employees',
      count: 2,
      variant: 'danger' as const,
    },
    {
      id: 'claim',
      label: 'Claim approvals',
      subLabel: '2 employees',
      count: 2,
      variant: 'success' as const,
    },
  ]

  const items = propItems
    ? propItems.map(item => ({
        id: item.id,
        label: item.label,
        subLabel: item.subLabel,
        count: item.count,
        variant: (item.variant === 'info' || item.variant === 'warning' || item.variant === 'danger' || item.variant === 'success') ? item.variant : 'info'
      }))
    : defaultItems

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Manager Approval Queue</h3>
          <p className="text-xs text-muted-foreground">
            Items waiting for your decision
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all
          <IconArrowRight size={12} />
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border/50">
        {items.map((item) => {
          const styles = variantStyles[item.variant] || variantStyles.info
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span
                className={cn('h-2 w-2 flex-shrink-0 rounded-full', styles.dot)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.subLabel}</p>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-bold',
                  styles.badge
                )}
              >
                {item.count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
