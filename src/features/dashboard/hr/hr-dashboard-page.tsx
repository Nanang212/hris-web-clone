import { IconAlertTriangle, IconCalendarCheck, IconUserCheck, IconUsers } from '@tabler/icons-react'

import { AnnouncementBanner } from './components/announcement-banner'
import {
  EmploymentCompliance,
  PeopleEvents,
  WorkforceMovement,
} from './components/dashboard-lists'
import { AlertBanner, HrActionCenter } from './components/hr-action-center'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { WorkforceTrendChart } from './components/workforce-trend-chart'
import { m } from '@/i18n/paraglide/messages'


interface HRDashboardData {
  totalEmployees: number
  presentToday: number
  presentPercentage: number
  pendingApprovals: number
  overdueApprovals: number
  employmentAlerts: number
  compliance: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  movement: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  events: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
}

export function DashboardPage({ data }: { data: HRDashboardData | undefined }) {
  if (!data) {
    return (
      <div className='flex min-h-125 flex-col items-center justify-center gap-3 p-8 text-center'>
        <p className='text-sm text-muted-foreground'>No dashboard data found.</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-5 p-5 lg:p-6'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-start'>
        <div>
          <p className='text-xs text-muted-foreground'>Dashboard / HR</p>
          <h2 className='text-2xl font-bold tracking-tight'>{m.dashboard_hr_title()}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{m.dashboard_hr_subtitle()}</p>
        </div>
        <div className='flex items-center gap-2'>
          <span className='rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground'>
            16 May 2025
          </span>
          <span className='rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground'>
            {m.dashboard_all_locations()}
          </span>
          <button
            type='button'
            className='rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
          >
            {m.dashboard_customize()}
          </button>
        </div>
      </div>

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
    </div>
  )
}
