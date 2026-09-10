import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconClockHour4,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import { cn } from '@/shared/lib/utils'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import { formatLeavePeriod, getLeaveTypeLabel } from '@/features/leave/components/leave-utils'
import { m } from '@/i18n/paraglide/messages'

export function LeaveApprovalPage() {
  const { leaves } = useApprovalSyncStore()
  const pending = leaves.filter((request) => request.status === 'pending')
  const coverageLabel = {
    safe: m.leave_coverage_safe(),
    review: m.leave_coverage_review(),
    conflict: m.leave_coverage_conflict(),
  }
  return (
    <AppMain
      title={m.leave_approval_title()}
      subtitle={m.leave_approval_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/leave', label: m.app_layout_nav_leave() },
        { label: m.leave_tab_approval() },
      ]}
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='approval' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          {
            label: m.leave_stat_pending(),
            value: '11',
            detail: m.leave_stat_pending_detail(),
            tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
            icon: IconClockHour4,
          },
          {
            label: m.leave_stat_approved(),
            value: '8',
            detail: m.leave_stat_on_leave_detail(),
            tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            icon: IconCircleCheck,
          },
          {
            label: m.leave_stat_rejected(),
            value: '1',
            detail: m.leave_stat_on_leave_detail(),
            tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            icon: IconCircleX,
          },
          {
            label: m.leave_coverage_risk(),
            value: '2',
            detail: m.leave_coverage_attention(),
            tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
            icon: IconAlertTriangle,
          },
        ].map(({ label, value, detail, tone, icon: Icon }) => (
          <Card key={label}>
            <CardContent className='p-4'>
              <span className={cn('inline-flex rounded-xl p-2.5', tone)} aria-hidden='true'>
                <Icon className='size-5' />
              </span>
              <p className='mt-3 text-xs text-muted-foreground'>{label}</p>
              <p className='text-2xl font-bold'>{value}</p>
              <p className='mt-2 text-xs text-muted-foreground'>{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className='min-w-0 overflow-hidden'>
        <CardHeader className='p-4'>
          <CardTitle>{m.leave_approval_queue_title()}</CardTitle>
          <p className='mt-1 text-xs text-muted-foreground'>{m.leave_approval_queue_subtitle()}</p>
        </CardHeader>
        <div className='w-full overflow-x-auto pb-1'>
          <Table className='min-w-[900px]'>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead className='whitespace-nowrap'>{m.leave_table_employee()}</TableHead>
                <TableHead className='whitespace-nowrap'>{m.leave_table_type()}</TableHead>
                <TableHead className='whitespace-nowrap'>{m.leave_table_period()}</TableHead>
                <TableHead className='whitespace-nowrap'>{m.leave_table_duration()}</TableHead>
                <TableHead className='whitespace-nowrap'>{m.leave_approval_balance()}</TableHead>
                <TableHead className='whitespace-nowrap'>{m.leave_approval_coverage()}</TableHead>
                <TableHead className='whitespace-nowrap'>{m.leave_table_action()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className='font-medium whitespace-nowrap'>
                    {request.employee}
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {getLeaveTypeLabel(request.leaveType)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {formatLeavePeriod(request.startDate, request.endDate)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {m.leave_days({ count: request.duration })}
                  </TableCell>
                  <TableCell className='font-mono whitespace-nowrap'>12 → 9</TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <span
                      className={cn(
                        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap',
                        request.coverage === 'safe' && 'bg-emerald-50 text-emerald-600',
                        request.coverage === 'review' && 'bg-orange-50 text-orange-600',
                        request.coverage === 'conflict' && 'bg-rose-50 text-rose-500',
                      )}
                    >
                      {coverageLabel[request.coverage]}
                    </span>
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <Button variant='link' size='sm' asChild>
                      <Link to='/leave/approval/$requestId' params={{ requestId: request.id }}>
                        {m.leave_approval_review()}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </AppMain>
  )
}
