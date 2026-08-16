import {
  IconCalendarPlus,
  IconClipboardCheck,
  IconClockHour4,
  IconHistory,
  IconHourglass,
  IconListDetails,
  IconWallet,
  type Icon,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
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
import { leaveBalances, leaveRequests } from '@/features/leave/components/leave-data'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import {
  formatLeavePeriod,
  getLeaveTypeLabel,
  LeaveStatus,
} from '@/features/leave/components/leave-utils'
import { m } from '@/i18n/paraglide/messages'

interface LeaveStatProps {
  icon: Icon
  label: string
  value: string
  detail: string
  iconClassName: string
  detailClassName: string
}

interface QuickActionProps {
  icon: Icon
  code: string
  title: string
  description: string
}

const balanceTone = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  orange: 'bg-orange-50 text-orange-600',
} as const

function LeaveStat({
  icon: Icon,
  label,
  value,
  detail,
  iconClassName,
  detailClassName,
}: Readonly<LeaveStatProps>) {
  return (
    <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <span className={cn('flex size-10 items-center justify-center rounded-xl', iconClassName)}>
          <Icon className='size-5' />
        </span>
        <div>
          <p className='text-xs text-muted-foreground'>{label}</p>
          <p className='mt-1 text-2xl leading-none font-bold'>{value}</p>
        </div>
      </div>
      <p className={cn('mt-3 text-xs font-medium', detailClassName)}>{detail}</p>
    </section>
  )
}

function QuickAction({ icon: Icon, code, title, description }: Readonly<QuickActionProps>) {
  return (
    <Button
      type='button'
      variant='outline'
      className='h-auto min-h-20 w-full justify-start gap-3 rounded-xl p-3 text-left'
    >
      <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-primary'>
        {code}
      </span>
      <span>
        <span className='flex items-center gap-1 text-xs font-semibold'>
          {title}
          <Icon className='size-3 text-muted-foreground' />
        </span>
        <span className='mt-1 block text-xs text-muted-foreground'>{description}</span>
      </span>
    </Button>
  )
}

export function LeaveOverviewPage() {
  const quickActions: QuickActionProps[] = [
    {
      icon: IconCalendarPlus,
      code: 'REQ',
      title: m.leave_action_create_title(),
      description: m.leave_action_create_description(),
    },
    {
      icon: IconClipboardCheck,
      code: 'APP',
      title: m.leave_action_approval_title(),
      description: m.leave_action_approval_description(),
    },
    {
      icon: IconWallet,
      code: 'BAL',
      title: m.leave_action_balance_title(),
      description: m.leave_action_balance_description(),
    },
    {
      icon: IconHistory,
      code: 'HIS',
      title: m.leave_action_history_title(),
      description: m.leave_action_history_description(),
    },
  ]

  return (
    <AppMain
      title={m.leave_overview_title()}
      subtitle={m.leave_overview_subtitle()}
      actions={
        <Button className='rounded-lg' asChild>
          <Link to='/leave/requests/new'>
            <IconCalendarPlus />
            {m.leave_new_request()}
          </Link>
        </Button>
      }
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='overview' />

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <LeaveStat
          icon={IconHourglass}
          iconClassName='bg-orange-50 text-orange-500'
          label={m.leave_stat_pending()}
          value='11'
          detail={m.leave_stat_pending_detail()}
          detailClassName='text-orange-500'
        />
        <LeaveStat
          icon={IconClipboardCheck}
          iconClassName='bg-emerald-50 text-emerald-600'
          label={m.leave_stat_approved()}
          value='14'
          detail={m.leave_stat_approved_detail()}
          detailClassName='text-emerald-600'
        />
        <LeaveStat
          icon={IconListDetails}
          iconClassName='bg-rose-50 text-rose-500'
          label={m.leave_stat_rejected()}
          value='3'
          detail={m.leave_stat_rejected_detail()}
          detailClassName='text-rose-500'
        />
        <LeaveStat
          icon={IconClockHour4}
          iconClassName='bg-blue-50 text-blue-600'
          label={m.leave_stat_on_leave()}
          value='28'
          detail={m.leave_stat_on_leave_detail()}
          detailClassName='text-primary'
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]'>
        <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
          <div className='flex items-start justify-between gap-3 p-4 pb-2'>
            <div>
              <h3 className='font-semibold'>{m.leave_recent_requests_title()}</h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {m.leave_recent_requests_subtitle()}
              </p>
            </div>
            <Button size='sm' variant='link' asChild>
              <Link to='/leave/requests'>{m.leave_view_all()}</Link>
            </Button>
          </div>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead>{m.leave_table_employee()}</TableHead>
                <TableHead>{m.leave_table_type()}</TableHead>
                <TableHead>{m.leave_table_period()}</TableHead>
                <TableHead>{m.leave_table_duration()}</TableHead>
                <TableHead>{m.leave_table_status()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={`${request.employee}-${request.startDate}`}>
                  <TableCell className='text-xs font-medium'>{request.employee}</TableCell>
                  <TableCell className='text-xs'>{getLeaveTypeLabel(request.leaveType)}</TableCell>
                  <TableCell className='text-xs'>
                    {formatLeavePeriod(request.startDate, request.endDate)}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {m.leave_days({ count: request.duration })}
                  </TableCell>
                  <TableCell>
                    <LeaveStatus status={request.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <h3 className='font-semibold'>{m.leave_balance_snapshot_title()}</h3>
          <p className='mt-1 text-xs text-muted-foreground'>
            {m.leave_balance_snapshot_subtitle()}
          </p>
          <div className='mt-4 space-y-3'>
            {leaveBalances.map((balance) => (
              <div key={balance.code} className='flex items-center gap-3'>
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                    balanceTone[balance.tone],
                  )}
                >
                  {balance.code}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-xs font-semibold'>
                    {getLeaveTypeLabel(balance.leaveType)}
                  </p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {m.leave_available_days({ count: balance.available })}
                  </p>
                </div>
                <p className='text-right text-[11px] font-medium text-rose-500'>
                  {m.leave_expiry({ date: dayjs(balance.expiry).format('DD MMM YYYY') })}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
        <h3 className='font-semibold'>{m.leave_quick_actions_title()}</h3>
        <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {quickActions.map((action) => (
            <QuickAction key={action.code} {...action} />
          ))}
        </div>
      </section>
    </AppMain>
  )
}
