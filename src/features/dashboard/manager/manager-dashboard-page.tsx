import {
  IconAlertTriangle,
  IconCalendarOff,
  IconClipboardCheck,
  IconUsers,
} from '@tabler/icons-react'
import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import { Button } from '@/shared/components/ui/button'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { useGetManagerDashboard } from '@/features/dashboard/hooks'
import { AlertBanner } from '@/features/dashboard/hr/components/hr-action-center'
import { ManagerApprovalQueue } from '@/features/dashboard/manager/components/manager-approval-queue'
import {
  ContractProbation,
  TeamEvents,
  TeamMovement,
} from '@/features/dashboard/manager/components/manager-team-cards'
import { TeamAttendanceChart } from '@/features/dashboard/manager/components/team-attendance-chart'
import { m } from '@/i18n/paraglide/messages'

export function ManagerDashboardPage() {
  const { data, isPending, error } = useGetManagerDashboard()

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
        { to: '.', label: m.app_layout_nav_dashboard_manager() },
      ]}
      title={m.dashboard_manager_title()}
      subtitle={m.dashboard_manager_subtitle()}
      actions={
        <>
          <Button size='sm' variant='outline'>
            {dayjs().format('DD MMM YYYY')}
          </Button>
          <Button size='sm'>{m.dashboard_my_team()}</Button>
          <Button size='sm'>{m.dashboard_customize()}</Button>
        </>
      }
    >
      {/* Alert Banner */}
      <AlertBanner
        title={m.dashboard_team_actions_attention({ count: data.pendingApprovals })}
        message={m.dashboard_team_actions_attention_description({
          pending: data.pendingApprovals,
          overdue: data.overdueApprovals,
        })}
        actionLabel={m.dashboard_review_actions()}
      />

      {/* KPI Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label={m.dashboard_stat_team_members()}
          value={data.teamMembers?.toString() || '0'}
          subLabel={`${data.activeMembers} active · ${data.probationMembers} probation`}
          subLabelVariant='default'
          icon={IconUsers}
          iconVariant='default'
        />
        <StatCard
          label={m.dashboard_stat_team_attendance()}
          value={`${data.teamAttendance}%`}
          subLabel='Today'
          subLabelVariant='success'
          icon={IconClipboardCheck}
          iconVariant='success'
        />
        <StatCard
          label={m.dashboard_stat_pending_approvals()}
          value={data.pendingApprovals?.toString() || '0'}
          subLabel={`${data.overdueApprovals} overdue`}
          subLabelVariant='danger'
          icon={IconAlertTriangle}
          iconVariant='warning'
        />
        <StatCard
          label={m.dashboard_stat_on_leave_today()}
          value={data.onLeaveToday?.toString() || '0'}
          subLabel={`${data.leavePlanned} planned · ${data.leaveSick} sick`}
          subLabelVariant='default'
          icon={IconCalendarOff}
          iconVariant='default'
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
            <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
              <span className='text-xs font-bold'>TIP</span>
            </div>
            <div>
              <span className='text-sm font-semibold'>{m.dashboard_team_health_insight()}</span>
              <p className='text-xs text-muted-foreground'>{data.healthInsight}</p>
            </div>
          </div>
          <Button type='button' variant='outline' size='xs'>
            {m.dashboard_view_team_report()}
          </Button>
        </div>
      )}
    </AppMain>
  )
}
