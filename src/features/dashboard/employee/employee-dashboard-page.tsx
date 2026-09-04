import { IconAlertCircle, IconCalendarWeek, IconCash, IconCircleCheck } from '@tabler/icons-react'
import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
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

export function EmployeeDashboardPage() {
  const { data, isPending, error } = useGetEmployeeDashboard()

  if (isPending || error || !data) {
    return (
      <AppMain
        pending={isPending}
        error={error}
        notFound={!data}
        loadingComponent={
          <SkeletonPattern
            gap={16}
            rowGap={16}
            height={[64, 166, 311, 252, 72]}
            pattern={`
              ===========
              ==-==-==-==
              ========-==
              ===-===-===
              ===========
            `}
          />
        }
      />
    )
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_dashboard() },
        { to: '.', label: m.app_layout_nav_dashboard_employee() },
      ]}
      title={m.dashboard_employee_title()}
      subtitle={m.dashboard_employee_subtitle()}
      actions={
        <>
          <Button size='sm' variant='outline'>
            {dayjs().format('DD MMM YYYY')}
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
          iconVariant='success'
        />
        <StatCard
          label={m.dashboard_stat_leave_balance()}
          value={`${data.leaveBalance} days`}
          subLabel='Annual leave'
          subLabelVariant='default'
          icon={IconCalendarWeek}
          iconVariant='default'
        />
        <StatCard
          label={m.dashboard_stat_next_payroll()}
          value={data.nextPayrollDate}
          subLabel='Payslip after processing'
          subLabelVariant='default'
          icon={IconCash}
          iconVariant='default'
        />
        <StatCard
          label={m.dashboard_stat_pending_requests()}
          value={data.pendingRequests?.toString()}
          subLabel='Leave · Claim'
          subLabelVariant='warning'
          icon={IconAlertCircle}
          iconVariant='warning'
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
        <Alert variant='info'>
          <AlertIcon>
            <span className='text-xs font-bold'>{data.announcement.tag}</span>
          </AlertIcon>
          <div className='min-w-0 flex-1'>
            <AlertTitle>{data.announcement.title}</AlertTitle>
            <AlertDescription>{data.announcement.summary}</AlertDescription>
          </div>
          <AlertAction>
            <Button type='button' variant='outline' size='xs'>
              {data.announcement.readTime}
            </Button>
          </AlertAction>
        </Alert>
      )}
    </AppMain>
  )
}
