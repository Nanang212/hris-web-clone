import { IconAlertCircle, IconCalendarWeek, IconCash, IconCircleCheck } from '@tabler/icons-react'

import { StatCard } from '@/features/dashboard/components/stat-card'
import { AttendanceDonutChart } from '@/features/dashboard/employee/components/attendance-donut-chart'
import { CheckInBanner } from '@/features/dashboard/employee/components/checkin-banner'
import {
  MyDocuments,
  PayrollTax,
  UpcomingEvents,
} from '@/features/dashboard/employee/components/employee-info-cards'
import { MyRequestCenter } from '@/features/dashboard/employee/components/my-request-center'
import { useGetEmployeeDashboard } from '@/features/dashboard/hooks'
import { m } from '@/i18n/paraglide/messages'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'

export function EmployeeDashboardPage() {
  const { data, isPending, error } = useGetEmployeeDashboard()

  if (isPending || error || !data) {
    return <AppMain pending={isPending} error={error} notFound={!data} />
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: 'Dashboard' },
        { to: '.', label: 'Employee' },
      ]}
      title={m.dashboard_employee_title()}
      subtitle={m.dashboard_employee_subtitle()}
      actions={
        <>
          <Button size='sm' variant='outline'>
            16 May 2025
          </Button>
          <Button size='sm'>{m.dashboard_my_profile()}</Button>
          <Button size='sm'>{m.dashboard_customize()}</Button>
        </>
      }
    >
      {/* Check-in Banner */}
      <CheckInBanner checkInTime={data.checkInTime} workEndTime={data.workEndTime} />

      {/* KPI Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label={m.dashboard_stat_attendance_today()}
          value={data.attendanceStatus}
          subLabel={`Check-in ${data.checkInTime}`}
          subLabelVariant='success'
          icon={IconCircleCheck}
          iconBg='bg-emerald-100 dark:bg-emerald-900/40'
        />
        <StatCard
          label={m.dashboard_stat_leave_balance()}
          value={`${data.leaveBalance} days`}
          subLabel='Annual leave'
          subLabelVariant='default'
          icon={IconCalendarWeek}
          iconBg='bg-blue-100 dark:bg-blue-900/40'
        />
        <StatCard
          label={m.dashboard_stat_next_payroll()}
          value={data.nextPayrollDate}
          subLabel='Payslip after processing'
          subLabelVariant='default'
          icon={IconCash}
          iconBg='bg-purple-100 dark:bg-purple-900/40'
        />
        <StatCard
          label={m.dashboard_stat_pending_requests()}
          value={data.pendingRequests?.toString()}
          subLabel='Leave · Claim'
          subLabelVariant='warning'
          icon={IconAlertCircle}
          iconBg='bg-amber-100 dark:bg-amber-900/40'
        />
      </div>

      {/* Attendance Chart + Request Center */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]'>
        <AttendanceDonutChart
          presentDays={data.attendanceStats?.presentDays}
          leaveDays={data.attendanceStats?.leaveDays}
          lateDays={data.attendanceStats?.lateDays}
          wfhDays={data.attendanceStats?.wfhDays}
          attendanceRate={data.attendanceStats?.attendanceRate}
        />
        <MyRequestCenter requests={data.requests} />
      </div>

      {/* Bottom Row: Documents, Payroll, Upcoming */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <MyDocuments items={data.documents} />
        <PayrollTax items={data.payrollTax} />
        <UpcomingEvents items={data.upcomingEvents} />
      </div>

      {/* Company Announcement */}
      {data.announcement && (
        <div className='flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-foreground/5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'>
              <span className='text-xs font-bold'>{data.announcement.tag}</span>
            </div>
            <div>
              <span className='text-sm font-semibold'>{data.announcement.title}</span>
              <p className='text-xs text-muted-foreground'>{data.announcement.summary}</p>
            </div>
          </div>
          <button
            type='button'
            className='shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted'
          >
            {data.announcement.readTime}
          </button>
        </div>
      )}
    </AppMain>
  )
}
