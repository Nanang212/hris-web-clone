import {
  IconAlertCircle,
  IconCalendarWeek,
  IconCash,
  IconCircleCheck,
} from '@tabler/icons-react'

import { AttendanceDonutChart } from '@/features/dashboard/components/attendance-donut-chart'
import { CheckInBanner } from '@/features/dashboard/components/checkin-banner'
import {
  MyDocuments,
  PayrollTax,
  UpcomingEvents,
} from '@/features/dashboard/components/employee-info-cards'
import { MyRequestCenter } from '@/features/dashboard/components/my-request-center'
import { StatCard } from '@/features/dashboard/components/stat-card'

export function EmployeeDashboardPage() {
  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs text-muted-foreground">Dashboard / Employee</p>
          <h2 className="text-2xl font-bold tracking-tight">My HR Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            My attendance, leave, payroll, requests, documents, and company
            updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground">
            16 May 2025
          </span>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            My profile
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Customize
          </button>
        </div>
      </div>

      {/* Check-in Banner */}
      <CheckInBanner checkInTime="08:42" workEndTime="17:30" />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Attendance Today"
          value="Present"
          subLabel="Check-in 08:42"
          subLabelVariant="success"
          icon={IconCircleCheck}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        />
        <StatCard
          label="Leave Balance"
          value="18 days"
          subLabel="Annual leave"
          subLabelVariant="default"
          icon={IconCalendarWeek}
          iconBg="bg-blue-100 dark:bg-blue-900/40"
        />
        <StatCard
          label="Next Payroll"
          value="25 May"
          subLabel="Payslip after processing"
          subLabelVariant="default"
          icon={IconCash}
          iconBg="bg-purple-100 dark:bg-purple-900/40"
        />
        <StatCard
          label="Pending Requests"
          value="2"
          subLabel="Leave · Claim"
          subLabelVariant="warning"
          icon={IconAlertCircle}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
        />
      </div>

      {/* Attendance Chart + Request Center */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <AttendanceDonutChart
          presentDays={18}
          leaveDays={2}
          lateDays={1}
          wfhDays={3}
          attendanceRate={94.7}
        />
        <MyRequestCenter />
      </div>

      {/* Bottom Row: Documents, Payroll, Upcoming */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MyDocuments />
        <PayrollTax />
        <UpcomingEvents />
      </div>

      {/* Company Announcement */}
      <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-foreground/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            <span className="text-xs font-bold">ANN</span>
          </div>
          <div>
            <span className="text-sm font-semibold">Company Announcement</span>
            <p className="text-xs text-muted-foreground">
              Hybrid Work Policy has been updated. Please review the effective
              date and employee guidelines.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="flex-shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          Read announcement
        </button>
      </div>
    </div>
  )
}
