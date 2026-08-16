import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { leaveBalances } from '@/features/leave/components/leave-data'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import { getLeaveTypeLabel } from '@/features/leave/components/leave-utils'
import { m } from '@/i18n/paraglide/messages'

const tones = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  orange: 'bg-orange-50 text-orange-600',
} as const

export function LeaveBalancePage() {
  return (
    <AppMain
      title={m.leave_balance_title()}
      subtitle={m.leave_balance_subtitle()}
      actions={<Button variant='outline'>{m.leave_export_balance()}</Button>}
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='balance' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {leaveBalances.map((balance) => (
          <section
            key={balance.code}
            className='rounded-2xl border border-border bg-card p-4 shadow-sm'
          >
            <div className='flex items-center gap-3'>
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl text-xs font-bold',
                  tones[balance.tone],
                )}
              >
                {balance.code}
              </span>
              <h3 className='font-semibold'>{getLeaveTypeLabel(balance.leaveType)}</h3>
            </div>
            <p className='mt-5 text-xs text-muted-foreground'>{m.leave_balance_available()}</p>
            <p className='mt-1 text-2xl font-bold'>{m.leave_days({ count: balance.available })}</p>
            <p className='mt-3 text-xs text-muted-foreground'>
              {m.leave_balance_used_pending({
                used:
                  balance.leaveType === 'annual' ? '4' : balance.leaveType === 'sick' ? '2' : '0',
                pending: balance.leaveType === 'annual' ? '1' : '0',
              })}
            </p>
            <div className='mt-3 border-t pt-3 text-xs text-rose-500'>
              {m.leave_expiry({ date: dayjs(balance.expiry).format('DD MMM YYYY') })}
            </div>
          </section>
        ))}
      </div>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='p-4'>
          <h3 className='font-semibold'>{m.leave_entitlement_title()}</h3>
          <p className='mt-1 text-xs text-muted-foreground'>{m.leave_entitlement_subtitle()}</p>
        </div>
        <Table>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead>{m.leave_table_type()}</TableHead>
              <TableHead>{m.leave_balance_opening()}</TableHead>
              <TableHead>{m.leave_balance_used()}</TableHead>
              <TableHead>{m.leave_stat_pending()}</TableHead>
              <TableHead>{m.leave_balance_available()}</TableHead>
              <TableHead>{m.leave_balance_expiry_date()}</TableHead>
              <TableHead>{m.leave_balance_expiry_rule()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveBalances.map((balance) => (
              <TableRow key={balance.code}>
                <TableCell className='font-medium'>
                  {getLeaveTypeLabel(balance.leaveType)}
                </TableCell>
                <TableCell>
                  {balance.leaveType === 'annual'
                    ? '16'
                    : balance.leaveType === 'sick'
                      ? '10'
                      : balance.available}
                </TableCell>
                <TableCell>
                  {balance.leaveType === 'annual' ? '4' : balance.leaveType === 'sick' ? '2' : '0'}
                </TableCell>
                <TableCell>{balance.leaveType === 'annual' ? '1' : '0'}</TableCell>
                <TableCell className='font-semibold text-emerald-600'>
                  {balance.available}
                </TableCell>
                <TableCell className='text-rose-500'>
                  {dayjs(balance.expiry).format('DD MMM YYYY')}
                </TableCell>
                <TableCell className='text-xs text-muted-foreground'>
                  {m.leave_balance_rule()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </AppMain>
  )
}
