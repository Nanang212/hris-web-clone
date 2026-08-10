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

export function ExecutiveDashboardPage() {
  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs text-muted-foreground">Dashboard / Executive</p>
          <h2 className="text-2xl font-bold tracking-tight">
            Executive Workforce Overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Company-wide workforce health, cost, movement, and organization risk
            indicators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
            16 May 2025
          </span>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            All companies
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Customize
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white shadow-sm">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
          <IconArrowUpRight size={18} stroke={2} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Workforce remains stable</p>
          <p className="text-xs text-emerald-100">
            Headcount is up 5.2% year-to-date while turnover is down 0.6
            percentage points.
          </p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors"
        >
          View executive report
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Headcount"
          value="1,248"
          subLabel="+5.2% YTD"
          subLabelVariant="success"
          icon={IconUsers}
          iconBg="bg-blue-100 dark:bg-blue-900/40"
        />
        <StatCard
          label="Attendance Rate"
          value="95.4%"
          subLabel="+1.1 pts vs last month"
          subLabelVariant="success"
          icon={IconArrowUpRight}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        />
        <StatCard
          label="Payroll Cost"
          value="Rp12.8B"
          subLabel="+3.4% vs budget"
          subLabelVariant="warning"
          icon={IconWallet}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
        />
        <StatCard
          label="Turnover"
          value="3.8%"
          subLabel="-0.6 pts vs last quarter"
          subLabelVariant="success"
          icon={IconTrendingDown}
          iconBg="bg-purple-100 dark:bg-purple-900/40"
        />
      </div>

      {/* Chart + Executive Attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <HeadcountGrowthChart />
        <ExecutiveAttention />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <WorkforceMovementExecutive />
        <OrgDistributionDonut />
        <WorkforceRisk />
      </div>

      {/* Executive Highlight */}
      <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-foreground/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <span className="text-xs font-bold">INS</span>
          </div>
          <div>
            <span className="text-sm font-semibold">Executive highlight</span>
            <p className="text-xs text-muted-foreground">
              Headcount growth remains within plan; payroll cost is 3.4% above
              budget due to hiring concentration in Technology.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="flex-shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          Open analytics
        </button>
      </div>
    </div>
  )
}
