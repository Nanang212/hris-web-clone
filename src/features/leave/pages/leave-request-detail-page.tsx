import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { leaveRequests } from '@/features/leave/components/leave-data'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import { getLeaveTypeLabel } from '@/features/leave/components/leave-utils'
import { m } from '@/i18n/paraglide/messages'

export function LeaveRequestDetailPage({ requestId }: Readonly<{ requestId: string }>) {
  const request = leaveRequests.find((item) => item.id === requestId) ?? leaveRequests[0]
  return (
    <AppMain
      title={m.leave_request_detail_title()}
      subtitle={m.leave_request_detail_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/leave', label: m.app_layout_nav_leave() },
        { to: '/leave/requests', label: m.leave_tab_requests() },
        { label: m.leave_request_detail_title() },
      ]}
      backTo='/leave/requests'
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='requests' />
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-xs font-semibold text-muted-foreground'>{request.id}</p>
              <h3 className='mt-2 text-xl font-bold'>{getLeaveTypeLabel(request.leaveType)}</h3>
            </div>
            <span className='rounded-full bg-orange-50 px-5 py-1.5 text-xs font-medium text-orange-600'>
              {m.leave_request_pending_approval()}
            </span>
          </div>
          <dl className='mt-6 grid gap-5 text-sm sm:grid-cols-[144px_1fr]'>
            <dt className='text-muted-foreground'>{m.leave_table_employee()}</dt>
            <dd className='font-medium'>{request.employee}</dd>
            <dt className='text-muted-foreground'>{m.leave_table_period()}</dt>
            <dd className='font-medium'>
              {dayjs(request.startDate).format('DD')}–{dayjs(request.endDate).format('DD MMM YYYY')}
            </dd>
            <dt className='text-muted-foreground'>{m.leave_table_duration()}</dt>
            <dd className='font-medium'>{m.leave_days({ count: request.duration })}</dd>
            <dt className='text-muted-foreground'>{m.leave_create_reason_label()}</dt>
            <dd className='font-medium'>{request.reason}</dd>
            <dt className='text-muted-foreground'>{m.leave_request_submitted()}</dt>
            <dd className='font-medium'>
              {dayjs(request.submittedAt).format('DD MMM YYYY · HH:mm')}
            </dd>
          </dl>
          <div className='mt-6 border-t pt-5'>
            <h4 className='font-semibold'>{m.leave_request_timeline_title()}</h4>
            <div className='mt-4 space-y-4 text-sm'>
              <div className='flex justify-between'>
                <span>{m.leave_request_timeline_submitted()}</span>
                <span className='text-emerald-600'>{m.leave_request_completed()}</span>
              </div>
              <div className='flex justify-between'>
                <span>{m.leave_request_timeline_manager()}</span>
                <span className='text-orange-500'>{m.leave_status_pending()}</span>
              </div>
              <div className='flex justify-between'>
                <span>{m.leave_request_timeline_hr()}</span>
                <span className='text-muted-foreground'>{m.leave_request_waiting()}</span>
              </div>
            </div>
          </div>
        </section>
        <aside className='h-fit rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='font-semibold'>{m.leave_request_impact_title()}</h3>
          <p className='mt-5 text-sm font-medium'>{getLeaveTypeLabel(request.leaveType)}</p>
          <dl className='mt-5 space-y-4 text-sm'>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>{m.leave_request_current_available()}</dt>
              <dd className='font-bold'>{m.leave_days({ count: '12' })}</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>{m.leave_request_requested()}</dt>
              <dd className='font-bold text-orange-500'>
                {m.leave_days({ count: request.duration })}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>{m.leave_request_remaining()}</dt>
              <dd className='font-bold text-emerald-600'>{m.leave_days({ count: '9' })}</dd>
            </div>
          </dl>
          <Button variant='outline' className='mt-6' asChild>
            <Link to='/leave/requests'>{m.leave_cancel_request()}</Link>
          </Button>
        </aside>
      </div>
    </AppMain>
  )
}
