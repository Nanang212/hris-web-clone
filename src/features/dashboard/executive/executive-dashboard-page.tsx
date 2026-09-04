import { IconArrowUpRight, IconTrendingDown, IconUsers, IconWallet } from '@tabler/icons-react'
import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/shared/components/ui/alert'
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
      <Alert variant='success'>
        <AlertIcon>
          <IconArrowUpRight size={18} stroke={2} />
        </AlertIcon>
        <div className='min-w-0 flex-1'>
          <AlertTitle>{m.dashboard_workforce_stable()}</AlertTitle>
          <AlertDescription>
            {m.dashboard_workforce_stable_description({
              growth: data.headcountGrowth,
              turnover: Math.abs(data.turnoverChange),
            })}
          </AlertDescription>
        </div>
        <AlertAction>
          <Button type='button' variant='outline' size='xs'>
            {m.dashboard_view_executive_report()}
          </Button>
        </AlertAction>
      </Alert>

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
        <Alert variant='info'>
          <AlertIcon>
            <span className='text-xs font-bold'>INS</span>
          </AlertIcon>
          <div className='min-w-0 flex-1'>
            <AlertTitle>{m.dashboard_executive_highlight()}</AlertTitle>
            <AlertDescription>{data.highlight}</AlertDescription>
          </div>
          <AlertAction>
            <Button type='button' variant='outline' size='xs'>
              {m.dashboard_open_analytics()}
            </Button>
          </AlertAction>
        </Alert>
      )}
    </AppMain>
  )
}
