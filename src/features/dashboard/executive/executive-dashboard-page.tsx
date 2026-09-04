import { IconArrowUpRight, IconTrendingDown, IconUsers, IconWallet } from '@tabler/icons-react'
import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import { Button } from '@/shared/components/ui/button'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { ExecutiveAttention } from '@/features/dashboard/executive/components/executive-attention'
import {
  HeadcountGrowthChart,
  OrgDistributionDonut,
  WorkforceMovementExecutive,
  WorkforceRisk,
} from '@/features/dashboard/executive/components/executive-charts-cards'
import { useGetExecutiveDashboard } from '@/features/dashboard/hooks'
import { m } from '@/i18n/paraglide/messages'

export function ExecutiveDashboardPage() {
  const { data, isPending, error } = useGetExecutiveDashboard()

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
        { to: '.', label: m.app_layout_nav_dashboard_executive() },
      ]}
      title={m.dashboard_executive_title()}
      subtitle={m.dashboard_executive_subtitle()}
      actions={
        <>
          <Button size='sm' variant='outline'>
            {dayjs().format('DD MMM YYYY')}
          </Button>
          <Button size='sm'>{m.dashboard_all_companies()}</Button>
          <Button size='sm'>{m.dashboard_customize()}</Button>
        </>
      }
    >
      {/* Status Banner */}
      <div className='flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white shadow-sm'>
        <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20'>
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
        <Button type='button' variant='secondary' size='xs' className='shrink-0'>
          {m.dashboard_view_executive_report()}
        </Button>
      </div>

      {/* KPI Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label={m.dashboard_stat_headcount()}
          value={data.headcount?.toLocaleString() || '0'}
          subLabel={`+${data.headcountGrowth}% YTD`}
          subLabelVariant='success'
          icon={IconUsers}
          iconVariant='default'
        />
        <StatCard
          label={m.dashboard_stat_attendance_rate()}
          value={`${data.attendanceRate}%`}
          subLabel={`+${data.attendanceRateChange} pts vs last month`}
          subLabelVariant='success'
          icon={IconArrowUpRight}
          iconVariant='success'
        />
        <StatCard
          label={m.dashboard_stat_payroll_cost()}
          value={data.payrollCost}
          subLabel={`+${data.payrollCostChange}% vs budget`}
          subLabelVariant='warning'
          icon={IconWallet}
          iconVariant='warning'
        />
        <StatCard
          label={m.dashboard_stat_turnover()}
          value={`${data.turnover}%`}
          subLabel={`${data.turnoverChange} pts vs last quarter`}
          subLabelVariant={data.turnoverChange < 0 ? 'success' : 'danger'}
          icon={IconTrendingDown}
          iconVariant='default'
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
            <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
              <span className='text-xs font-bold'>INS</span>
            </div>
            <div>
              <span className='text-sm font-semibold'>{m.dashboard_executive_highlight()}</span>
              <p className='text-xs text-muted-foreground'>{data.highlight}</p>
            </div>
          </div>
          <Button type='button' variant='outline' size='xs'>
            {m.dashboard_open_analytics()}
          </Button>
        </div>
      )}
    </AppMain>
  )
}
