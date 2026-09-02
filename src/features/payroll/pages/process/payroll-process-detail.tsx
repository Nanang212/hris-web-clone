// src/features/payroll/pages/process/payroll-process-detail.tsx — Screen 11: Payroll Run Detail per employee
import {
  IconDownload,
  IconSearch,
  IconSend,
  IconArrowLeft,
  IconUsers,
  IconReportMoney,
  IconBuildingBank,
} from '@tabler/icons-react'
import { useState } from 'react'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import {
  formatIDR,
  formatCompactIDR,
  initialEmployeePayrollDetails,
} from '../../data/mock-payroll-data'
import type { PayrollRun, EmployeePayrollDetail } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
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
import { snackbar } from '@/shared/lib/snackbar'

interface PayrollProcessDetailProps {
  run: PayrollRun
  onBack: () => void
  onSubmitForApproval: (runId: string) => void
}

export function PayrollProcessDetail({
  run,
  onBack,
  onSubmitForApproval,
}: PayrollProcessDetailProps) {
  const [search, setSearch] = useState('')
  const [details] = useState<EmployeePayrollDetail[]>(initialEmployeePayrollDetails)

  const filtered = details.filter(
    (d) =>
      d.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      d.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()),
  )

  const handleExport = () => {
    snackbar.success(`Exporting payroll breakdown for ${run.period} to Excel...`)
  }

  return (
    <div className='space-y-6'>
      {/* ── Top Header Actions ─────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='icon'
            onClick={onBack}
            className='size-9 rounded-xl'
          >
            <IconArrowLeft size={18} />
          </Button>
          <div>
            <div className='flex items-center gap-2.5'>
              <h2 className='text-base font-bold text-foreground'>
                Payroll Run: {run.period}
              </h2>
              <PayrollStatusBadge status={run.status} />
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Batch Code: <span className='font-mono font-medium'>{run.code}</span> · Cut-off: {run.cutoffStartDate} – {run.cutoffEndDate}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2.5'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExport}
            className='gap-1.5 text-xs font-semibold rounded-xl h-9'
          >
            <IconDownload size={15} />
            Export Excel
          </Button>

          {run.status === 'draft' && (
            <Button
              size='sm'
              onClick={() => onSubmitForApproval(run.id)}
              className='gap-1.5 text-xs font-semibold rounded-xl h-9 shadow-xs'
            >
              <IconSend size={15} />
              Submit for Approval
            </Button>
          )}
        </div>
      </div>

      {/* ── Summary KPI Cards ─────────────────────────────────────────────── */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-primary/10 text-primary'>
              <IconUsers size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Employees Count</p>
              <b className='text-base font-bold text-foreground'>{run.totalEmployees} Karyawan</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconReportMoney size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Total Gross Salary</p>
              <b className='text-base font-bold text-foreground'>{formatCompactIDR(run.totalGrossPay)}</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'>
              <IconReportMoney size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Tax & Deductions</p>
              <b className='text-base font-bold text-amber-600 dark:text-amber-400'>{formatCompactIDR(run.totalDeductions)}</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
              <IconBuildingBank size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Net Take Home Pay</p>
              <b className='text-base font-bold text-emerald-600 dark:text-emerald-400'>{formatCompactIDR(run.totalNetDisbursement)}</b>
            </div>
          </div>
        </div>
      </div>

      {/* ── Employee Breakdown Table ───────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-5 pb-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3'>
          <div className='relative w-full max-w-sm'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search employee name, ID, or department...'
              className='pl-9 h-9 text-xs bg-background rounded-xl'
            />
          </div>

          <span className='text-xs font-bold text-muted-foreground'>
            Showing {filtered.length} of {details.length} Records
          </span>
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/30 text-xs border-b border-border/60 whitespace-nowrap'>
                <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Employee</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Position / PTKP</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Base Salary</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Allowances</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Overtime Pay</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Gross Pay</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>BPJS TK + Kes</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>PPh 21</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Deductions</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className='text-xs hover:bg-muted/20 border-b border-border/40 whitespace-nowrap'>
                  <TableCell className='py-3.5 pl-6'>
                    <p className='font-bold text-foreground'>{item.employeeName}</p>
                    <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{item.employeeCode} · {item.department}</p>
                  </TableCell>
                  <TableCell className='py-3.5'>
                    <p className='text-foreground font-medium'>{item.position}</p>
                    <Badge variant='blue' className='text-[9px] px-1.5 py-0 mt-0.5'>{item.ptkpStatus}</Badge>
                  </TableCell>
                  <TableCell className='py-3.5 font-semibold text-foreground'>{formatIDR(item.baseSalary)}</TableCell>
                  <TableCell className='py-3.5 text-foreground'>{formatIDR(item.fixedAllowances + item.variableAllowances)}</TableCell>
                  <TableCell className='py-3.5 text-foreground'>
                    <p className='font-semibold'>{formatIDR(item.overtimePay)}</p>
                    <span className='text-[10px] text-muted-foreground'>({item.overtimeHours} jam)</span>
                  </TableCell>
                  <TableCell className='py-3.5 font-bold text-foreground'>{formatIDR(item.totalGross)}</TableCell>
                  <TableCell className='py-3.5 text-amber-600 dark:text-amber-400 font-medium'>
                    -{formatIDR(item.bpjsTkEmployee + item.bpjsKesEmployee)}
                  </TableCell>
                  <TableCell className='py-3.5 text-amber-600 dark:text-amber-400 font-medium'>
                    -{formatIDR(item.pph21Tax)}
                  </TableCell>
                  <TableCell className='py-3.5 text-rose-600 dark:text-rose-400 font-semibold'>
                    -{formatIDR(item.totalDeductions)}
                  </TableCell>
                  <TableCell className='py-3.5 pr-6 text-right font-bold text-emerald-600 dark:text-emerald-400'>
                    {formatIDR(item.netTakeHomePay)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
