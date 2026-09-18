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
  IconChevronDown,
} from '@tabler/icons-react'
import { useState, useMemo, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { initialAttendancePayrollRecords, formatIDR } from '../../data/mock-payroll-data'
import type { AttendancePayrollRecord, AttendanceSyncStatus } from '../../types'

// ── Pipeline Stage Data ─────────────────────────────────────────────────────
const pipelineStages = [
  {
    step: 1,
    title: 'Tarik Data Presensi',
    desc: '1.000 log kehadiran mesin fingerprint & mobile app terunduh',
    status: 'done' as const,
  },
  {
    step: 2,
    title: 'Validasi Cuti & Sakit',
    desc: 'Semua surat dokter & form cuti terverifikasi atasan',
    status: 'done' as const,
  },
  {
    step: 3,
    title: 'Kalkulasi Lembur',
    desc: 'Perhitungan otomatis sesuai rumus Depnaker 1.5x & 2x',
    status: 'done' as const,
  },
  {
    step: 4,
    title: 'Export ke Payroll',
    desc: 'Angka potongan & tunjangan siap diinjeksi ke payroll batch',
    status: 'ready' as const,
  },
]

// ── Helper: Status Badge ─────────────────────────────────────────────────────
function SyncStatusBadge({ status }: { status: AttendanceSyncStatus }) {
  const config: Record<AttendanceSyncStatus, { label: string; className: string }> = {
    synced_auto: {
      label: 'Tersinkronisasi Otomatis',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    synced_manual: {
      label: 'Sinkronisasi Manual',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    pending: {
      label: 'Menunggu Sinkronisasi',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    needs_review: {
      label: 'Perlu Review',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
  }
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${className}`}>
      {label}
    </span>
  )
}

// ── Excel Export Helper ──────────────────────────────────────────────────────
function exportToExcel(data: AttendancePayrollRecord[], period: string) {
  const syncLabel: Record<AttendanceSyncStatus, string> = {
    synced_auto: 'Tersinkronisasi Otomatis',
    synced_manual: 'Sinkronisasi Manual',
    pending: 'Menunggu Sinkronisasi',
    needs_review: 'Perlu Review',
  }

  const rows = data.map((r) => ({
    NIK: r.nik,
    'Nama Karyawan': r.employeeName,
    Periode: r.period,
    'Hari Kerja': r.workingDays,
    Hadir: r.presentDays,
    'Izin/Cuti (Hari)': r.leavePermitDays,
    'Terlambat (x)': r.lateCount,
    'Lembur (Jam)': r.overtimeHours,
    'Penyesuaian Gaji (Rp)': r.salaryAdjustment,
    'Status Data': syncLabel[r.syncStatus],
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 12 },
    { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 26 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance to Payroll')

  const filename = `Rekonsiliasi_Presensi_${period.replace(' ', '_')}.xlsx`
  XLSX.writeFile(wb, filename)
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AttendancePayrollTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)

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

  // Auto-dismiss success toast
  useEffect(() => {
    if (!syncSuccess) return
    const t = setTimeout(() => setSyncSuccess(false), 3000)
    return () => clearTimeout(t)
  }, [syncSuccess])

  function handleSyncUlang() {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setSyncSuccess(true)
    }, 1800)
  }

  function handleExport() {
    exportToExcel(filtered, selectedPeriod)
  }

  return (
    <div className='space-y-5'>
      {/* ── Toast Notification ──────────────────────────────────────────────── */}
      <div
        className={`fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl dark:border-emerald-800 dark:bg-zinc-900 transition-all duration-300 ${
          syncSuccess ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className='flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40'>
          <IconCheck size={16} className='text-emerald-600 dark:text-emerald-400' />
        </div>
        <div>
          <p className='text-[13px] font-semibold text-foreground'>Sinkronisasi Berhasil</p>
          <p className='text-[11px] text-muted-foreground'>
            Data presensi telah diperbarui ·{' '}
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* ── Header Description ──────────────────────────────────────────────── */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-sm font-bold text-foreground'>
            Alur Pipeline Rekonsiliasi Presensi ke Penggajian
          </h2>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Sistem mengambil, memvalidasi, dan menghitung data kehadiran secara otomatis sebelum
            diinjeksi ke proses payroll.
          </p>
        </div>
        <span className='flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 whitespace-nowrap'>
          <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
          Sinkronisasi Otomatis Aktif
        </span>
      </div>

      {/* ── Pipeline Steps — flex layout with arrows between cards ────────────── */}
      <div className='flex flex-col gap-3 lg:flex-row lg:items-stretch'>
        {pipelineStages.map((stage, idx) => (
          <>
            {/* Card */}
            <div
              key={stage.step}
              className={`flex-1 rounded-xl border p-4 transition-shadow ${
                stage.status === 'ready'
                  ? 'border-primary/50 bg-primary/5 shadow-sm shadow-primary/10 dark:bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='text-[11px] font-medium text-muted-foreground'>Tahap {stage.step}</div>
                {stage.status === 'done' ? (
                  <span className='flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                    <IconCheck size={10} />
                    Selesai
                  </span>
                ) : (
                  <span className='flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary'>
                    <IconArrowRight size={10} />
                    Siap Transfer
                  </span>
                )}
              </div>
              <p className='mt-2 text-[13px] font-bold leading-snug text-foreground'>{stage.title}</p>
              <p className='mt-1 text-[11px] leading-relaxed text-muted-foreground'>{stage.desc}</p>
            </div>

            {/* Arrow separator between cards (desktop only) */}
            {idx < pipelineStages.length - 1 && (
              <div className='hidden lg:flex items-center justify-center flex-shrink-0 w-6'>
                <IconArrowRight size={18} className='text-muted-foreground/50' />
              </div>
            )}
          </>
        ))}
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <div className='rounded-xl border border-border bg-card p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] font-medium text-muted-foreground'>Total Log Ditarik</span>
            <div className='rounded-lg bg-muted p-1.5'>
              <IconUsers size={14} className='text-muted-foreground' />
            </div>
          </div>
          <p className='mt-3 text-xl font-bold text-foreground'>
            {totalStaff.toLocaleString('id-ID')} Staf
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>Presensi terkonfirmasi 100%</p>
        </div>

        <div className='rounded-xl border border-border bg-card p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] font-medium text-muted-foreground'>Akumulasi Lembur Valid</span>
            <div className='rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30'>
              <IconClockHour4 size={14} className='text-blue-600 dark:text-blue-400' />
            </div>
          </div>
          <p className='mt-3 text-xl font-bold text-blue-600 dark:text-blue-400'>
            {totalOvertimeHours.toLocaleString('id-ID')} Jam
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>
            Estimasi upah: {formatIDR(Math.round((totalOvertimeHours * 8500000) / 173))}
          </p>
        </div>

        <div className='rounded-xl border border-border bg-card p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] font-medium text-muted-foreground'>Potongan Keterlambatan</span>
            <div className='rounded-lg bg-red-100 p-1.5 dark:bg-red-900/30'>
              <IconMinus size={14} className='text-red-500 dark:text-red-400' />
            </div>
          </div>
          <p className='mt-3 text-xl font-bold text-red-500 dark:text-red-400'>
            -{formatIDR(totalLateDeduction)}
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>
            {periodRecords.reduce((s, r) => s + r.lateCount, 0)} kejadian terlambat toleransi lewat
          </p>
        </div>

        <div className='rounded-xl border border-border bg-card p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] font-medium text-muted-foreground'>Status Sinkronisasi</span>
            <div className='rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/30'>
              <IconCalendarStats size={14} className='text-emerald-600 dark:text-emerald-400' />
            </div>
          </div>
          <p className='mt-3 text-xl font-bold text-emerald-600 dark:text-emerald-400'>
            {syncedPercent} Siap
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>
            {needsReviewCount > 0
              ? `${needsReviewCount} karyawan perlu review manual`
              : 'Semua data presensi telah dikonfirmasi'}
          </p>
        </div>
      </div>

      {/* ── Filter & Action Bar ──────────────────────────────────────────────── */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2'>
          {/* Period filter dropdown */}
          <div className='relative'>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className='h-9 appearance-none rounded-lg border border-border bg-background pl-3 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer'
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className='pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground'
            />
          </div>

          {/* Search */}
          <div className='relative'>
            <IconSearch
              size={14}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
            />
            <input
              type='text'
              placeholder='Cari nama, NIK...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-9 w-48 rounded-lg border border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
            />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Sync button */}
          <button
            type='button'
            onClick={handleSyncUlang}
            disabled={isSyncing}
            className='flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-60 transition-colors'
          >
            <IconRefresh
              size={14}
              className={isSyncing ? 'animate-spin text-primary' : 'text-muted-foreground'}
            />
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Ulang'}
          </button>

          {/* Export Excel button */}
          <button
            type='button'
            onClick={handleExport}
            className='flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all'
          >
            <IconFileSpreadsheet size={14} />
            Export Excel
          </button>
        </div>
      </div>

      {/* ── Data Table ───────────────────────────────────────────────────────── */}
      <div className='rounded-xl border border-border bg-card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-xs'>
            <thead>
              <tr className='border-b border-border bg-muted/40'>
                <th className='px-4 py-3 text-left font-semibold text-muted-foreground'>NIK</th>
                <th className='px-4 py-3 text-left font-semibold text-muted-foreground'>Nama Karyawan</th>
                <th className='px-4 py-3 text-center font-semibold text-muted-foreground'>Periode</th>
                <th className='px-4 py-3 text-center font-semibold text-muted-foreground'>Hari Kerja</th>
                <th className='px-4 py-3 text-center font-semibold text-muted-foreground'>Hadir</th>
                <th className='px-4 py-3 text-center font-semibold text-muted-foreground'>Izin/Cuti</th>
                <th className='px-4 py-3 text-center font-semibold text-muted-foreground'>Terlambat</th>
                <th className='px-4 py-3 text-center font-semibold text-muted-foreground'>Lembur</th>
                <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Penyesuaian Gaji</th>
                <th className='px-4 py-3 text-left font-semibold text-muted-foreground'>Status Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className='py-12 text-center text-muted-foreground'>
                    <IconUserCheck size={32} className='mx-auto mb-2 opacity-30' />
                    <p>Tidak ada data yang cocok</p>
                  </td>
                </tr>
              ) : (
                filtered.map((record, idx) => (
                  <RecordRow key={`${record.nik}-${record.period}`} record={record} isEven={idx % 2 === 0} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className='border-t border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between'>
          <p className='text-[11px] text-muted-foreground'>
            Menampilkan{' '}
            <span className='font-semibold text-foreground'>{filtered.length}</span> dari{' '}
            <span className='font-semibold text-foreground'>{periodRecords.length}</span> karyawan
            {searchQuery && ' (hasil pencarian)'}
          </p>
          <p className='text-[11px] text-muted-foreground'>
            Periode:{' '}
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
    <tr
      className={`border-b border-border/60 last:border-b-0 transition-colors hover:bg-muted/30 ${isEven ? '' : 'bg-muted/10'}`}
    >
      <td className='px-4 py-3 font-mono text-[11px] text-muted-foreground'>{record.nik}</td>
      <td className='px-4 py-3 font-semibold text-foreground'>{record.employeeName}</td>
      <td className='px-4 py-3 text-center'>
        <span className='rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground'>
          {record.period}
        </span>
      </td>
      <td className='px-4 py-3 text-center text-foreground'>{record.workingDays} Hari</td>
      <td className='px-4 py-3 text-center text-foreground'>{record.presentDays} Hari</td>
      <td className='px-4 py-3 text-center text-foreground'>
        {record.leavePermitDays > 0 ? `${record.leavePermitDays} Hari` : '0 Hari'}
      </td>
      <td className={`px-4 py-3 text-center ${lateColor}`}>
        {record.lateCount > 0 ? `${record.lateCount}x` : '0x'}
      </td>
      <td className={`px-4 py-3 text-center ${overtimeColor}`}>
        {record.overtimeHours > 0 ? `+${record.overtimeHours} Jam` : '+0 Jam'}
      </td>
      <td className={`px-4 py-3 text-right font-medium ${adjColor}`}>
        {record.salaryAdjustment > 0
          ? `Rp ${record.salaryAdjustment.toLocaleString('id-ID')}`
          : record.salaryAdjustment < 0
            ? `-Rp ${Math.abs(record.salaryAdjustment).toLocaleString('id-ID')}`
            : 'Rp 0'}
      </td>
      <td className='px-4 py-3'>
        <SyncStatusBadge status={record.syncStatus} />
      </td>
    </tr>
  )
}
