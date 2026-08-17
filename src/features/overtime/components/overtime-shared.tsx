import type { Icon } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { OvertimeRequest } from '@/features/overtime/types'
import { m } from '@/i18n/paraglide/messages'

interface OvertimeStatProps {
  icon: Icon
  label: string
  value: string
  detail: string
  tone: 'amber' | 'green' | 'blue' | 'red'
}

const statTone = {
  amber: 'bg-amber-500/10 text-amber-700',
  green: 'bg-green-500/10 text-green-700',
  blue: 'bg-blue-500/10 text-blue-700',
  red: 'bg-red-500/10 text-red-700',
}

const detailTone = {
  amber: 'text-amber-700',
  green: 'text-green-700',
  blue: 'text-blue-700',
  red: 'text-red-700',
}

export function OvertimeStat({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: Readonly<OvertimeStatProps>) {
  return (
    <Card>
      <CardContent className='flex items-center gap-3 px-4'>
        <div className={cn('flex size-10 items-center justify-center rounded-xl', statTone[tone])}>
          <Icon className='size-5' />
        </div>
        <div className='min-w-0'>
          <p className='text-xs text-muted-foreground'>{label}</p>
          <p className='mt-0.5 text-2xl leading-none font-bold'>{value}</p>
          <p className={cn('mt-1 text-xs font-medium', detailTone[tone])}>{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function OvertimeStatus({ status }: Readonly<{ status: OvertimeRequest['status'] }>) {
  const variants = { pending: 'amber', approved: 'green', rejected: 'red' } as const
  const labels = {
    pending: m.overtime_status_pending(),
    approved: m.overtime_status_approved(),
    rejected: m.overtime_status_rejected(),
  }
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

export function OvertimeRequestIdentity({
  status,
}: Readonly<{ status?: OvertimeRequest['status'] }>) {
  return (
    <section className='flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h2 className='font-semibold'>Budi Santoso</h2>
        <p className='text-xs text-muted-foreground'>EMP-2021-0042 · Infrastructure</p>
      </div>
      <div className='text-sm sm:text-center'>
        <p className='font-medium'>15 Aug 2026 · 18:00–21:30</p>
        <p className='mt-1 text-xs text-muted-foreground'>Maintenance server</p>
      </div>
      {status && <OvertimeStatus status={status} />}
    </section>
  )
}

export function OvertimeKeyValue({
  label,
  value,
  emphasis,
}: Readonly<{ label: string; value: string; emphasis?: 'green' | 'blue' }>) {
  return (
    <div className='flex items-center justify-between gap-4 border-b py-3 text-xs last:border-b-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span
        className={
          emphasis === 'green'
            ? 'font-semibold text-green-700'
            : emphasis === 'blue'
              ? 'font-semibold text-primary'
              : 'font-semibold'
        }
      >
        {value}
      </span>
    </div>
  )
}

export function OvertimeBackButton({
  to,
  label,
}: Readonly<{ to: '/overtime' | '/overtime/approval' | '/overtime/calculation'; label: string }>) {
  return (
    <Button variant='outline' size='sm' asChild>
      <Link to={to}>{label}</Link>
    </Button>
  )
}
