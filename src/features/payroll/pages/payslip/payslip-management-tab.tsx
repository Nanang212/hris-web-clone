// src/features/payroll/pages/payslip/payslip-management-tab.tsx — Screen 16: Payslip Directory & Table
import {
  IconSearch,
  IconDownload,
  IconEye,
  IconMail,
  IconSend,
  IconUsers,
  IconFileSpreadsheet,
  IconX,
  IconRotate,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { PayslipDetailView } from './payslip-detail-view'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import { formatIDR, initialPayslips } from '../../data/mock-payroll-data'
import { downloadPayslipPdf, exportPayslipsBulkZip } from '../../lib/payroll-download-helper'
import { detailToPayslip } from '../../lib/payroll-payslip-helper'
import { usePayrollRunStore } from '../../store/payroll-run-store'
import type { PayslipRecord, PayslipStatus } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
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
import { snackbar } from '@/shared/lib/snackbar'

export function PayslipManagementTab() {
  const storedRuns = usePayrollRunStore((s) => s.resultsByRunId)

  const runs = usePayrollRunStore((state) => state.runs)
  const defaultPayslips = useMemo(() => {
    const calculated = Object.entries(storedRuns).flatMap(([runId, result]) => {
      const run = runs.find((item) => item.id === runId)
      if (!run || result.dirtyEmployeeIds?.length || run.specialPeriodsPending) return []
      return result.details.map((detail) => detailToPayslip(detail, run.id, run.period, run.paymentDate))
    })
    return [...initialPayslips.filter((slip) => !storedRuns[slip.payrollRunId]), ...calculated]
  }, [storedRuns, runs])
  const [slipUpdates, setSlipUpdates] = useState<Record<string, Pick<PayslipRecord, 'status' | 'sentAt' | 'downloadedAt'>>>({})
  const payslips = useMemo(() => defaultPayslips.map((slip) => ({ ...slip, ...slipUpdates[`${slip.id}:${storedRuns[slip.payrollRunId]?.calculatedAt ?? 'legacy'}`] })), [defaultPayslips, slipUpdates, storedRuns])
  const setPayslips = (update: (previous: PayslipRecord[]) => PayslipRecord[]) => {
    setSlipUpdates(Object.fromEntries(update(payslips.map((slip) => ({ ...slip }))).map((slip) => [`${slip.id}:${storedRuns[slip.payrollRunId]?.calculatedAt ?? 'legacy'}`, {
      status: slip.status, sentAt: slip.sentAt, downloadedAt: slip.downloadedAt,
    }])))
  }
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState('June 2026')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const availablePeriods = useMemo(() => {
    const set = new Set(['June 2026', 'May 2026', 'April 2026', ...payslips.map((p) => p.period)])
    return Array.from(set)
  }, [payslips])

  const isFiltered = search.trim() !== '' || periodFilter !== 'June 2026' || statusFilter !== 'all'

  const handleResetFilters = () => {
    setSearch('')
    setPeriodFilter('June 2026')
    setStatusFilter('all')
  }

  const periodPayslips = useMemo(() => {
    return periodFilter === 'all'
      ? payslips
      : payslips.filter((p) => p.period === periodFilter)
  }, [payslips, periodFilter])

  const filtered = useMemo(() => {
    return payslips.filter((p) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.employeeName.toLowerCase().includes(q) ||
        p.employeeCode.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.payslipNumber.toLowerCase().includes(q)

      const matchesPeriod = periodFilter === 'all' || p.period === periodFilter
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesPeriod && matchesStatus
    })
  }, [payslips, search, periodFilter, statusFilter])

  const handleBulkSend = () => {
    const pendingSlips = filtered.filter((p) => p.status === 'published' || p.status === 'draft')
    const countToSend = pendingSlips.length > 0 ? pendingSlips.length : filtered.length

    setPayslips((prev) =>
      prev.map((p) => {
        const isInFiltered = filtered.some((f) => f.id === p.id)
        if (isInFiltered) {
          return {
            ...p,
            status: 'sent' as PayslipStatus,
            sentAt: m.payroll_approval_just_now(),
          }
        }
        return p
      }),
    )
    snackbar.success(m.payroll_payslip_sent_success({count: countToSend}))
  }

  const handleDownloadSingle = (p: PayslipRecord) => {
    try {
      downloadPayslipPdf(p)
      setPayslips((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, status: 'downloaded' as PayslipStatus, downloadedAt: m.payroll_approval_just_now() } : item,
        ),
      )
      snackbar.success(m.payroll_payslip_download_success({name: p.employeeName, number: p.payslipNumber}))
    } catch {
      snackbar.error(m.payroll_payslip_download_error({number: p.payslipNumber}))
    }
  }

  const handleExportBulk = async () => {
    try {
      setIsExporting(true)
      await exportPayslipsBulkZip(periodFilter, filtered)
      snackbar.success(m.payroll_payslip_export_success({count: filtered.length}))
    } catch {
      snackbar.error(m.payroll_payslip_export_error())
    } finally {
      setIsExporting(false)
    }
  }

  if (selectedPayslip) {
    return (
      <PayslipDetailView
        payslip={selectedPayslip}
        onBack={() => setSelectedPayslip(null)}
      />
    )
  }

  return (
    <div className='space-y-6'>
      {/* ── Top Summary & Filter Bar ───────────────────────────────────────── */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-primary/10 text-primary'>
              <IconUsers size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_payslip_total()}</p>
              <b className='text-base font-bold text-foreground'>{m.payroll_payslip_slip_count({count: periodPayslips.length})}</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
              <IconSend size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_payslip_sent()}</p>
              <b className='text-base font-bold text-emerald-600 dark:text-emerald-400'>
                {m.payroll_payslip_slip_count({count: periodPayslips.filter((p) => p.status === 'sent' || p.status === 'downloaded').length})}
              </b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconDownload size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_payslip_downloaded()}</p>
              <b className='text-base font-bold text-blue-600 dark:text-blue-400'>
                {m.payroll_payslip_slip_count({count: periodPayslips.filter((p) => p.status === 'downloaded').length})}
              </b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'>
              <IconMail size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_payslip_pending()}</p>
              <b className='text-base font-bold text-amber-600 dark:text-amber-400'>
                {m.payroll_payslip_slip_count({count: periodPayslips.filter((p) => p.status === 'published' || p.status === 'draft').length})}
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ───────────────────────────────────────── */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-wrap items-center gap-2.5 flex-1'>
          <div className='relative w-full sm:w-64 md:w-72'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={m.payroll_payslip_search_placeholder()}
              className='pl-9 pr-8 h-9.5 text-xs bg-card rounded-xl shadow-xs'
            />
            {search && (
              <Button
                type='button'
                onClick={() => setSearch('')}
                variant='ghost'
                size='icon-sm'
                aria-label={m.payroll_payslip_clear_search()}
                className='absolute right-1 top-1/2 -translate-y-1/2'
              >
                <IconX size={14} />
              </Button>
            )}
          </div>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className='h-9.5 text-xs bg-card rounded-xl w-[150px] shadow-xs'>
              <SelectValue placeholder={m.payroll_payslip_select_period()} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>{m.payroll_payslip_all_periods()}</SelectItem>
                {availablePeriods.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='h-9.5 text-xs bg-card rounded-xl w-[130px] shadow-xs'>
              <SelectValue placeholder={m.payroll_payslip_all_statuses()} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>{m.payroll_payslip_all_statuses()}</SelectItem>
                <SelectItem value='sent'>{m.payroll_status_sent()}</SelectItem>
                <SelectItem value='downloaded'>{m.payroll_status_downloaded()}</SelectItem>
                <SelectItem value='published'>{m.payroll_status_published()}</SelectItem>
                <SelectItem value='draft'>{m.payroll_status_draft()}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleResetFilters}
              className='h-9.5 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1'
            >
              <IconRotate size={13} />
              {m.payroll_payslip_reset()}
            </Button>
          )}
        </div>

        <div className='flex items-center gap-2.5 shrink-0'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExportBulk}
            disabled={isExporting || filtered.length === 0}
            className='gap-1.5 text-xs font-semibold rounded-xl h-9.5'
          >
            <IconFileSpreadsheet size={15} />
            {isExporting ? m.payroll_payslip_exporting() : m.payroll_payslip_export_button()}
          </Button>

          <Button
            size='sm'
            onClick={handleBulkSend}
            disabled={filtered.length === 0}
            className='gap-1.5 text-xs font-semibold rounded-xl h-9.5 shadow-xs'
          >
            <IconMail size={15} />
            {m.payroll_payslip_send_all_button()}
          </Button>
        </div>
      </div>

      {/* ── Payslip Table ─────────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>{m.payroll_payslip_col_number()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_overview_col_employees()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_attendance_period()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_payslip_col_gross()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_payslip_col_deductions()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_payslip_col_net()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_overview_col_status()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>{m.payroll_overview_col_action()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-48 text-center'>
                  <div className='flex flex-col items-center justify-center gap-2 py-6'>
                    <div className='p-3 rounded-full bg-muted/60 text-muted-foreground'>
                      <IconFileSpreadsheet size={24} />
                    </div>
                    <p className='text-sm font-semibold text-foreground'>{m.payroll_payslip_empty_title()}</p>
                    <p className='text-xs text-muted-foreground max-w-sm'>
                      {m.payroll_payslip_empty_description()}
                    </p>
                    {isFiltered && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleResetFilters}
                        className='mt-2 h-8 text-xs rounded-lg'
                      >
                        {m.payroll_payslip_reset_filters()}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className='text-xs hover:bg-muted/20 border-b border-border/40'>
                  <TableCell className='py-4 pl-6 font-mono font-bold text-foreground'>
                    {p.payslipNumber}
                  </TableCell>
                  <TableCell className='py-4'>
                    <div>
                      <p className='font-bold text-foreground'>{p.employeeName}</p>
                      <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>{p.employeeCode} · {p.department}</p>
                    </div>
                  </TableCell>
                  <TableCell className='py-4 text-muted-foreground font-medium'>{p.period}</TableCell>
                  <TableCell className='py-4 font-semibold text-foreground'>{formatIDR(p.totalEarnings)}</TableCell>
                  <TableCell className='py-4 text-rose-600 dark:text-rose-400 font-semibold'>-{formatIDR(p.totalDeductions)}</TableCell>
                  <TableCell className='py-4 font-bold text-emerald-600 dark:text-emerald-400'>{formatIDR(p.netPay)}</TableCell>
                  <TableCell className='py-4'>
                    <PayrollStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className='py-4 pr-6 text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setSelectedPayslip(p)}
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

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDownloadSingle(p)}
                            className='size-8 text-muted-foreground hover:text-primary hover:bg-primary/10'
                            aria-label={m.payroll_payslip_download_pdf()}
                          >
                            <IconDownload size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side='left'>
                          <p>{m.payroll_payslip_download_pdf()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
