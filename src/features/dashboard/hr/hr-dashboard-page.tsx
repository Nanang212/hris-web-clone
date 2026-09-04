import { IconAlertTriangle, IconCalendarCheck, IconUserCheck, IconUsers } from '@tabler/icons-react'
import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import { Button } from '@/shared/components/ui/button'
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

export function HrDashboardPage() {
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
        { to: '/', label: m.app_layout_nav_dashboard() },
        { to: '.', label: m.app_layout_nav_dashboard_hr() },
      ]}
      title={m.dashboard_hr_title()}
      subtitle={m.dashboard_hr_subtitle()}
      actions={
        <>
          <Button size='sm' variant='outline'>
            {dayjs().format('DD MMM YYYY')}
          </Button>
          <Button size='sm'>{m.dashboard_all_locations()}</Button>
          <Button size='sm'>{m.dashboard_customize()}</Button>
        </>
      }
    >
      {/* Alert Banner */}
      <AlertBanner
        title={m.dashboard_hr_actions_attention({ count: data.employmentAlerts })}
        message={m.dashboard_hr_actions_attention_description()}
        actionLabel={m.dashboard_open_action_center()}
      />

      {/* KPI Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label={m.dashboard_stat_total_employees()}
          value={data.totalEmployees?.toLocaleString() || '0'}
          subLabel='+5.2% vs last month'
          subLabelVariant='success'
          icon={IconUsers}
          iconVariant='default'
        />
        <StatCard
          label={m.dashboard_stat_present_today()}
          value={data.presentToday?.toLocaleString() || '0'}
          subLabel={`${data.presentPercentage}% attendance`}
          subLabelVariant='success'
          icon={IconCalendarCheck}
          iconVariant='success'
        />
        <StatCard
          label={m.dashboard_stat_pending_approvals()}
          value={data.pendingApprovals?.toLocaleString() || '0'}
          subLabel={`${data.overdueApprovals} overdue`}
          subLabelVariant='warning'
          icon={IconUserCheck}
          iconVariant='warning'
        />
        <StatCard
          label={m.dashboard_stat_employment_alerts()}
          value={data.employmentAlerts?.toLocaleString() || '0'}
          subLabel='Contract · MCU · Docs'
          subLabelVariant='danger'
          icon={IconAlertTriangle}
          iconVariant='danger'
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
