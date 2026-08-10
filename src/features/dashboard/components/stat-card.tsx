import type { TablerIcon } from '@tabler/icons-react'

import { cn } from '@/shared/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  subLabelVariant?: 'default' | 'success' | 'warning' | 'danger'
  icon?: TablerIcon
  iconBg?: string
  className?: string
}

export function StatCard({
  label,
  value,
  subLabel,
  subLabelVariant = 'default',
  icon: Icon,
  iconBg,
  className,
}: Readonly<StatCardProps>) {
  const subLabelClass = {
    default: 'text-muted-foreground',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  }[subLabelVariant]

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconBg ?? 'bg-muted'
          )}
        >
          <Icon size={20} stroke={1.75} className="text-foreground/70" />
        </div>
      )}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        {subLabel && (
          <p className={cn('mt-0.5 text-xs font-medium', subLabelClass)}>
            {subLabel}
          </p>
        )}
      </div>
    </div>
  )
}
