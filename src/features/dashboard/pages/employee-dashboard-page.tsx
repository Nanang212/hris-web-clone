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
import { m } from '@/i18n/paraglide/messages'

import { useState, useEffect } from 'react'
import { fetchDashboard } from '@/features/dashboard/api'
import { IconAlertTriangle } from '@tabler/icons-react'

interface EmployeeDashboardData {
  attendanceStatus: string
  checkInTime: string
  workEndTime: string
  leaveBalance: number
  nextPayrollDate: string
  pendingRequests: number
  attendanceStats: {
    presentDays: number
    leaveDays: number
    lateDays: number
    wfhDays: number
    attendanceRate: number
  }
  requests: { id: string; category: string; detail: string; status: string; dateRange: string }[]
  documents: { id: string; label: string; value: string; statusColor?: string; color?: string }[]
  payrollTax: { id: string; label: string; value: string; statusColor?: string; color?: string }[]
  upcomingEvents: { id: string; label: string; value: string; statusColor?: string; color?: string }[]
  announcement?: { tag: string; title: string; summary: string; readTime: string }
}

export function EmployeeDashboardPage() {
  const [data, setData] = useState<EmployeeDashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const result = await fetchDashboard({ role: 'EMPLOYEE' })
      setData(result.employeeDashboard)
      setLoading(false)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong'
      setError(errMsg)
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    loadData()
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <IconAlertTriangle size={32} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Failed to load dashboard</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error}</p>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-muted-foreground">No dashboard data found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs text-muted-foreground">Dashboard / Employee</p>
          <h2 className="text-2xl font-bold tracking-tight">
            {m.dashboard_employee_title()}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {m.dashboard_employee_subtitle()}
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
            {m.dashboard_my_profile()}
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {m.dashboard_customize()}
          </button>
        </div>
      </div>

      {/* Check-in Banner */}
      <CheckInBanner checkInTime={data.checkInTime} workEndTime={data.workEndTime} />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={m.dashboard_stat_attendance_today()}
          value={data.attendanceStatus}
          subLabel={`Check-in ${data.checkInTime}`}
          subLabelVariant="success"
          icon={IconCircleCheck}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        />
        <StatCard
          label={m.dashboard_stat_leave_balance()}
          value={`${data.leaveBalance} days`}
          subLabel="Annual leave"
          subLabelVariant="default"
          icon={IconCalendarWeek}
          iconBg="bg-blue-100 dark:bg-blue-900/40"
        />
        <StatCard
          label={m.dashboard_stat_next_payroll()}
          value={data.nextPayrollDate}
          subLabel="Payslip after processing"
          subLabelVariant="default"
          icon={IconCash}
          iconBg="bg-purple-100 dark:bg-purple-900/40"
        />
        <StatCard
          label={m.dashboard_stat_pending_requests()}
          value={data.pendingRequests?.toString()}
          subLabel="Leave · Claim"
          subLabelVariant="warning"
          icon={IconAlertCircle}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
        />
      </div>

      {/* Attendance Chart + Request Center */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MyDocuments items={data.documents} />
        <PayrollTax items={data.payrollTax} />
        <UpcomingEvents items={data.upcomingEvents} />
      </div>

      {/* Company Announcement */}
      {data.announcement && (
        <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-foreground/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <span className="text-xs font-bold">{data.announcement.tag}</span>
            </div>
            <div>
              <span className="text-sm font-semibold">{data.announcement.title}</span>
              <p className="text-xs text-muted-foreground">
                {data.announcement.summary}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex-shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            {data.announcement.readTime}
          </button>
        </div>
      )}
    </div>
  )
}
