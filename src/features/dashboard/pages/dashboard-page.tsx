import {
  IconAlertTriangle,
  IconCalendarCheck,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react'

import { AnnouncementBanner } from '@/features/dashboard/components/announcement-banner'
import { AlertBanner, HrActionCenter } from '@/features/dashboard/components/hr-action-center'
import {
  EmploymentCompliance,
  PeopleEvents,
  WorkforceMovement,
} from '@/features/dashboard/components/dashboard-lists'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { WorkforceTrendChart } from '@/features/dashboard/components/workforce-trend-chart'

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs text-muted-foreground">Dashboard / HR</p>
          <h2 className="text-2xl font-bold tracking-tight">
            HR Operations Dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Workforce status, pending actions, employment alerts, and people
            events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground">
            16 May 2025
          </span>
          <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground">
            All locations
          </span>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Customize
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <AlertBanner
        count={31}
        message="Prioritize overdue approvals, expiring contracts, MCU due dates, and incomplete employee documents."
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value="1,248"
          subLabel="+5.2% vs last month"
          subLabelVariant="success"
          icon={IconUsers}
          iconBg="bg-blue-100 dark:bg-blue-900/40"
        />
        <StatCard
          label="Present Today"
          value="1,132"
          subLabel="90.7% attendance"
          subLabelVariant="success"
          icon={IconCalendarCheck}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        />
        <StatCard
          label="Pending Approvals"
          value="31"
          subLabel="5 overdue"
          subLabelVariant="warning"
          icon={IconUserCheck}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
        />
        <StatCard
          label="Employment Alerts"
          value="14"
          subLabel="Contract · MCU · Docs"
          subLabelVariant="danger"
          icon={IconAlertTriangle}
          iconBg="bg-red-100 dark:bg-red-900/40"
        />
      </div>

      {/* Chart + Action Center */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <WorkforceTrendChart />
        <HrActionCenter />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EmploymentCompliance />
        <WorkforceMovement />
        <PeopleEvents />
      </div>

      {/* Announcement */}
      <AnnouncementBanner />
    </div>
  )
}
