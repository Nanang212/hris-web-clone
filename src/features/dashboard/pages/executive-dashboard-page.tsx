import {
  IconArrowUpRight,
  IconTrendingDown,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'
import { ExecutiveAttention } from '@/features/dashboard/components/executive-attention'
import {
  HeadcountGrowthChart,
  OrgDistributionDonut,
  WorkforceMovementExecutive,
  WorkforceRisk,
} from '@/features/dashboard/components/executive-charts-cards'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { m } from '@/i18n/paraglide/messages'


interface ExecutiveDashboardData {
  headcount: number
  headcountGrowth: number
  attendanceRate: number
  attendanceRateChange: number
  payrollCost: string
  payrollCostChange: number
  turnover: number
  turnoverChange: number
  attention: {
    id: string
    label: string
    subLabel: string
    count: number
    variant: 'info' | 'warning' | 'danger' | 'success'
  }[]
  workforceMovement: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  distribution: { key: string; label: string; percentage: number; color: string }[]
  risk: { id: string; label: string; count: string | number; color?: string; countColor?: string }[]
  highlight?: string
}

export function ExecutiveDashboardPage({ data }: { data: ExecutiveDashboardData }) {
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
          <p className='text-xs text-muted-foreground'>Dashboard / Executive</p>
          <h2 className='text-2xl font-bold tracking-tight'>{m.dashboard_executive_title()}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{m.dashboard_executive_subtitle()}</p>
        </div>
        <div className='flex items-center gap-2'>
          <span className='rounded-lg border border-border px-3 py-1.5 text-xs font-medium'>
            16 May 2025
          </span>
          <button
            type='button'
            className='rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted'
          >
            {m.dashboard_all_companies()}
          </button>
          <button
            type='button'
            className='rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
          >
            {m.dashboard_customize()}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className='flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white shadow-sm'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20'>
          <IconArrowUpRight size={18} stroke={2} />
        </div>
        <div className='flex-1'>
          <p className='text-sm font-semibold'>{m.dashboard_workforce_stable()}</p>
          <p className='text-xs text-emerald-100'>
            Headcount is up {data.headcountGrowth}% year-to-date while turnover is down{' '}
            {Math.abs(data.turnoverChange)}
            percentage points.
          </p>
        </div>
        <button
          type='button'
          className='shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/30'
        >
          {m.dashboard_view_executive_report()}
        </button>
      </div>

      {/* KPI Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label={m.dashboard_stat_headcount()}
          value={data.headcount?.toLocaleString() || '0'}
          subLabel={`+${data.headcountGrowth}% YTD`}
          subLabelVariant='success'
          icon={IconUsers}
          iconBg='bg-blue-100 dark:bg-blue-900/40'
        />
        <StatCard
          label={m.dashboard_stat_attendance_rate()}
          value={`${data.attendanceRate}%`}
          subLabel={`+${data.attendanceRateChange} pts vs last month`}
          subLabelVariant='success'
          icon={IconArrowUpRight}
          iconBg='bg-emerald-100 dark:bg-emerald-900/40'
        />
        <StatCard
          label={m.dashboard_stat_payroll_cost()}
          value={data.payrollCost}
          subLabel={`+${data.payrollCostChange}% vs budget`}
          subLabelVariant='warning'
          icon={IconWallet}
          iconBg='bg-amber-100 dark:bg-amber-900/40'
        />
        <StatCard
          label={m.dashboard_stat_turnover()}
          value={`${data.turnover}%`}
          subLabel={`${data.turnoverChange} pts vs last quarter`}
          subLabelVariant={data.turnoverChange < 0 ? 'success' : 'danger'}
          icon={IconTrendingDown}
          iconBg='bg-purple-100 dark:bg-purple-900/40'
        />
      </div>

      {/* Chart + Executive Attention */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]'>
        <HeadcountGrowthChart />
        <ExecutiveAttention items={data.attention} />
      </div>

      {/* Bottom Row */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <WorkforceMovementExecutive items={data.workforceMovement} />
        <OrgDistributionDonut segments={data.distribution} />
        <WorkforceRisk items={data.risk} />
      </div>

      {/* Executive Highlight */}
      {data.highlight && (
        <div className='flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-foreground/5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
              <span className='text-xs font-bold'>INS</span>
            </div>
            <div>
              <span className='text-sm font-semibold'>Executive highlight</span>
              <p className='text-xs text-muted-foreground'>{data.highlight}</p>
            </div>
          </div>
          <button
            type='button'
            className='shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted'
          >
            Open analytics
          </button>
        </div>
      )}
    </div>
  )
}
