import {
  IconAlertTriangle,
  IconCalendarOff,
  IconClipboardCheck,
  IconUsers,
} from '@tabler/icons-react'
import { AlertBanner } from '@/features/dashboard/hr/components/hr-action-center'
import { ManagerApprovalQueue } from './components/manager-approval-queue'
import {
  ContractProbation,
  TeamEvents,
  TeamMovement,
} from './components/manager-team-cards'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { TeamAttendanceChart } from './components/team-attendance-chart'
import { m } from '@/i18n/paraglide/messages'


interface ManagerDashboardData {
  teamMembers: number
  activeMembers: number
  probationMembers: number
  teamAttendance: number
  pendingApprovals: number
  overdueApprovals: number
  onLeaveToday: number
  leavePlanned: number
  leaveSick: number
  approvalQueue: {
    id: string
    label: string
    subLabel: string
    count: number
    variant: 'info' | 'warning' | 'danger' | 'success'
  }[]
  contractProbation: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  teamMovement: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  teamEvents: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  healthInsight?: string
}

export function ManagerDashboardPage({ data }: { data: ManagerDashboardData | undefined }) {
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
          <p className='text-xs text-muted-foreground'>Dashboard / Manager</p>
          <h2 className='text-2xl font-bold tracking-tight'>{m.dashboard_manager_title()}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{m.dashboard_manager_subtitle()}</p>
        </div>
        <div className='flex items-center gap-2'>
          <span className='rounded-lg border border-border px-3 py-1.5 text-xs font-medium'>
            16 May 2025
          </span>
          <button
            type='button'
            className='rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted'
          >
            {m.dashboard_my_team()}
          </button>
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
        count={data.pendingApprovals}
        message={`${data.pendingApprovals} leave requests, ${data.overdueApprovals} overdue items waiting for your review.`}
      />

      {/* KPI Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label={m.dashboard_stat_team_members()}
          value={data.teamMembers?.toString() || '0'}
          subLabel={`${data.activeMembers} active · ${data.probationMembers} probation`}
          subLabelVariant='default'
          icon={IconUsers}
          iconBg='bg-blue-100 dark:bg-blue-900/40'
        />
        <StatCard
          label={m.dashboard_stat_team_attendance()}
          value={`${data.teamAttendance}%`}
          subLabel='Today'
          subLabelVariant='success'
          icon={IconClipboardCheck}
          iconBg='bg-emerald-100 dark:bg-emerald-900/40'
        />
        <StatCard
          label={m.dashboard_stat_pending_approvals()}
          value={data.pendingApprovals?.toString() || '0'}
          subLabel={`${data.overdueApprovals} overdue`}
          subLabelVariant='danger'
          icon={IconAlertTriangle}
          iconBg='bg-amber-100 dark:bg-amber-900/40'
        />
        <StatCard
          label={m.dashboard_stat_on_leave_today()}
          value={data.onLeaveToday?.toString() || '0'}
          subLabel={`${data.leavePlanned} planned · ${data.leaveSick} sick`}
          subLabelVariant='default'
          icon={IconCalendarOff}
          iconBg='bg-purple-100 dark:bg-purple-900/40'
        />
      </div>

      {/* Chart + Approval Queue */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]'>
        <TeamAttendanceChart />
        <ManagerApprovalQueue items={data.approvalQueue} />
      </div>

      {/* Bottom Row */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <ContractProbation items={data.contractProbation} />
        <TeamMovement items={data.teamMovement} />
        <TeamEvents items={data.teamEvents} />
      </div>

      {/* Team Health Insight */}
      {data.healthInsight && (
        <div className='flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-foreground/5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
              <span className='text-xs font-bold'>TIP</span>
            </div>
            <div>
              <span className='text-sm font-semibold'>Team health insight</span>
              <p className='text-xs text-muted-foreground'>{data.healthInsight}</p>
            </div>
          </div>
          <button
            type='button'
            className='shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted'
          >
            View team report
          </button>
        </div>
      )}
    </div>
  )
}
