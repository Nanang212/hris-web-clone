// src/features/payroll/pages/approval/payroll-approval-tab.tsx — Screens 13, 14, 15: Approval Hub & Variance Analysis
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconClock,
  IconFileSpreadsheet,
  IconShieldCheck,
  IconSend,
  IconUsers,
} from '@tabler/icons-react'
import { useState } from 'react'
import { DisbursementView } from './disbursement-view'
import { FinanceApprovalView } from './finance-approval-view'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import { formatIDR, formatCompactIDR, initialPayrollRuns } from '../../data/mock-payroll-data'
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

export function PayrollApprovalTab() {
  const [runs, setRuns] = useState<PayrollRun[]>(initialPayrollRuns)
  const [selectedRun, setSelectedRun] = useState<PayrollRun>(() => initialPayrollRuns[2] || initialPayrollRuns[0])
  const [approvalView, setApprovalView] = useState<'variance' | 'finance_approval' | 'disbursement'>('variance')

  const handleApprove = (runId: string) => {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: 'approved',
              approvalStage: 'completed',
              approvedBy: 'Director of Finance',
              approvedAt: 'Just now',
            }
          : r,
      ),
    )
    setSelectedRun((prev) => ({
      ...prev,
      status: 'approved',
      approvalStage: 'completed',
    }))
    setApprovalView('disbursement')
  }

  const handleMarkAsDisbursed = (runId: string) => {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: 'disbursed',
              disbursedAt: 'Just now',
            }
          : r,
      ),
    )
    setSelectedRun((prev) => ({
      ...prev,
      status: 'disbursed',
    }))
  }

  return (
    <div className='space-y-6'>
      {/* ── Sub-nav Pill Selector for Approval Workflow ───────────────────── */}
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant={approvalView === 'variance' ? 'default' : 'outline'}
            onClick={() => setApprovalView('variance')}
            className='h-8 px-4 text-xs font-semibold rounded-xl'
          >
            Pre-Review & Variance
          </Button>

          <Button
            size='sm'
            variant={approvalView === 'finance_approval' ? 'default' : 'outline'}
            onClick={() => setApprovalView('finance_approval')}
            className='h-8 px-4 text-xs font-semibold rounded-xl'
          >
            Finance Approval Checklist
          </Button>

          <Button
            size='sm'
            variant={approvalView === 'disbursement' ? 'default' : 'outline'}
            onClick={() => setApprovalView('disbursement')}
            className='h-8 px-4 text-xs font-semibold rounded-xl'
          >
            Disbursement & Bank File
          </Button>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <span className='text-muted-foreground'>Active Batch:</span>
          <b className='text-foreground'>{selectedRun.period}</b>
          <PayrollStatusBadge status={selectedRun.status} />
        </div>
      </div>

      {/* ── View 1: Pre-Review & Variance Analysis (Screen 13) ─────────────── */}
      {approvalView === 'variance' && (
        <div className='space-y-6'>
          {/* Variance Comparison Cards */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
              <p className='text-[11px] font-semibold text-muted-foreground'>Total Gross Salary</p>
              <div className='mt-2'>
                <b className='text-xl font-bold text-foreground'>{formatCompactIDR(selectedRun.totalGrossPay)}</b>
                <p className='text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1'>
                  <IconArrowUpRight size={14} /> +Rp 45.0M (+1.1%) vs May
                </p>
              </div>
            </div>

            <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
              <p className='text-[11px] font-semibold text-muted-foreground'>Total Overtime Pay</p>
              <div className='mt-2'>
                <b className='text-xl font-bold text-foreground'>{formatCompactIDR(128000000)}</b>
                <p className='text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1'>
                  <IconArrowUpRight size={14} /> +Rp 8.5M (Higher project hours)
                </p>
              </div>
            </div>

            <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
              <p className='text-[11px] font-semibold text-muted-foreground'>PPh 21 & Deductions</p>
              <div className='mt-2'>
                <b className='text-xl font-bold text-amber-600 dark:text-amber-400'>{formatCompactIDR(selectedRun.totalDeductions)}</b>
                <p className='text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1'>
                  <IconArrowUpRight size={14} /> +Rp 7.6M (TER Bracket shift)
                </p>
              </div>
            </div>

            <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
              <p className='text-[11px] font-semibold text-muted-foreground'>Net Disbursement</p>
              <div className='mt-2'>
                <b className='text-xl font-bold text-emerald-600 dark:text-emerald-400'>{formatCompactIDR(selectedRun.totalNetDisbursement)}</b>
                <p className='text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1'>
                  <IconArrowUpRight size={14} /> +Rp 37.4M vs Previous Month
                </p>
              </div>
            </div>
          </div>

          {/* Variance Breakdown per Cost Center */}
          <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-bold text-foreground'>Department Variance Breakdown (vs May 2026)</h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Perbandingan beban biaya payroll antar unit kerja dengan bulan sebelumnya
                </p>
              </div>
              <Button
                onClick={() => setApprovalView('finance_approval')}
                className='h-8.5 px-4 text-xs font-semibold rounded-xl shadow-xs'
              >
                Proceed to Finance Approval
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
                  <TableHead className='font-bold text-muted-foreground py-3 pl-6'>Department</TableHead>
                  <TableHead className='font-bold text-muted-foreground py-3'>Headcount</TableHead>
                  <TableHead className='font-bold text-muted-foreground py-3'>Current Month (June)</TableHead>
                  <TableHead className='font-bold text-muted-foreground py-3'>Previous Month (May)</TableHead>
                  <TableHead className='font-bold text-muted-foreground py-3 pr-6 text-right'>Variance Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { dept: 'IT & Engineering', count: 422, current: 1710000000, prev: 1680000000, delta: '+Rp 30.0M', reason: '+2 New Senior Engineers' },
                  { dept: 'Operations & Supply', count: 312, current: 988000000, prev: 980000000, delta: '+Rp 8.0M', reason: 'Overtime in Warehouse' },
                  { dept: 'Sales & Marketing', count: 210, current: 842000000, prev: 840000000, delta: '+Rp 2.0M', reason: 'Sales Commission' },
                  { dept: 'Finance & Accounting', count: 110, current: 450000000, prev: 450000000, delta: 'Rp 0', reason: 'Stable' },
                  { dept: 'Human Resource', count: 92, current: 305000000, prev: 300000000, delta: '+Rp 5.0M', reason: 'Annual Salary Adjustment' },
                ].map((row) => (
                  <TableRow key={row.dept} className='text-xs border-b border-border/40'>
                    <TableCell className='py-3.5 pl-6 font-bold text-foreground'>{row.dept}</TableCell>
                    <TableCell className='py-3.5 text-muted-foreground'>{row.count} emp</TableCell>
                    <TableCell className='py-3.5 font-semibold text-foreground'>{formatIDR(row.current)}</TableCell>
                    <TableCell className='py-3.5 text-muted-foreground'>{formatIDR(row.prev)}</TableCell>
                    <TableCell className='py-3.5 pr-6 text-right'>
                      <span className={`font-bold ${row.delta.startsWith('+') ? 'text-emerald-600' : 'text-foreground'}`}>
                        {row.delta}
                      </span>
                      <span className='block text-[10px] text-muted-foreground'>{row.reason}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── View 2: Finance Approval Checklist (Screen 14) ─────────────────── */}
      {approvalView === 'finance_approval' && (
        <FinanceApprovalView
          run={selectedRun}
          onApprove={handleApprove}
          onRequestRevision={() => setApprovalView('variance')}
        />
      )}

      {/* ── View 3: Approved & Disbursement (Screen 15) ────────────────────── */}
      {approvalView === 'disbursement' && (
        <DisbursementView
          run={selectedRun}
          onMarkAsDisbursed={handleMarkAsDisbursed}
        />
      )}
    </div>
  )
}
