// src/features/payroll/pages/overview/payroll-overview-tab.tsx — Screen 1: Payroll Overview
import {
  IconReportMoney,
  IconArrowUpRight,
  IconArrowDownRight,
  IconUsers,
  IconCalendarTime,
  IconBuildingCommunity,
  IconCircleCheck,
  IconEye,
} from '@tabler/icons-react'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import {
  formatIDR,
  formatCompactIDR,
  initialPayrollRuns,
} from '../../data/mock-payroll-data'
import type { PayrollRun } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Progress } from '@/shared/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

interface PayrollOverviewTabProps {
  onNavigateToProcess: (runId?: string) => void
  onNavigateToConfig: () => void
}

export function PayrollOverviewTab({
  onNavigateToProcess,
  onNavigateToConfig,
}: PayrollOverviewTabProps) {
  const activeRun = initialPayrollRuns[0]

  const departmentDistribution = [
    { name: m.payroll_overview_department_it(), count: 420, amount: 1680000000, percent: 39.5 },
    { name: m.payroll_overview_department_operations(), count: 310, amount: 980000000, percent: 23.0 },
    { name: m.payroll_overview_department_sales(), count: 210, amount: 840000000, percent: 19.8 },
    { name: m.payroll_overview_department_finance(), count: 110, amount: 450000000, percent: 10.6 },
    { name: m.payroll_overview_department_hr(), count: 92, amount: 300000000, percent: 7.1 },
  ]

  return (
    <div className='flex flex-col gap-6'>
      {/* ── 1. Top KPI Summary Cards ──────────────────────────────────────── */}
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {/* Active Period Card */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <IconCalendarTime size={22} />
            </div>
            <Badge variant='green'>{m.payroll_overview_disbursed()}</Badge>
          </div>
          <div className='mt-3'>
            <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_overview_active_period()}</p>
            <b className='text-xl font-bold text-foreground'>{activeRun.period}</b>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              Cut-off: {activeRun.cutoffStartDate} – {activeRun.cutoffEndDate}
            </p>
          </div>
        </div>

        {/* Total Gross Pay */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconReportMoney size={22} />
            </div>
            <span className='inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
              <IconArrowUpRight size={13} /> +1.8%
            </span>
          </div>
          <div className='mt-3'>
            <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_overview_gross_pay()}</p>
            <b className='text-xl font-bold text-foreground'>{formatCompactIDR(activeRun.totalGrossPay)}</b>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              Base: {formatCompactIDR(3410000000)} · OT/Allow: {formatCompactIDR(activeRun.totalAllowances)}
            </p>
          </div>
        </div>

        {/* Total Deductions & Taxes */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'>
              <IconArrowDownRight size={22} />
            </div>
            <span className='text-[10px] font-bold text-muted-foreground'>
              PPh21 + BPJS
            </span>
          </div>
          <div className='mt-3'>
            <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_overview_deductions_tax()}</p>
            <b className='text-xl font-bold text-amber-600 dark:text-amber-400'>{formatCompactIDR(activeRun.totalDeductions)}</b>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              Tax: {formatCompactIDR(activeRun.totalTaxPPh21)} · BPJS: {formatCompactIDR(activeRun.totalBpjsTK + activeRun.totalBpjsKes)}
            </p>
          </div>
        </div>

        {/* Total Net Disbursement */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
              <IconCircleCheck size={22} />
            </div>
            <Badge variant='green'>{m.payroll_overview_paid_percent()}</Badge>
          </div>
          <div className='mt-3'>
            <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_overview_net_disbursement()}</p>
            <b className='text-xl font-bold text-emerald-600 dark:text-emerald-400'>{formatCompactIDR(activeRun.totalNetDisbursement)}</b>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              {m.payroll_overview_employees_paid({count: activeRun.totalEmployees})}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Department Breakdown & Quick Stats ──────────────────────────── */}
      <div className='grid gap-6 lg:grid-cols-[1.5fr_1fr]'>
        {/* Department Breakdown */}
        <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>{m.payroll_overview_distribution_title()}</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {m.payroll_overview_distribution_description()}
              </p>
            </div>
            <span className='text-xs font-bold text-foreground'>{m.payroll_overview_employee_count({count: activeRun.totalEmployees})}</span>
          </div>

          <div className='space-y-4 mt-5'>
            {departmentDistribution.map((dept) => (
              <div key={dept.name} className='space-y-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-semibold text-foreground flex items-center gap-2'>
                    <IconBuildingCommunity size={14} className='text-primary/70' />
                    {dept.name}
                  </span>
                  <div className='flex items-center gap-3'>
                    <span className='text-muted-foreground text-[11px]'>{m.payroll_overview_employee_count({count: dept.count})}</span>
                    <b className='font-semibold text-foreground'>{formatIDR(dept.amount)}</b>
                    <span className='w-10 text-right font-mono text-[11px] text-muted-foreground'>
                      {dept.percent}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <Progress value={dept.percent} aria-label={m.payroll_overview_distribution_title()} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Statutory & Statutory Compliance Overview */}
        <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-bold text-foreground'>{m.payroll_overview_compliance_title()}</h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {m.payroll_overview_compliance_description()}
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onNavigateToConfig}
              >
                {m.payroll_overview_configure_button()}
              </Button>
            </div>

            <div className='space-y-3.5 mt-5'>
              <div className='p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between'>
                <div>
                  <p className='text-xs font-bold text-foreground'>{m.payroll_overview_ter_scheme()}</p>
                  <p className='text-[10px] text-muted-foreground'>{m.payroll_overview_ter_categories()}</p>
                </div>
                <b className='text-xs font-bold text-foreground'>{formatIDR(activeRun.totalTaxPPh21)}</b>
              </div>

              <div className='p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between'>
                <div>
                  <p className='text-xs font-bold text-foreground'>{m.payroll_config_tab_bpjs_tk()}</p>
                  <p className='text-[10px] text-muted-foreground'>JKK, JKM, JHT, JP</p>
                </div>
                <b className='text-xs font-bold text-foreground'>{formatIDR(activeRun.totalBpjsTK)}</b>
              </div>

              <div className='p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between'>
                <div>
                  <p className='text-xs font-bold text-foreground'>{m.payroll_config_tab_bpjs_kes()}</p>
                  <p className='text-[10px] text-muted-foreground'>{m.payroll_overview_bpjs_share()}</p>
                </div>
                <b className='text-xs font-bold text-foreground'>{formatIDR(activeRun.totalBpjsKes)}</b>
              </div>
            </div>
          </div>

          <div className='pt-5 border-t border-border/60 flex items-center justify-between'>
            <span className='text-xs text-muted-foreground'>{m.payroll_overview_gateway()}</span>
            <span className='text-xs font-bold text-foreground flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-emerald-500' />
              BCA Corporate MCM
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Recent Payroll Runs Table ───────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-6 pb-4 flex items-center justify-between border-b border-border/60'>
          <div>
            <h3 className='text-sm font-bold text-foreground'>{m.payroll_overview_recent_title()}</h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {m.payroll_overview_recent_description()}
            </p>
          </div>
          <Button
            size='sm'
            onClick={() => onNavigateToProcess()}
            className='text-xs font-semibold rounded-xl h-8.5 px-4 shadow-xs'
          >
            {m.payroll_overview_view_all()}
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 hover:bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>{m.payroll_overview_col_period()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_overview_col_employees()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_overview_col_gross()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_overview_deductions_tax()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_overview_net_disbursement()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_overview_col_status()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>{m.payroll_overview_col_action()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPayrollRuns.map((run: PayrollRun) => (
              <TableRow key={run.id} className='hover:bg-muted/20 text-xs border-b border-border/40'>
                <TableCell className='font-bold text-foreground py-4 pl-6'>
                  <div>
                    <p className='text-xs font-bold text-foreground'>{run.period}</p>
                    <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{run.code}</p>
                  </div>
                </TableCell>
                <TableCell className='py-4 text-muted-foreground font-medium'>
                  <div className='flex items-center gap-1.5'>
                    <IconUsers size={14} className='text-primary/70' />
                    <span>{run.totalEmployees}</span>
                  </div>
                </TableCell>
                <TableCell className='py-4 font-semibold text-foreground'>{formatIDR(run.totalGrossPay)}</TableCell>
                <TableCell className='py-4 text-amber-600 dark:text-amber-400 font-semibold'>{formatIDR(run.totalDeductions)}</TableCell>
                <TableCell className='py-4 font-bold text-emerald-600 dark:text-emerald-400'>{formatIDR(run.totalNetDisbursement)}</TableCell>
                <TableCell className='py-4'>
                  <PayrollStatusBadge status={run.status} />
                </TableCell>
                <TableCell className='py-4 pr-6 text-right'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onNavigateToProcess(run.id)}
                        className='size-8 text-muted-foreground hover:text-primary hover:bg-primary/10'
                        aria-label={m.payroll_overview_view_detail()}
                      >
                        <IconEye size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='left'>
                      <p>{m.payroll_overview_view_detail()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
