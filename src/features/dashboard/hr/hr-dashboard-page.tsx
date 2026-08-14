import { IconAlertTriangle, IconCalendarCheck, IconUserCheck, IconUsers } from '@tabler/icons-react'

import { StatCard } from '@/features/dashboard/components/stat-card'
import { useGetHrDashboard } from '@/features/dashboard/hooks'
import { AnnouncementBanner } from '@/features/dashboard/hr/components/announcement-banner'
import {
  EmploymentCompliance,
  PeopleEvents,
  WorkforceMovement,
} from '@/features/dashboard/hr/components/dashboard-lists'
import { AlertBanner, HrActionCenter } from '@/features/dashboard/hr/components/hr-action-center'
import { WorkforceTrendChart } from '@/features/dashboard/hr/components/workforce-trend-chart'
import { m } from '@/i18n/paraglide/messages'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import { Button } from '@/shared/components/ui/button'

export function DashboardPage() {
  const { data, isPending, error } = useGetHrDashboard()

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
        { to: '/', label: 'Dashboard' },
        { to: '.', label: 'HR' },
      ]}
      title={m.dashboard_hr_title()}
      subtitle={m.dashboard_hr_subtitle()}
      actions={
        <>
          <Button size='sm' variant='outline'>
            16 May 2025
          </Button>
          <Button size='sm'>{m.dashboard_all_locations()}</Button>
          <Button size='sm'>{m.dashboard_customize()}</Button>
        </>
      }
    >
      {/* Alert Banner */}
      <AlertBanner
        count={data.employmentAlerts}
        message='Prioritize overdue approvals, expiring contracts, MCU due dates, and incomplete employee documents.'
      />

      {/* KPI Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label={m.dashboard_stat_total_employees()}
          value={data.totalEmployees?.toLocaleString() || '0'}
          subLabel='+5.2% vs last month'
          subLabelVariant='success'
          icon={IconUsers}
          iconBg='bg-blue-100 dark:bg-blue-900/40'
        />
        <StatCard
          label={m.dashboard_stat_present_today()}
          value={data.presentToday?.toLocaleString() || '0'}
          subLabel={`${data.presentPercentage}% attendance`}
          subLabelVariant='success'
          icon={IconCalendarCheck}
          iconBg='bg-emerald-100 dark:bg-emerald-900/40'
        />
        <StatCard
          label={m.dashboard_stat_pending_approvals()}
          value={data.pendingApprovals?.toLocaleString() || '0'}
          subLabel={`${data.overdueApprovals} overdue`}
          subLabelVariant='warning'
          icon={IconUserCheck}
          iconBg='bg-amber-100 dark:bg-amber-900/40'
        />
        <StatCard
          label={m.dashboard_stat_employment_alerts()}
          value={data.employmentAlerts?.toLocaleString() || '0'}
          subLabel='Contract · MCU · Docs'
          subLabelVariant='danger'
          icon={IconAlertTriangle}
          iconBg='bg-red-100 dark:bg-red-900/40'
        />
      </div>

      {/* Chart + Action Center */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]'>
        <WorkforceTrendChart />
        <HrActionCenter />
      </div>

      {/* Bottom Row */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <EmploymentCompliance items={data.compliance} />
        <WorkforceMovement items={data.movement} />
        <PeopleEvents items={data.events} />
      </div>

      {/* Announcement */}
      <AnnouncementBanner />
    </AppMain>
  )
}
