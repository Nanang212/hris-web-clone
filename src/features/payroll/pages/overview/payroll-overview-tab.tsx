// src/features/payroll/pages/overview/payroll-overview-tab.tsx — Screen 1: Payroll Overview
import {
  IconReportMoney,
  IconArrowUpRight,
  IconArrowDownRight,
  IconUsers,
  IconCalendarTime,
  IconBuildingCommunity,
  IconCircleCheck,
} from '@tabler/icons-react'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import {
  formatIDR,
  formatCompactIDR,
  initialPayrollRuns,
} from '../../data/mock-payroll-data'
import type { PayrollRun } from '../../types'
import { Button } from '@/shared/components/ui/button'
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
    { name: 'IT & Engineering', count: 420, amount: 1680000000, percent: 39.5 },
    { name: 'Operations & Supply', count: 310, amount: 980000000, percent: 23.0 },
    { name: 'Sales & Marketing', count: 210, amount: 840000000, percent: 19.8 },
    { name: 'Finance & Accounting', count: 110, amount: 450000000, percent: 10.6 },
    { name: 'Human Resource', count: 92, amount: 300000000, percent: 7.1 },
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
            <span className='rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold'>
              Disbursed
            </span>
          </div>
          <div className='mt-3'>
            <p className='text-[11px] font-semibold text-muted-foreground'>Active Payroll Period</p>
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
            <p className='text-[11px] font-semibold text-muted-foreground'>Total Gross Pay</p>
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
            <p className='text-[11px] font-semibold text-muted-foreground'>Total Deductions & Tax</p>
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
            <span className='rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold'>
              100% Paid
            </span>
          </div>
          <div className='mt-3'>
            <p className='text-[11px] font-semibold text-muted-foreground'>Total Net Disbursement</p>
            <b className='text-xl font-bold text-emerald-600 dark:text-emerald-400'>{formatCompactIDR(activeRun.totalNetDisbursement)}</b>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              {activeRun.totalEmployees} employees paid via BCA MCM
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
              <h3 className='text-sm font-bold text-foreground'>Department Payroll Distribution</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Distribusi total pengeluaran gaji bersih berdasarkan unit kerja
              </p>
            </div>
            <span className='text-xs font-bold text-foreground'>1,148 Karyawan</span>
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
                    <span className='text-muted-foreground text-[11px]'>{dept.count} emp</span>
                    <b className='font-semibold text-foreground'>{formatIDR(dept.amount)}</b>
                    <span className='w-10 text-right font-mono text-[11px] text-muted-foreground'>
                      {dept.percent}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className='h-2 w-full rounded-full bg-muted/60 overflow-hidden'>
                  <div
                    className='h-full rounded-full bg-primary transition-all duration-500'
                    style={{ width: `${dept.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Statutory & Statutory Compliance Overview */}
        <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-bold text-foreground'>Statutory & Compliance Summary</h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Kewajiban pajak PPh 21 dan jaminan sosial BPJS
                </p>
              </div>
              <button
                type='button'
                onClick={onNavigateToConfig}
                className='text-xs font-semibold text-primary hover:underline cursor-pointer'
              >
                Configure
              </button>
            </div>

            <div className='space-y-3.5 mt-5'>
              <div className='p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between'>
                <div>
                  <p className='text-xs font-bold text-foreground'>PPh 21 TER Scheme</p>
                  <p className='text-[10px] text-muted-foreground'>Kategori A, B, C Aktif</p>
                </div>
                <b className='text-xs font-bold text-foreground'>{formatIDR(activeRun.totalTaxPPh21)}</b>
              </div>

              <div className='p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between'>
                <div>
                  <p className='text-xs font-bold text-foreground'>BPJS Ketenagakerjaan</p>
                  <p className='text-[10px] text-muted-foreground'>JKK, JKM, JHT, JP</p>
                </div>
                <b className='text-xs font-bold text-foreground'>{formatIDR(activeRun.totalBpjsTK)}</b>
              </div>

              <div className='p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between'>
                <div>
                  <p className='text-xs font-bold text-foreground'>BPJS Kesehatan</p>
                  <p className='text-[10px] text-muted-foreground'>Perusahaan 4% + Karyawan 1%</p>
                </div>
                <b className='text-xs font-bold text-foreground'>{formatIDR(activeRun.totalBpjsKes)}</b>
              </div>
            </div>
          </div>

          <div className='pt-5 border-t border-border/60 flex items-center justify-between'>
            <span className='text-xs text-muted-foreground'>Disbursement Gateway</span>
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
            <h3 className='text-sm font-bold text-foreground'>Recent Payroll Batches</h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Riwayat proses penggajian dan status pencairan bulanan
            </p>
          </div>
          <Button
            size='sm'
            onClick={() => onNavigateToProcess()}
            className='text-xs font-semibold rounded-xl h-8.5 px-4 shadow-xs'
          >
            View All Runs
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 hover:bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Period / Batch</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Employees</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Total Gross</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Deductions & Tax</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Net Disbursement</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Status</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>Action</TableHead>
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
                  <button
                    type='button'
                    onClick={() => onNavigateToProcess(run.id)}
                    className='text-xs font-semibold text-primary hover:underline cursor-pointer'
                  >
                    View Detail
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
