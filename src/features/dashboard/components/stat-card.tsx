import type { TablerIcon } from '@tabler/icons-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  subLabelVariant?: 'default' | 'success' | 'warning' | 'danger'
  icon?: TablerIcon
  iconVariant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function StatCard({
  label,
  value,
  subLabel,
  subLabelVariant = 'default',
  icon: Icon,
  iconVariant = 'default',
  className,
}: Readonly<StatCardProps>) {
  const subLabelClass = {
    default: 'text-muted-foreground',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-destructive',
  }[subLabelVariant]

  const iconClass = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-destructive/10 text-destructive',
  }[iconVariant]

  return (
    <Card className={cn('gap-3', className)}>
      <CardHeader className='gap-3'>
        {Icon && (
          <div className={cn('flex size-10 items-center justify-center rounded-xl', iconClass)}>
            <Icon size={20} stroke={1.75} />
          </div>
        )}
        <CardTitle className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold tracking-tight'>{value}</p>
        {subLabel && <p className={cn('mt-0.5 text-xs font-medium', subLabelClass)}>{subLabel}</p>}
      </CardContent>
    </Card>
  )
}
