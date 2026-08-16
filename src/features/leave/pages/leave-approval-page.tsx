import { Link } from '@tanstack/react-router'

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
import { leaveRequests } from '@/features/leave/components/leave-data'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import { formatLeavePeriod, getLeaveTypeLabel } from '@/features/leave/components/leave-utils'
import { m } from '@/i18n/paraglide/messages'

export function LeaveApprovalPage() {
  const pending = leaveRequests.filter((request) => request.status === 'pending')
  const coverageLabel = {
    safe: m.leave_coverage_safe(),
    review: m.leave_coverage_review(),
    conflict: m.leave_coverage_conflict(),
  }
  return (
    <AppMain
      title={m.leave_approval_title()}
      subtitle={m.leave_approval_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='approval' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          [
            m.leave_stat_pending(),
            '11',
            m.leave_stat_pending_detail(),
            'bg-orange-50 text-orange-500',
          ],
          [
            m.leave_stat_approved(),
            '8',
            m.leave_stat_on_leave_detail(),
            'bg-emerald-50 text-emerald-600',
          ],
          [
            m.leave_stat_rejected(),
            '1',
            m.leave_stat_on_leave_detail(),
            'bg-rose-50 text-rose-500',
          ],
          [
            m.leave_coverage_risk(),
            '2',
            m.leave_coverage_attention(),
            'bg-violet-50 text-violet-600',
          ],
        ].map(([label, value, detail, tone]) => (
          <section key={label} className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
            <span className={cn('inline-flex rounded-xl px-3 py-2 text-xs font-bold', tone)}>
              {label.slice(0, 2)}
            </span>
            <p className='mt-3 text-xs text-muted-foreground'>{label}</p>
            <p className='text-2xl font-bold'>{value}</p>
            <p className='mt-2 text-xs text-muted-foreground'>{detail}</p>
          </section>
        ))}
      </div>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='p-4'>
          <h3 className='font-semibold'>{m.leave_approval_queue_title()}</h3>
          <p className='mt-1 text-xs text-muted-foreground'>{m.leave_approval_queue_subtitle()}</p>
        </div>
        <Table>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead>{m.leave_table_employee()}</TableHead>
              <TableHead>{m.leave_table_type()}</TableHead>
              <TableHead>{m.leave_table_period()}</TableHead>
              <TableHead>{m.leave_table_duration()}</TableHead>
              <TableHead>{m.leave_approval_balance()}</TableHead>
              <TableHead>{m.leave_approval_coverage()}</TableHead>
              <TableHead>{m.leave_table_action()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employee}</TableCell>
                <TableCell>{getLeaveTypeLabel(request.leaveType)}</TableCell>
                <TableCell>{formatLeavePeriod(request.startDate, request.endDate)}</TableCell>
                <TableCell>{m.leave_days({ count: request.duration })}</TableCell>
                <TableCell>12 → 9</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs',
                      request.coverage === 'safe' && 'bg-emerald-50 text-emerald-600',
                      request.coverage === 'review' && 'bg-orange-50 text-orange-600',
                      request.coverage === 'conflict' && 'bg-rose-50 text-rose-500',
                    )}
                  >
                    {coverageLabel[request.coverage]}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size='sm' asChild>
                    <Link to='/leave/approval/$requestId' params={{ requestId: request.id }}>
                      {m.leave_approval_review()}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </AppMain>
  )
}
