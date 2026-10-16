// src/features/payroll/pages/approval/payroll-approval-tab.tsx — Screens 13, 14, 15: Approval Hub & Variance Analysis
import { IconArrowUpRight } from '@tabler/icons-react'
import { useState } from 'react'
import { DisbursementView } from './disbursement-view'
import { FinanceApprovalView } from './finance-approval-view'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import { formatIDR, formatCompactIDR, initialPayrollRuns } from '../../data/mock-payroll-data'
import type { PayrollRun } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

interface PayrollApprovalTabProps {
  runs?: PayrollRun[]
  onUpdateRuns?: React.Dispatch<React.SetStateAction<PayrollRun[]>>
}

export function PayrollApprovalTab({ runs: propRuns, onUpdateRuns }: PayrollApprovalTabProps = {}) {
  const [internalRuns, setInternalRuns] = useState<PayrollRun[]>(initialPayrollRuns)
  const runs = propRuns ?? internalRuns
  const setRuns = onUpdateRuns ?? setInternalRuns

  const [selectedRunId, setSelectedRunId] = useState<string>(() => {
    const list = propRuns ?? initialPayrollRuns
    const inReview = list.find((r) => r.status === 'in_review')
    return inReview?.id ?? list[2]?.id ?? list[0]?.id ?? ''
  })

  const selectedRun = runs.find((r) => r.id === selectedRunId) || runs[0]
  const [approvalView, setApprovalView] = useState<'variance' | 'finance_approval' | 'disbursement'>('variance')

  const handleApprove = (runId: string) => {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: 'approved',
              approvalStage: 'completed',
              approvedBy: m.payroll_approval_finance_director(),
              approvedAt: m.payroll_approval_just_now(),
            }
          : r,
      ),
    )
    setApprovalView('disbursement')
  }

  const handleMarkAsDisbursed = (runId: string) => {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: 'disbursed',
              disbursedAt: m.payroll_approval_just_now(),
            }
          : r,
      ),
    )
  }

  return (
    <div className='space-y-6'>
      {/* ── Approval Workflow Tabs ─────────────────────────────────────────── */}
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <Tabs value={approvalView} onValueChange={(value) => setApprovalView(value as typeof approvalView)}>
          <TabsList variant='segmented' aria-label={m.payroll_tab_approval()}>
            <TabsTrigger value='variance'>{m.payroll_approval_variance_tab()}</TabsTrigger>
            <TabsTrigger value='finance_approval'>{m.payroll_approval_checklist_tab()}</TabsTrigger>
            <TabsTrigger value='disbursement'>{m.payroll_approval_disbursement_tab()}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='flex items-center gap-2.5 text-xs flex-wrap'>
          <span className='text-muted-foreground font-medium'>{m.payroll_approval_batch_label()}</span>
          <Select
            value={selectedRun?.id}
            onValueChange={(val) => {
              setSelectedRunId(val)
              const match = runs.find((r) => r.id === val)
              if (match?.status === 'disbursed') {
                setApprovalView('disbursement')
              } else if (match?.status === 'approved') {
                setApprovalView('disbursement')
              } else {
                setApprovalView('variance')
              }
            }}
          >
            <SelectTrigger className='h-8 text-xs font-semibold bg-background rounded-xl min-w-[190px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {runs.map((r) => (
                  <SelectItem key={r.id} value={r.id} className='text-xs'>
                    {r.period} ({r.code})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {selectedRun && <PayrollStatusBadge status={selectedRun.status} />}
        </div>
      </div>

      {/* ── View 1: Pre-Review & Variance Analysis (Screen 13) ─────────────── */}
      {approvalView === 'variance' && (
        <div className='space-y-6'>
          {/* Variance Comparison Cards */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_approval_total_gross()}</p>
              <div className='mt-2'>
                <b className='text-xl font-bold text-foreground'>{formatCompactIDR(selectedRun.totalGrossPay)}</b>
                <p className='text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1'>
                  <IconArrowUpRight size={14} /> {m.payroll_approval_gross_comparison()}
                </p>
              </div>
            </div>

            <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_approval_total_overtime()}</p>
              <div className='mt-2'>
                <b className='text-xl font-bold text-foreground'>{formatCompactIDR(128000000)}</b>
                <p className='text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1'>
                  <IconArrowUpRight size={14} /> {m.payroll_approval_overtime_comparison()}
                </p>
              </div>
            </div>

            <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_approval_tax_deductions()}</p>
              <div className='mt-2'>
                <b className='text-xl font-bold text-amber-600 dark:text-amber-400'>{formatCompactIDR(selectedRun.totalDeductions)}</b>
                <p className='text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1'>
                  <IconArrowUpRight size={14} /> {m.payroll_approval_tax_comparison()}
                </p>
              </div>
            </div>

            <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_overview_net_disbursement()}</p>
              <div className='mt-2'>
                <b className='text-xl font-bold text-emerald-600 dark:text-emerald-400'>{formatCompactIDR(selectedRun.totalNetDisbursement)}</b>
                <p className='text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1'>
                  <IconArrowUpRight size={14} /> {m.payroll_approval_net_comparison()}
                </p>
              </div>
            </div>
          </div>

          {/* Variance Breakdown per Cost Center */}
          <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-bold text-foreground'>{m.payroll_approval_variance_title()}</h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {m.payroll_approval_variance_description()}
                </p>
              </div>
              <Button
                onClick={() => setApprovalView('finance_approval')}
                className='h-8.5 px-4 text-xs font-semibold rounded-xl shadow-xs'
              >
                {m.payroll_approval_proceed_button()}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
                  <TableHead className='font-bold text-muted-foreground py-3 pl-6'>{m.payroll_approval_col_department()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_approval_col_headcount()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_approval_col_current()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground py-3'>{m.payroll_approval_col_previous()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground py-3 pr-6 text-right'>{m.payroll_approval_col_variance()}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { dept: 'IT & Engineering', count: 422, current: 1710000000, prev: 1680000000, delta: '+Rp 30.0M', reason: m.payroll_approval_reason_engineers() },
                  { dept: 'Operations & Supply', count: 312, current: 988000000, prev: 980000000, delta: '+Rp 8.0M', reason: m.payroll_approval_reason_warehouse() },
                  { dept: 'Sales & Marketing', count: 210, current: 842000000, prev: 840000000, delta: '+Rp 2.0M', reason: m.payroll_approval_reason_commission() },
                  { dept: 'Finance & Accounting', count: 110, current: 450000000, prev: 450000000, delta: 'Rp 0', reason: m.payroll_approval_reason_stable() },
                  { dept: 'Human Resource', count: 92, current: 305000000, prev: 300000000, delta: '+Rp 5.0M', reason: m.payroll_approval_reason_salary() },
                ].map((row) => (
                  <TableRow key={row.dept} className='text-xs border-b border-border/40'>
                    <TableCell className='py-3.5 pl-6 font-bold text-foreground'>{row.dept}</TableCell>
                    <TableCell className='py-3.5 text-muted-foreground'>{m.payroll_approval_employee_count({ count: row.count })}</TableCell>
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
