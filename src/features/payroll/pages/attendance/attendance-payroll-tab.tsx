// src/features/payroll/pages/attendance/attendance-payroll-tab.tsx
// Dashboard rekonsiliasi data presensi ke penggajian
import {
  IconCalendarStats,
  IconCheck,
  IconSearch,
  IconRefresh,
  IconArrowRight,
  IconUserCheck,
  IconClockHour4,
  IconMinus,
  IconUsers,
  IconFileSpreadsheet,
} from '@tabler/icons-react'
import { Fragment, useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { initialAttendancePayrollRecords, formatIDR } from '../../data/mock-payroll-data'
import type { AttendancePayrollRecord, AttendanceSyncStatus } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

// ── Pipeline Stage Data ─────────────────────────────────────────────────────
const getPipelineStages = () => [
  {
    step: 1,
    title: m.payroll_attendance_stage_pull_title(),
    desc: m.payroll_attendance_stage_pull_description(),
    status: 'done' as const,
  },
  {
    step: 2,
    title: m.payroll_attendance_stage_validate_title(),
    desc: m.payroll_attendance_stage_validate_description(),
    status: 'done' as const,
  },
  {
    step: 3,
    title: m.payroll_attendance_stage_overtime_title(),
    desc: m.payroll_attendance_stage_overtime_description(),
    status: 'done' as const,
  },
  {
    step: 4,
    title: m.payroll_attendance_stage_export_title(),
    desc: m.payroll_attendance_stage_export_description(),
    status: 'ready' as const,
  },
]

// ── Helper: Status Badge ─────────────────────────────────────────────────────
function SyncStatusBadge({ status }: { status: AttendanceSyncStatus }) {
  const config: Record<AttendanceSyncStatus, { label: string; variant: 'emerald' | 'blue' | 'amber' | 'red' }> = {
    synced_auto: {
      label: m.payroll_attendance_status_auto(),
      variant: 'emerald',
    },
    synced_manual: {
      label: m.payroll_attendance_status_manual(),
      variant: 'blue',
    },
    pending: {
      label: m.payroll_attendance_status_pending(),
      variant: 'amber',
    },
    needs_review: {
      label: m.payroll_attendance_status_review(),
      variant: 'red',
    },
  }
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

// ── Excel Export Helper ──────────────────────────────────────────────────────
function exportToExcel(data: AttendancePayrollRecord[], period: string) {
  const syncLabel: Record<AttendanceSyncStatus, string> = {
    synced_auto: m.payroll_attendance_status_auto(),
    synced_manual: m.payroll_attendance_status_manual(),
    pending: m.payroll_attendance_status_pending(),
    needs_review: m.payroll_attendance_status_review(),
  }

  const rows = data.map((r) => ({
    NIK: r.nik,
    [m.payroll_attendance_col_employee()]: r.employeeName,
    [m.payroll_attendance_period()]: r.period,
    [m.payroll_attendance_col_working_days()]: r.workingDays,
    [m.payroll_attendance_col_present()]: r.presentDays,
    [m.payroll_attendance_col_leave()]: r.leavePermitDays,
    [m.payroll_attendance_col_late()]: r.lateCount,
    [m.payroll_attendance_col_overtime()]: r.overtimeHours,
    [m.payroll_attendance_col_adjustment()]: r.salaryAdjustment,
    [m.payroll_attendance_col_status()]: syncLabel[r.syncStatus],
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 12 },
    { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 26 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, m.payroll_attendance_export_sheet())

  const filename = m.payroll_attendance_export_filename({ period: period.replace(' ', '_') })
  XLSX.writeFile(wb, filename)
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AttendancePayrollTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  const allRecords = initialAttendancePayrollRecords

  // Derive unique periods from data, sorted descending (latest first)
  const availablePeriods = useMemo(() => {
    const periods = [...new Set(allRecords.map((r) => r.period))]
    // Sort by year desc, month desc
    const monthOrder: Record<string, number> = {
      Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6,
      Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12,
    }
    return periods.sort((a, b) => {
      const [mA, yA] = a.split(' ')
      const [mB, yB] = b.split(' ')
      if (yB !== yA) return Number(yB) - Number(yA)
      return (monthOrder[mB] ?? 0) - (monthOrder[mA] ?? 0)
    })
  }, [allRecords])

  // Default to first (latest) period
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => availablePeriods[0] ?? '')

  // Records filtered by period
  const periodRecords = useMemo(
    () => allRecords.filter((r) => r.period === selectedPeriod),
    [allRecords, selectedPeriod],
  )

  // Summary stats for selected period
  const totalStaff = periodRecords.length
  const totalOvertimeHours = periodRecords.reduce((s, r) => s + r.overtimeHours, 0)
  const totalLateDeduction = periodRecords.reduce((s, r) => s + r.lateCount * 50000, 0)
  const needsReviewCount = periodRecords.filter((r) => r.syncStatus === 'needs_review').length
  const syncedCount = periodRecords.filter(
    (r) => r.syncStatus === 'synced_auto' || r.syncStatus === 'synced_manual',
  ).length
  const syncedPercent = totalStaff > 0 ? Math.round((syncedCount / totalStaff) * 100) + '%' : '0%'

  // Search filter on top of period filter
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return periodRecords
    return periodRecords.filter(
      (r) => r.nik.toLowerCase().includes(q) || r.employeeName.toLowerCase().includes(q),
    )
  }, [periodRecords, searchQuery])

  function handleSyncUlang() {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      snackbar.success(m.payroll_attendance_sync_success())
    }, 1800)
  }

  function handleExport() {
    exportToExcel(filtered, selectedPeriod)
  }

  return (
    <div className='space-y-5'>
      {/* ── Toast Notification ──────────────────────────────────────────────── */}

      {/* ── Header Description ──────────────────────────────────────────────── */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-sm font-bold text-foreground'>
            {m.payroll_attendance_pipeline_title()}
          </h2>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {m.payroll_attendance_pipeline_description()}
          </p>
        </div>
        <Badge variant='emerald' className='gap-1.5 whitespace-nowrap'>
          <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
          {m.payroll_attendance_auto_sync_active()}
        </Badge>
      </div>

      {/* ── Pipeline Steps — flex layout with arrows between cards ────────────── */}
      <div className='flex flex-col gap-3 lg:flex-row lg:items-stretch'>
        {getPipelineStages().map((stage, idx) => (
          <Fragment key={stage.step}>
            {/* Card */}
            <div
              className={`flex-1 rounded-xl border p-4 transition-shadow ${
                stage.status === 'ready'
                  ? 'border-primary/50 bg-primary/5 shadow-sm shadow-primary/10 dark:bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='text-[11px] font-medium text-muted-foreground'>{m.payroll_attendance_stage_number({ number: stage.step })}</div>
                {stage.status === 'done' ? (
                  <Badge variant='emerald' className='gap-1'>
                    <IconCheck size={10} />
                    {m.payroll_attendance_stage_done()}
                  </Badge>
                ) : (
                  <Badge variant='blue' className='gap-1'>
                    <IconArrowRight size={10} />
                    {m.payroll_attendance_stage_ready()}
                  </Badge>
                )}
              </div>
              <p className='mt-2 text-[13px] font-bold leading-snug text-foreground'>{stage.title}</p>
              <p className='mt-1 text-[11px] leading-relaxed text-muted-foreground'>{stage.desc}</p>
            </div>

            {/* Arrow separator between cards (desktop only) */}
            {idx < getPipelineStages().length - 1 && (
              <div className='hidden lg:flex items-center justify-center flex-shrink-0 w-6'>
                <IconArrowRight size={18} className='text-muted-foreground/50' />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <div className='rounded-xl border border-border bg-card p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] font-medium text-muted-foreground'>{m.payroll_attendance_total_logs()}</span>
            <div className='rounded-lg bg-muted p-1.5'>
              <IconUsers size={14} className='text-muted-foreground' />
            </div>
          </div>
          <p className='mt-3 text-xl font-bold text-foreground'>
            {m.payroll_attendance_staff_count({ count: totalStaff.toLocaleString(getLocale()) })}
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>{m.payroll_attendance_confirmed()}</p>
        </div>

        <div className='rounded-xl border border-border bg-card p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] font-medium text-muted-foreground'>{m.payroll_attendance_valid_overtime()}</span>
            <div className='rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30'>
              <IconClockHour4 size={14} className='text-blue-600 dark:text-blue-400' />
            </div>
          </div>
          <p className='mt-3 text-xl font-bold text-blue-600 dark:text-blue-400'>
            {m.payroll_attendance_hours_count({ count: totalOvertimeHours.toLocaleString(getLocale()) })}
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>
            {m.payroll_attendance_estimated_wage({ amount: formatIDR(Math.round((totalOvertimeHours * 8500000) / 173)) })}
          </p>
        </div>

        <div className='rounded-xl border border-border bg-card p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] font-medium text-muted-foreground'>{m.payroll_attendance_late_deductions()}</span>
            <div className='rounded-lg bg-red-100 p-1.5 dark:bg-red-900/30'>
              <IconMinus size={14} className='text-red-500 dark:text-red-400' />
            </div>
          </div>
          <p className='mt-3 text-xl font-bold text-red-500 dark:text-red-400'>
            -{formatIDR(totalLateDeduction)}
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>
            {m.payroll_attendance_late_count({ count: periodRecords.reduce((s, r) => s + r.lateCount, 0) })}
          </p>
        </div>

        <div className='rounded-xl border border-border bg-card p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] font-medium text-muted-foreground'>{m.payroll_attendance_sync_status()}</span>
            <div className='rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/30'>
              <IconCalendarStats size={14} className='text-emerald-600 dark:text-emerald-400' />
            </div>
          </div>
          <p className='mt-3 text-xl font-bold text-emerald-600 dark:text-emerald-400'>
            {m.payroll_attendance_ready_percent({ percent: syncedPercent })}
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>
            {needsReviewCount > 0
              ? m.payroll_attendance_review_count({ count: needsReviewCount })
              : m.payroll_attendance_all_confirmed()}
          </p>
        </div>
      </div>

      {/* ── Filter & Action Bar ──────────────────────────────────────────────── */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2'>
          {/* Period filter dropdown */}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger aria-label={m.payroll_attendance_period()} className='w-auto'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availablePeriods.map((period) => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className='relative'>
            <IconSearch
              size={14}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              type='text'
              aria-label={m.payroll_attendance_search_placeholder()}
              placeholder={m.payroll_attendance_search_placeholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-48 pl-8'
            />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Sync button */}
          <Button
            type='button'
            variant='outline'
            onClick={handleSyncUlang}
            disabled={isSyncing}
          >
            <IconRefresh data-icon='inline-start' className={isSyncing ? 'animate-spin' : undefined} />
            {isSyncing ? m.payroll_attendance_syncing() : m.payroll_attendance_sync_button()}
          </Button>

          {/* Export Excel button */}
          <Button
            type='button'
            onClick={handleExport}
          >
            <IconFileSpreadsheet data-icon='inline-start' />
            {m.payroll_attendance_export_button()}
          </Button>
        </div>
      </div>

      {/* ── Data Table ───────────────────────────────────────────────────────── */}
      <div className='rounded-xl border border-border bg-card overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table className='text-xs'>
            <TableHeader>
              <TableRow>
                <TableHead>NIK</TableHead>
                <TableHead>{m.payroll_attendance_col_employee()}</TableHead>
                <TableHead>{m.payroll_attendance_period()}</TableHead>
                <TableHead>{m.payroll_attendance_col_working_days()}</TableHead>
                <TableHead>{m.payroll_attendance_col_present()}</TableHead>
                <TableHead>{m.payroll_attendance_col_leave()}</TableHead>
                <TableHead>{m.payroll_attendance_col_late()}</TableHead>
                <TableHead>{m.payroll_attendance_col_overtime()}</TableHead>
                <TableHead className='text-right'>{m.payroll_attendance_col_adjustment()}</TableHead>
                <TableHead>{m.payroll_attendance_col_status()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className='py-12 text-center text-muted-foreground'>
                    <IconUserCheck size={32} className='mx-auto mb-2 opacity-30' />
                    <p>{m.payroll_attendance_empty()}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record, idx) => (
                  <RecordRow key={`${record.nik}-${record.period}`} record={record} isEven={idx % 2 === 0} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        <div className='border-t border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between'>
          <p className='text-[11px] text-muted-foreground'>
            {m.payroll_attendance_showing({ shown: filtered.length, total: periodRecords.length })}
            {searchQuery && m.payroll_attendance_search_result()}
          </p>
          <p className='text-[11px] text-muted-foreground'>
            {m.payroll_attendance_period()}:{' '}
            <span className='font-semibold text-foreground'>{selectedPeriod}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Table Row Sub-component ──────────────────────────────────────────────────
function RecordRow({
  record,
  isEven,
}: {
  record: AttendancePayrollRecord
  isEven: boolean
}) {
  const lateColor =
    record.lateCount === 0 ? 'text-muted-foreground' : 'text-red-500 dark:text-red-400 font-bold'
  const overtimeColor =
    record.overtimeHours === 0
      ? 'text-muted-foreground'
      : 'text-blue-600 dark:text-blue-400 font-bold'
  const adjColor =
    record.salaryAdjustment > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : record.salaryAdjustment < 0
        ? 'text-red-500 dark:text-red-400'
        : 'text-muted-foreground'

  return (
    <TableRow
      className={`border-b border-border/60 last:border-b-0 transition-colors hover:bg-muted/30 ${isEven ? '' : 'bg-muted/10'}`}
    >
      <TableCell className='font-mono text-[11px] text-muted-foreground'>{record.nik}</TableCell>
      <TableCell className='font-semibold text-foreground'>{record.employeeName}</TableCell>
      <TableCell className='text-center'>
        <span className='rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground'>
          {record.period}
        </span>
      </TableCell>
      <TableCell className='text-center text-foreground'>{m.payroll_attendance_days({count: record.workingDays})}</TableCell>
      <TableCell className='text-center text-foreground'>{m.payroll_attendance_days({count: record.presentDays})}</TableCell>
      <TableCell className='text-center text-foreground'>
        {record.leavePermitDays > 0 ? `${record.leavePermitDays} Hari` : '0 Hari'}
      </TableCell>
      <TableCell className={`text-center ${lateColor}`}>
        {record.lateCount > 0 ? `${record.lateCount}x` : '0x'}
      </TableCell>
      <TableCell className={`text-center ${overtimeColor}`}>
        {record.overtimeHours > 0 ? `+${record.overtimeHours} Jam` : '+0 Jam'}
      </TableCell>
      <TableCell className={`text-right font-medium ${adjColor}`}>
        {record.salaryAdjustment > 0
          ? `Rp ${record.salaryAdjustment.toLocaleString('id-ID')}`
          : record.salaryAdjustment < 0
            ? `-Rp ${Math.abs(record.salaryAdjustment).toLocaleString('id-ID')}`
            : 'Rp 0'}
      </TableCell>
      <TableCell>
        <SyncStatusBadge status={record.syncStatus} />
      </TableCell>
    </TableRow>
  )
}
