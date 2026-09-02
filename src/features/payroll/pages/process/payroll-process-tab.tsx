// src/features/payroll/pages/process/payroll-process-tab.tsx — Screen 9: Payroll Process Runs list
import {
  IconPlus,
  IconSearch,
  IconClockCheck,
  IconUsers,
} from '@tabler/icons-react'
import { useState } from 'react'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import { formatIDR } from '../../data/mock-payroll-data'
import type { PayrollRun } from '../../types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

interface PayrollProcessTabProps {
  runs: PayrollRun[]
  onOpenCreate: () => void
  onViewDetail: (run: PayrollRun) => void
}

export function PayrollProcessTab({
  runs,
  onOpenCreate,
  onViewDetail,
}: PayrollProcessTabProps) {
  const [search, setSearch] = useState('')

  const filtered = runs.filter(
    (r) =>
      r.period.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className='space-y-6'>
      {/* ── Header Filter & Action ────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='relative w-full max-w-sm'>
          <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search period or batch code...'
            className='pl-9 h-9.5 text-xs bg-card rounded-xl shadow-xs'
          />
        </div>

        <Button
          onClick={onOpenCreate}
          className='gap-1.5 text-xs font-semibold rounded-xl h-9.5 px-4 shadow-xs'
        >
          <IconPlus size={15} />
          Create Payroll Process
        </Button>
      </div>

      {/* ── Table of Payroll Batches ──────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Period / Batch</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Cut-off Dates</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Pay Date</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Employees</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Total Gross</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Net Disbursement</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Attendance</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Status</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((run) => (
              <TableRow key={run.id} className='text-xs hover:bg-muted/20 border-b border-border/40'>
                <TableCell className='py-4 pl-6 font-bold text-foreground'>
                  <p>{run.period}</p>
                  <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{run.code}</p>
                </TableCell>
                <TableCell className='py-4 text-muted-foreground text-xs'>
                  {run.cutoffStartDate} – {run.cutoffEndDate}
                </TableCell>
                <TableCell className='py-4 font-semibold text-foreground'>
                  {run.paymentDate}
                </TableCell>
                <TableCell className='py-4 text-muted-foreground'>
                  <div className='flex items-center gap-1.5'>
                    <IconUsers size={14} className='text-primary/70' />
                    <span>{run.totalEmployees}</span>
                  </div>
                </TableCell>
                <TableCell className='py-4 font-semibold text-foreground'>
                  {formatIDR(run.totalGrossPay)}
                </TableCell>
                <TableCell className='py-4 font-bold text-emerald-600 dark:text-emerald-400'>
                  {formatIDR(run.totalNetDisbursement)}
                </TableCell>
                <TableCell className='py-4'>
                  <span className='inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
                    <IconClockCheck size={14} />
                    Synced
                  </span>
                </TableCell>
                <TableCell className='py-4'>
                  <PayrollStatusBadge status={run.status} />
                </TableCell>
                <TableCell className='py-4 pr-6 text-right'>
                  <button
                    type='button'
                    onClick={() => onViewDetail(run)}
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
