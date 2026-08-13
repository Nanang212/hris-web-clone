import { IconAlertCircle, IconArrowRight } from '@tabler/icons-react'

import { cn } from '@/shared/lib/utils'

interface ActionItem {
  id: string
  label: string
  sublabel: string
  count: number
  variant: 'info' | 'warning' | 'danger' | 'success'
}

const actionItems: ActionItem[] = [
  {
    id: 'leave-approvals',
    label: 'Leave approvals',
    sublabel: '12 waiting · 4 overdue',
    count: 12,
    variant: 'info',
  },
  {
    id: 'claim-reviews',
    label: 'Claim reviews',
    sublabel: '8 submissions',
    count: 8,
    variant: 'warning',
  },
  {
    id: 'contract-expiry',
    label: 'Contract expiry',
    sublabel: '5 within 30 days',
    count: 5,
    variant: 'danger',
  },
  {
    id: 'employee-changes',
    label: 'Employee changes',
    sublabel: '6 profile updates',
    count: 6,
    variant: 'success',
  },
]

const variantStyles = {
  info: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  warning: {
    dot: 'bg-amber-500',
    badge:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  danger: {
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  success: {
    dot: 'bg-emerald-500',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
}

export function HrActionCenter() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">HR Action Center</h3>
          <p className="text-xs text-muted-foreground">
            Prioritized operational work
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
        {actionItems.map((item) => {
          const styles = variantStyles[item.variant]
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span
                className={cn('mt-0.5 h-2 w-2 flex-shrink-0 rounded-full', styles.dot)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sublabel}</p>
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

interface AlertBannerProps {
  count: number
  message: string
}

export function AlertBanner({ count, message }: Readonly<AlertBannerProps>) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-blue-600 px-5 py-3.5 text-white shadow-sm">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
        <IconAlertCircle size={18} stroke={2} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">
          {count} HR actions need attention
        </p>
        <p className="text-xs text-blue-100">{message}</p>
      </div>
      <button
        type="button"
        className="flex-shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors"
      >
        Open action center
      </button>
    </div>
  )
}
