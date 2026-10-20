import {
  IconAlertCircle,
  IconCheck,
  IconClockHour4,
  IconDownload,
  IconFileCertificate,
  IconHeartbeat,
  IconInfoCircle,
  IconLock,
  IconShieldCheck,
} from '@tabler/icons-react'
import { useMemo, useRef, useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import type { AttendanceReportRow } from '../types'
import {
  generateEmployeeDailyAttendance,
  generateEmployeeOvertimeOrders,
  generateEmployeeSickLeave,
  getTwoTierApprovers,
} from '../utils/employee-attendance-generator'

interface EmployeeAttendanceDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: AttendanceReportRow | null
  periodLabel?: string
  yearMonth?: string
}

// ── Badge Stempel Digital ACC Resmi Head Departemen ─────────────────────────
function DigitalApprovalStamp({
  approverName,
  approverTitle,
  approvedAt = '01 Sep 2026',
  code = 'BFP-ACC-202608',
}: {
  approverName: string
  approverTitle: string
  approvedAt?: string
  code?: string
}) {
  return (
    <div className='inline-flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-500 w-full max-w-[210px] text-center shadow-xs'>
      <div className='flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400'>
        <svg viewBox='0 0 24 24' className='size-3.5 fill-emerald-600 shrink-0'>
          <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
        </svg>
        <span>ACC / APPROVED</span>
      </div>
      <p className='text-[10px] font-black leading-tight mt-1 text-foreground'>{approverName}</p>
      <p className='text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold'>{approverTitle}</p>
      <div className='mt-1 pt-1 border-t border-emerald-300 dark:border-emerald-700 w-full flex items-center justify-between text-[8px] font-mono text-muted-foreground'>
        <span>{approvedAt}</span>
        <span className='font-bold text-emerald-800 dark:text-emerald-300'>{code}</span>
      </div>
    </div>
  )
}

// ── Badge Pengajuan Karyawan ────────────────────────────────────────────────
function EmployeeSubmittedBadge({
  employeeName,
  employeeTitle,
}: {
  employeeName: string
  employeeTitle: string
}) {
  return (
    <div className='inline-flex flex-col items-center justify-center p-2 rounded-xl border border-border/80 bg-muted/40 text-foreground w-full max-w-[200px] text-center'>
      <span className='text-[9px] font-bold text-primary uppercase tracking-wider'>
        ✓ Diajukan via HRIS
      </span>
      <p className='text-[10px] font-bold mt-1 text-foreground leading-tight'>{employeeName}</p>
      <p className='text-[9px] text-muted-foreground'>{employeeTitle}</p>
      <span className='text-[8px] font-mono text-muted-foreground mt-0.5'>Terverifikasi Akun Pegawai</span>
    </div>
  )
}

// ── Badge Pengesahan Direktur / Client Approver ──────────────────────────────
function ClientApprovedBadge({
  approverName,
  approverTitle,
}: {
  approverName: string
  approverTitle: string
}) {
  return (
    <div className='inline-flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-blue-600 bg-blue-50/80 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-500 w-full max-w-[210px] text-center shadow-xs'>
      <div className='flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400'>
        <svg viewBox='0 0 24 24' className='size-3.5 fill-blue-600 shrink-0'>
          <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
        </svg>
        <span>VERIFIED & ACC</span>
      </div>
      <p className='text-[10px] font-black leading-tight mt-1 text-foreground'>{approverName}</p>
      <p className='text-[9px] text-blue-700 dark:text-blue-400 font-semibold'>{approverTitle}</p>
      <div className='mt-1 pt-1 border-t border-blue-300 dark:border-blue-700 w-full text-[8px] font-mono text-center font-bold text-blue-800 dark:text-blue-300'>
        PERTAMINA PATRA LOGISTIK
      </div>
    </div>
  )
}

export function EmployeeAttendanceDetailDialog({
  open,
  onOpenChange,
  employee,
  periodLabel = '01-31 Agustus 2026',
  yearMonth = '2026-08',
}: EmployeeAttendanceDetailDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'ALL' | 'ATTENDANCE' | 'SPKL' | 'SICK_LEAVE'>('ALL')

  const { timesheets } = useApprovalSyncStore()

  const approvers = useMemo(() => {
    if (!employee) return getTwoTierApprovers('Operations', 'AFT Tambolaka')
    return getTwoTierApprovers(employee.department, employee.project)
  }, [employee])

  const currentTs = useMemo(() => {
    if (!employee) return null
    return (
      timesheets.find(
        (ts) =>
          ts.id === `req-ts-${employee.id}` ||
          ts.id.endsWith(employee.id) ||
          ts.employeeName.toLowerCase() === employee.employeeName.toLowerCase(),
      ) || null
    )
  }, [timesheets, employee])

  const isFullyApproved = currentTs?.status === 'approved'
  const isLevel1Approved =
    currentTs?.currentLevel === 2 || currentTs?.status === 'approved'
  const isLevel2Approved = currentTs?.status === 'approved'
  const isPendingLevel1 = currentTs
    ? currentTs.currentLevel === 1 && currentTs.status === 'pending'
    : false
  const isPendingLevel2 = currentTs
    ? currentTs.currentLevel === 2 && currentTs.status === 'pending'
    : false

  const dailyItems = useMemo(() => {
    if (!employee) return []
    return generateEmployeeDailyAttendance(employee, yearMonth)
  }, [employee, yearMonth])

  const overtimeOrders = useMemo(() => {
    if (!employee) return []
    return generateEmployeeOvertimeOrders(employee, yearMonth)
  }, [employee, yearMonth])

  const sickLeaveRecord = useMemo(() => {
    if (!employee) return null
    return generateEmployeeSickLeave(employee, yearMonth)
  }, [employee, yearMonth])

  if (!employee) return null

  const handleDownloadPdf = () => {
    if (!isFullyApproved) {
      snackbar.error(
        'Timesheet belum dapat diunduh karena belum disetujui penuh oleh Head Departemen & Head Divisi!',
      )
      return
    }

    const prevTitle = document.title
    const safeName = employee.employeeName.replace(/\s+/g, '_')
    document.title = `Paket_Form_Absensi_SPKL_${safeName}_${yearMonth}`
    setActiveTab('ALL')

    setTimeout(() => {
      window.print()
      document.title = prevTitle
    }, 150)
  }

  const locationText = employee.location || 'AFT Tambolaka'
  const projectText = employee.project || 'AFT Tambolaka'
  const positionText = employee.position || 'Security'
  const nipText = employee.employeeCode || employee.id

  // Total jam lembur Yosep Fendi Seda atau karyawan lain
  const totalOvertimeDisplay =
    employee.employeeName.toLowerCase().includes('yosep') || employee.id === 'ATT-000'
      ? '89 jam'
      : `${employee.overtimeHours} jam`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[96vw] md:max-w-[92vw] lg:max-w-6xl w-full max-h-[94vh] flex flex-col p-0 overflow-hidden bg-background rounded-2xl print:static print:inset-auto print:translate-x-0 print:translate-y-0 print:transform-none print:w-full print:max-w-none print:min-w-full print:h-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none print:p-0 print:m-0 print:bg-white'>
        {/* Modal Header & Navigation Bar */}
        <DialogHeader className='p-4 pr-12 border-b border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/20 print:hidden'>
          <div className='min-w-0 pr-2'>
            <div className='flex items-center gap-2 flex-wrap'>
              <DialogTitle className='text-base font-bold text-foreground truncate'>
                Paket Dokumen Absensi & Lembur — {employee.employeeName}
              </DialogTitle>
              {isFullyApproved ? (
                <Badge variant='outline' className='bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[11px] gap-1 px-2.5 py-0.5'>
                  <IconCheck size={13} className='stroke-3' />
                  ACC / Disetujui Penuh
                </Badge>
              ) : isPendingLevel2 ? (
                <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-400 font-bold text-[11px] gap-1 px-2.5 py-0.5'>
                  <IconClockHour4 size={13} />
                  Menunggu Head Divisi (Tahap 2/2)
                </Badge>
              ) : (
                <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 font-bold text-[11px] gap-1 px-2.5 py-0.5'>
                  <IconClockHour4 size={13} />
                  Menunggu Head Departemen (Tahap 1/2)
                </Badge>
              )}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Alur persetujuan: <strong>{approvers.deptHead.name}</strong> ({approvers.deptHead.title}) ➔ <strong>{approvers.divHead.name}</strong> ({approvers.divHead.title})
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0 pr-6'>
            {/* View Filter Switcher */}
            <div className='flex items-center rounded-lg border border-border/80 bg-background p-0.5 text-xs font-semibold'>
              <button
                type='button'
                onClick={() => setActiveTab('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'ALL'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1 Paket Lengkap
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('ATTENDANCE')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'ATTENDANCE'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Form Absensi
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('SPKL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'SPKL'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                SPKL Lembur ({overtimeOrders.length})
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('SICK_LEAVE')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'SICK_LEAVE'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sick Leave
              </button>
            </div>

            <Button
              type='button'
              size='sm'
              disabled={!isFullyApproved}
              onClick={handleDownloadPdf}
              className={cn(
                'h-8.5 gap-1.5 px-3.5 text-xs font-bold shadow-xs shrink-0 transition-all',
                isFullyApproved
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer'
                  : 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed border border-border/80',
              )}
              title={
                isFullyApproved
                  ? 'Download Dokumen PDF Resmi'
                  : 'Timesheet belum disetujui penuh oleh Head Departemen & Head Divisi. Harap selesaikan persetujuan terlebih dahulu.'
              }
            >
              {isFullyApproved ? <IconDownload size={15} /> : <IconLock size={15} />}
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        {/* ── Multi-Tier Approval Interactive Status & Action Bar ── */}
        <div
          className={cn(
            'p-3 px-4 sm:px-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs print:hidden',
            isFullyApproved
              ? 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
              : 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
          )}
        >
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center gap-2 font-bold'>
              {isFullyApproved ? (
                <span className='flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300'>
                  <IconShieldCheck size={18} className='text-emerald-600' />
                  <span>Status: Disetujui Penuh (Sah & Siap Diunduh)</span>
                </span>
              ) : (
                <span className='flex items-center gap-1.5 text-amber-800 dark:text-amber-300'>
                  <IconAlertCircle size={18} className='text-amber-600' />
                  <span>
                    Status Persetujuan:{' '}
                    {isPendingLevel1 ? 'Menunggu ACC Head Departemen' : 'Menunggu ACC Head Divisi'}
                  </span>
                </span>
              )}
            </div>

            {/* Visual Steps Stepper */}
            <div className='flex items-center gap-2 text-[11px] font-semibold'>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md border flex items-center gap-1',
                  isLevel1Approved
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300',
                )}
              >
                {isLevel1Approved ? <IconCheck size={12} className='stroke-3' /> : '1.'}
                Head Dept: {approvers.deptHead.name.split(',')[0]}
              </span>
              <span className='text-muted-foreground'>➔</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md border flex items-center gap-1',
                  isLevel2Approved
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : isLevel1Approved
                      ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'bg-muted text-muted-foreground border-border/70',
                )}
              >
                {isLevel2Approved ? <IconCheck size={12} className='stroke-3' /> : '2.'}
                Head Divisi: {approvers.divHead.name}
              </span>
            </div>
          </div>

          {/* Status Message Info */}
          <div className='flex items-center gap-2 shrink-0'>
            {isFullyApproved ? (
              <span className='font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800'>
                KODE APPROVAL: {approvers.deptHead.approvalCode} / {approvers.divHead.approvalCode}
              </span>
            ) : (
              <div className='flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-300/80 dark:border-amber-700'>
                <IconInfoCircle size={15} className='shrink-0 text-amber-600' />
                <span>Lakukan persetujuan melalui menu <strong>Persetujuan</strong>.</span>
              </div>
            )}
          </div>
        </div>

        {/* Printable & Scrollable Form Sheet Area */}
        <div className='flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/30 dialog-scroll-container print:overflow-visible print:p-0 print:m-0 print:bg-white'>
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 6mm 7mm;
              }

              html, body {
                width: 100% !important;
                height: auto !important;
                min-height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #0f172a !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              /* Hide outside page layout */
              #root,
              [data-slot="dialog-overlay"],
              [data-slot="dialog-close"],
              [data-slot="dialog-header"],
              .print\\:hidden {
                display: none !important;
                visibility: hidden !important;
              }

              [data-slot="dialog-content"] {
                position: static !important;
                inset: auto !important;
                transform: none !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                border: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #ffffff !important;
              }

              .dialog-scroll-container {
                overflow: visible !important;
                height: auto !important;
                max-height: none !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #ffffff !important;
              }

              #printable-employee-attendance-form {
                position: static !important;
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                background: #ffffff !important;
                color: #0f172a !important;
              }

              .print-sheet {
                display: block !important;
                visibility: visible !important;
                background: #ffffff !important;
                color: #0f172a !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }

              .print-page-break {
                break-before: page !important;
                page-break-before: always !important;
                padding-top: 6mm !important;
              }

              .print-avoid-break {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              table {
                width: 100% !important;
                border-collapse: collapse !important;
              }

              tr {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              th, td {
                border-color: #0f172a !important;
              }
            }
          `}</style>
          <div
            id='printable-employee-attendance-form'
            ref={printRef}
            className='mx-auto max-w-[1020px] space-y-8 bg-transparent print:space-y-0 print:w-full print:max-w-none'
          >
            {/* ══════════════════════════════════════════════════════════════════
                HALAMAN 1: FORM ABSENSI KARYAWAN
            ══════════════════════════════════════════════════════════════════ */}
            <div
              className={cn(
                'print-sheet bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 p-6 sm:p-8 rounded-xl border border-border/70 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0',
                activeTab === 'ALL' || activeTab === 'ATTENDANCE' ? 'block' : 'hidden print:block',
              )}
            >
                {/* ── KOP FORM ABSENSI PT BINTANG FAJAR PERSADA ── */}
                <div className='flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-zinc-100 gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='relative size-10 flex items-center justify-center shrink-0'>
                      <svg viewBox='0 0 100 100' className='size-10'>
                        <polygon
                          points='50,5 64,35 98,38 72,62 80,95 50,78 20,95 28,62 2,38 36,35'
                          className='fill-amber-500 stroke-blue-900'
                          strokeWidth='4'
                        />
                        <path
                          d='M10 50 Q 50 20 90 50 Q 50 80 10 50'
                          fill='none'
                          className='stroke-blue-800'
                          strokeWidth='5'
                        />
                      </svg>
                    </div>
                    <div>
                      <h1 className='text-xl sm:text-2xl font-black tracking-wider text-blue-950 dark:text-blue-400 leading-none'>
                        PT. BINTANG FAJAR PERSADA
                      </h1>
                      <p className='text-[10px] tracking-widest text-slate-500 dark:text-slate-400 mt-1 font-semibold uppercase'>
                        Manpower Supply & Facility Support Services
                      </p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <span className='inline-block px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded font-mono text-xs font-bold border border-slate-300 dark:border-zinc-700'>
                      HRIS-ATT-{yearMonth}
                    </span>
                  </div>
                </div>

                {/* Title Document */}
                <div className='my-4 text-center'>
                  <h2 className='text-base sm:text-lg font-black uppercase tracking-wide underline underline-offset-4'>
                    FORM ABSENSI KARYAWAN
                  </h2>
                </div>

                {/* ── Metadata Info Grid ── */}
                <div className='flex flex-col sm:flex-row justify-between items-start gap-4 text-xs mb-4 pb-2 border-b border-slate-300 dark:border-zinc-700'>
                  <div className='grid grid-cols-[60px_12px_1fr] gap-y-1 font-medium min-w-[280px]'>
                    <span className='font-semibold'>Nama</span>
                    <span>:</span>
                    <span className='font-bold'>{employee.employeeName}</span>

                    <span className='font-semibold'>NIP</span>
                    <span>:</span>
                    <span className='font-mono'>{nipText}</span>

                    <span className='font-semibold'>Jabatan</span>
                    <span>:</span>
                    <span>{positionText}</span>
                  </div>

                  <div className='grid grid-cols-[60px_12px_1fr] gap-y-1 font-medium min-w-[280px]'>
                    <span className='font-semibold'>Periode</span>
                    <span>:</span>
                    <span className='font-semibold'>{periodLabel}</span>

                    <span className='font-semibold'>Lokasi</span>
                    <span>:</span>
                    <span>{locationText}</span>

                    <span className='font-semibold'>Project</span>
                    <span>:</span>
                    <span className='font-semibold'>{projectText}</span>
                  </div>
                </div>

                {/* ── Tabel Absensi Resmi Bergaris Solid ── */}
                <div className='overflow-x-auto w-full'>
                  <table className='w-full text-center text-[10px] print:text-[7pt] border-collapse border border-slate-900 dark:border-zinc-300 table-fixed leading-tight'>
                    <thead>
                      <tr className='bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold border-b border-slate-900 dark:border-zinc-300'>
                        <th
                          rowSpan={2}
                          className='border border-slate-900 dark:border-zinc-300 px-1 py-1 w-[4%] text-center'
                        >
                          No
                        </th>
                        <th
                          rowSpan={2}
                          className='border border-slate-900 dark:border-zinc-300 px-1 py-1 w-[9%] text-center'
                        >
                          Hari
                        </th>
                        <th
                          rowSpan={2}
                          className='border border-slate-900 dark:border-zinc-300 px-1 py-1 w-[5%] text-center'
                        >
                          Tgl
                        </th>
                        <th
                          colSpan={2}
                          className='border border-slate-900 dark:border-zinc-300 px-1 py-0.5 text-center w-[14%]'
                        >
                          Jam Kerja
                        </th>
                        <th
                          colSpan={2}
                          className='border border-slate-900 dark:border-zinc-300 px-1 py-0.5 text-center w-[14%]'
                        >
                          Jam Lembur
                        </th>
                        <th
                          rowSpan={2}
                          className='border border-slate-900 dark:border-zinc-300 px-1 py-1 w-[9%] text-center leading-tight'
                        >
                          Jumlah Jam Lembur
                        </th>
                        <th
                          rowSpan={2}
                          className='border border-slate-900 dark:border-zinc-300 px-1 py-1 w-[32%] text-center'
                        >
                          PEKERJAAN
                        </th>
                        <th
                          colSpan={2}
                          className='border border-slate-900 dark:border-zinc-300 px-1 py-0.5 text-center w-[13%]'
                        >
                          Paraf
                        </th>
                      </tr>
                      <tr className='bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold border-b border-slate-900 dark:border-zinc-300'>
                        <th className='border border-slate-900 dark:border-zinc-300 px-0.5 py-0.5 text-center w-[7%]'>
                          Mulai
                        </th>
                        <th className='border border-slate-900 dark:border-zinc-300 px-0.5 py-0.5 text-center w-[7%]'>
                          Selesai
                        </th>
                        <th className='border border-slate-900 dark:border-zinc-300 px-0.5 py-0.5 text-center w-[7%]'>
                          Mulai
                        </th>
                        <th className='border border-slate-900 dark:border-zinc-300 px-0.5 py-0.5 text-center w-[7%]'>
                          Selesai
                        </th>
                        <th className='border border-slate-900 dark:border-zinc-300 px-0.5 py-0.5 text-center w-[6.5%]'>
                          Karyawan
                        </th>
                        <th className='border border-slate-900 dark:border-zinc-300 px-0.5 py-0.5 text-center w-[6.5%]'>
                          Atasan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyItems.map((item) => {
                        const isSunday = item.isSunday
                        const isOff = item.workStart === 'OFF'
                        return (
                          <tr
                            key={item.dayNumber}
                            className={`border-b border-slate-900 dark:border-zinc-300 ${isOff
                                ? 'bg-slate-50/60 dark:bg-zinc-900/40'
                                : 'hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                              }`}
                          >
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 font-mono font-medium'>
                              {item.dayNumber}
                            </td>
                            <td
                              className={`border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 font-medium truncate ${isSunday
                                  ? 'text-red-600 font-bold dark:text-red-400'
                                  : 'text-slate-800 dark:text-zinc-200'
                                }`}
                            >
                              {item.dayName}
                            </td>
                            <td
                              className={`border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 font-mono ${isSunday
                                  ? 'text-red-600 font-bold dark:text-red-400'
                                  : 'text-slate-800 dark:text-zinc-200'
                                }`}
                            >
                              {item.dayNumber}
                            </td>
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 font-mono'>
                              {item.workStart}
                            </td>
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 font-mono'>
                              {item.workEnd}
                            </td>
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 font-mono'>
                              {item.overtimeStart}
                            </td>
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 font-mono'>
                              {item.overtimeEnd}
                            </td>
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 font-mono font-medium'>
                              {item.overtimeHoursText}
                            </td>
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-1 text-left font-medium text-[8.5px] print:text-[6.5pt] tracking-tight uppercase break-words whitespace-normal leading-tight'>
                              {item.taskDescription}
                            </td>
                            {/* Kolom Paraf Karyawan (Kosong untuk TTD fisik/basah jika dicetak) */}
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 h-6 print:h-5'></td>
                            {/* Kolom Paraf Atasan (Kosong untuk TTD fisik/basah jika dicetak) */}
                            <td className='border border-slate-900 dark:border-zinc-300 py-0.5 px-0.5 h-6 print:h-5'></td>
                          </tr>
                        )
                      })}

                      {/* ── BARIS TOTAL JUMLAH JAM KERJA & LEMBUR ── */}
                      <tr className='bg-slate-100 dark:bg-zinc-800 font-bold text-slate-900 dark:text-zinc-100 border-t-2 border-slate-900 dark:border-zinc-300'>
                        <td
                          colSpan={7}
                          className='border border-slate-900 dark:border-zinc-300 py-1.5 px-2 text-center uppercase tracking-wider text-[10px] print:text-[7pt]'
                        >
                          JUMLAH JAM KERJA & LEMBUR
                        </td>
                        <td className='border border-slate-900 dark:border-zinc-300 py-1.5 px-0.5 text-center font-black text-[10px] print:text-[7.5pt] text-blue-900 dark:text-blue-400'>
                          {totalOvertimeDisplay}
                        </td>
                        <td colSpan={3} className='border border-slate-900 dark:border-zinc-300 py-1.5 px-2'></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ── SECTION TANDA TANGAN & PENGESAHAN DIGITAL 3 KOLOM ── */}
                <div className='mt-6 pt-3 border-t border-slate-300 dark:border-zinc-700 print:mt-3 print:pt-2 print-avoid-break'>
                  <div className='text-left mb-3 print:mb-1.5'>
                    <p className='text-xs print:text-[8pt] font-semibold'>
                      {locationText}, {approvers.deptHead.signatureDate}
                    </p>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 print:gap-3 text-center text-xs print:text-[7.5pt]'>
                    {/* Kolom 1: Yang Mengajukan */}
                    <div className='flex flex-col items-center justify-between min-h-[130px] print:min-h-0'>
                      <p className='font-semibold text-muted-foreground'>Yang mengajukan,</p>
                      <div className='my-2 print:my-1'>
                        <EmployeeSubmittedBadge
                          employeeName={employee.employeeName}
                          employeeTitle={positionText}
                        />
                      </div>
                      <div>
                        <p className='font-bold underline text-sm print:text-xs'>{employee.employeeName}</p>
                        <p className='text-muted-foreground text-[11px] print:text-[7pt]'>{positionText}</p>
                      </div>
                    </div>

                    {/* Kolom 2: Mengetahui (Head Departemen) */}
                    <div className='flex flex-col items-center justify-between min-h-[130px] print:min-h-0'>
                      <p className='font-semibold text-muted-foreground'>Mengetahui,</p>
                      <div className='my-2 print:my-1'>
                        {isLevel1Approved ? (
                          <DigitalApprovalStamp
                            approverName={approvers.deptHead.name}
                            approverTitle={approvers.deptHead.title}
                            approvedAt={approvers.deptHead.signatureDate}
                            code={approvers.deptHead.approvalCode}
                          />
                        ) : (
                          <div className='w-full max-w-[200px] p-3 rounded-xl border border-dashed border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-center text-[10px] print:p-1'>
                            <p className='font-bold uppercase tracking-wider'>MENUNGGU PERSETUJUAN</p>
                            <p className='text-[9px] mt-0.5 text-muted-foreground'>Tahap 1: Head Departemen</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className='font-bold underline text-sm print:text-xs'>{approvers.deptHead.name}</p>
                        <p className='text-muted-foreground text-[11px] print:text-[7pt]'>{approvers.deptHead.title}</p>
                      </div>
                    </div>

                    {/* Kolom 3: Menyetujui (Head Divisi / Direktur) */}
                    <div className='flex flex-col items-center justify-between min-h-[130px] print:min-h-0'>
                      <p className='font-semibold text-muted-foreground'>Menyetujui,</p>
                      <div className='my-2 print:my-1'>
                        {isLevel2Approved ? (
                          <ClientApprovedBadge
                            approverName={approvers.divHead.name}
                            approverTitle={approvers.divHead.title}
                          />
                        ) : (
                          <div className='w-full max-w-[200px] p-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-muted/20 text-muted-foreground text-center text-[10px] print:p-1'>
                            <p className='font-bold uppercase tracking-wider'>MENUNGGU PERSETUJUAN</p>
                            <p className='text-[9px] mt-0.5'>Tahap 2: Head Divisi / Direktur</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className='font-bold underline text-sm print:text-xs'>{approvers.divHead.name}</p>
                        <p className='text-muted-foreground text-[11px] print:text-[7pt]'>{approvers.divHead.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* ══════════════════════════════════════════════════════════════════
                HALAMAN 2: SURAT PERINTAH KERJA LEMBUR (SPKL) SESUAI FORMAT PDF BFP
            ══════════════════════════════════════════════════════════════════ */}
            <div
              className={cn(
                'print-sheet print-page-break bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 p-6 sm:p-8 rounded-xl border border-border/70 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 space-y-6',
                activeTab === 'ALL' || activeTab === 'SPKL' ? 'block' : 'hidden print:block',
              )}
            >
              {overtimeOrders.length === 0 ? (
                <div className='p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl print:p-4'>
                  Tidak ada surat perintah lembur (SPKL) yang tercatat pada periode ini.
                </div>
              ) : (
                overtimeOrders.map((spkl) => (
                  <div key={spkl.id} className='space-y-0 print-avoid-break'>
                    {/* Kop Surat Header PT. Bintang Fajar Persada */}
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='size-6 rounded-md bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs'>
                        ★
                      </div>
                      <h2 className='text-xs font-black tracking-wider text-slate-800 dark:text-zinc-200 uppercase'>
                        PT. BINTANG FAJAR PERSADA
                      </h2>
                    </div>

                    {/* Header Judul Banner SPKL */}
                    <div className='bg-slate-200 dark:bg-zinc-800 border border-slate-900 dark:border-zinc-300 py-1 text-center font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100'>
                      SURAT PERINTAH KERJA LEMBUR
                    </div>

                    {/* Kotak Rincian Perintah Lembur */}
                    <div className='border-x border-b border-slate-900 dark:border-zinc-300 text-xs'>
                      <div className='bg-slate-100 dark:bg-zinc-800/60 p-1 px-2 font-bold border-b border-slate-900 dark:border-zinc-300 text-[11px] print:text-[8pt]'>
                        Memberikan perintah lembur kepada:
                      </div>
                      <div className='p-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] print:text-[8pt] leading-tight'>
                        <div className='space-y-1'>
                          <div className='flex'>
                            <span className='w-28 font-medium'>Nama karyawan</span>
                            <span>: {employee.employeeName}</span>
                          </div>
                          <div className='flex'>
                            <span className='w-28 font-medium'>NIP</span>
                            <span className='font-mono'>: {nipText}</span>
                          </div>
                          <div className='flex'>
                            <span className='w-28 font-medium'>Jabatan</span>
                            <span>: {positionText}</span>
                          </div>
                          <div className='flex'>
                            <span className='w-28 font-medium'>Lokasi lembur</span>
                            <span>: {locationText}</span>
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-3'>
                            <span className='w-24 font-medium'>Lembur pada</span>
                            <div className='flex items-center gap-4 text-[10px] print:text-[7.5pt]'>
                              <label className='flex items-center gap-1 cursor-pointer'>
                                <input type='checkbox' readOnly checked={!spkl.isHoliday} className='size-3 rounded' />
                                <span>Hari kerja</span>
                              </label>
                              <label className='flex items-center gap-1 cursor-pointer'>
                                <input type='checkbox' readOnly checked={spkl.isHoliday} className='size-3 rounded accent-blue-600' />
                                <span className={cn(spkl.isHoliday && 'font-bold text-blue-700 dark:text-blue-400')}>Hari libur</span>
                              </label>
                            </div>
                          </div>
                          <div className='flex'>
                            <span className='w-24 font-medium'>Periode lembur</span>
                            <span>: {periodLabel}</span>
                          </div>
                          <div className='flex'>
                            <span className='w-24 font-medium'>Keterangan</span>
                            <span className='font-bold text-slate-900 dark:text-zinc-100'>: {spkl.eventDescription}</span>
                          </div>
                        </div>
                      </div>

                      {/* Uraian Tugas Kerja Lembur */}
                      <div className='p-1.5 px-2 bg-slate-50 dark:bg-zinc-900 border-t border-slate-900 dark:border-zinc-300 text-[11px] print:text-[8pt] font-medium'>
                        <strong>Uraian Tugas Kerja Lembur :</strong>{' '}
                        <span className='uppercase font-semibold'>{spkl.taskDescription}</span>
                      </div>

                      {/* Tabel 4 Sub-Kolom Jam Lembur & Paraf */}
                      <table className='w-full text-center text-[10px] print:text-[7pt] border-collapse border-t border-slate-900 dark:border-zinc-300 table-fixed'>
                        <thead>
                          <tr className='bg-slate-200 dark:bg-zinc-800 font-bold'>
                            <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-[5%]'>No</th>
                            <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-[15%]'>Tanggal lembur</th>
                            <th colSpan={4} className='border-r border-b border-slate-900 dark:border-zinc-300 p-0.5 w-[44%]'>Jam lembur</th>
                            <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-[16%]'>Total Jam Lembur</th>
                            <th colSpan={2} className='border-b border-slate-900 dark:border-zinc-300 p-0.5 w-[20%]'>Paraf</th>
                          </tr>
                          <tr className='bg-slate-200 dark:bg-zinc-800 font-bold'>
                            <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-0.5 w-[11%]'>Mulai</th>
                            <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-0.5 w-[11%]'>Selesai</th>
                            <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-0.5 w-[11%]'>Mulai</th>
                            <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-0.5 w-[11%]'>Selesai</th>
                            <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-0.5 w-[10%]'>Karyawan</th>
                            <th className='border-b border-slate-900 dark:border-zinc-300 p-0.5 w-[10%]'>Atasan</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-mono'>1</td>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-mono'>{spkl.date}</td>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-mono'>{spkl.startTime}</td>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-mono'>{spkl.endTime}</td>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-mono'>{spkl.actualStartTime || spkl.startTime}</td>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-mono'>{spkl.actualEndTime || spkl.endTime}</td>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-mono font-bold'>{spkl.totalHours} Jam</td>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 h-6'></td>
                            <td className='border-b border-slate-900 dark:border-zinc-300 p-1 h-6'></td>
                          </tr>
                          <tr className='font-bold bg-slate-100 dark:bg-zinc-900'>
                            <td colSpan={6} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 text-center uppercase tracking-wider text-[9px] print:text-[6.5pt]'>
                              TOTAL JAM LEMBUR
                            </td>
                            <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-black text-slate-900 dark:text-zinc-100 text-[10px] print:text-[7pt]'>
                              {spkl.totalHours} Jam
                            </td>
                            <td colSpan={2} className='border-b border-slate-900 dark:border-zinc-300 p-1'></td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Kotak Pengesahan SPKL 2 Kolom */}
                      <div className='grid grid-cols-2 divide-x divide-slate-900 dark:divide-zinc-300 border-b border-slate-900 dark:border-zinc-300 text-center'>
                        <div className='p-2 flex flex-col justify-between min-h-[85px] print:min-h-0'>
                          <p className='text-[10px] print:text-[7pt] font-semibold text-muted-foreground'>Dibuat oleh:</p>
                          <div className='my-1'>
                            <span className='font-script text-base print:text-xs text-slate-700 italic'>{employee.employeeName}</span>
                          </div>
                          <div>
                            <p className='font-bold underline text-[11px] print:text-[7.5pt]'>{employee.employeeName}</p>
                            <p className='text-muted-foreground text-[10px] print:text-[6.5pt]'>{positionText}</p>
                          </div>
                        </div>
                        <div className='p-2 flex flex-col justify-between min-h-[85px] print:min-h-0'>
                          <p className='text-[10px] print:text-[7pt] font-semibold text-muted-foreground'>Diterima oleh:</p>
                          <div className='my-1'>
                            {isLevel1Approved ? (
                              <span className='font-bold text-[9px] print:text-[7pt] text-emerald-700 border border-emerald-400 bg-emerald-50 px-2 py-0.5 rounded'>
                                ✓ ACC DIGITAL: {approvers.deptHead.name.split(',')[0]}
                              </span>
                            ) : (
                              <span className='text-[9px] print:text-[7pt] text-muted-foreground italic'>(Menunggu ACC)</span>
                            )}
                          </div>
                          <div>
                            <p className='font-bold underline text-[11px] print:text-[7.5pt]'>{approvers.deptHead.name}</p>
                            <p className='text-muted-foreground text-[10px] print:text-[6.5pt]'>{approvers.deptHead.title}</p>
                          </div>
                        </div>
                      </div>

                      {/* Catatan Kaki SPKL */}
                      <div className='p-1.5 px-2 bg-slate-50 dark:bg-zinc-900 text-[9px] print:text-[6.5pt] text-slate-600 dark:text-zinc-400 space-y-0.5'>
                        <p>* Surat Perintah Kerja Lembur (SPKL) harus di paraf dan di tanda tangan oleh karyawan dan user</p>
                        <p>* Surat Perintah Kerja Lembur (SPKL) harus diserahkan paling lambat tanggal 10 setiap bulannya</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                HALAMAN 3: SICK LEAVE & VERIFIKASI SURAT DOKTER
            ══════════════════════════════════════════════════════════════════ */}
            <div
              className={cn(
                'print-sheet print-page-break bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 p-6 sm:p-8 rounded-xl border border-border/70 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 space-y-6',
                activeTab === 'ALL' || activeTab === 'SICK_LEAVE' ? 'block' : 'hidden print:block',
              )}
            >
              <div className='flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-zinc-100'>
                <div className='flex items-center gap-2.5'>
                  <IconHeartbeat className='size-6 text-rose-600' />
                  <div>
                    <h2 className='text-lg font-black uppercase text-blue-950 dark:text-blue-400 leading-none'>
                      FORMULIR VERIFIKASI SICK LEAVE (IZIN SAKIT)
                    </h2>
                    <p className='text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider'>
                      PT. BINTANG FAJAR PERSADA · REKAP KESEHATAN KERJA & DISPENSASI MEDIS
                    </p>
                  </div>
                </div>
                <Badge variant='outline' className='bg-emerald-50 text-emerald-700 border-emerald-300 font-mono text-[10px] font-bold'>
                  STATUS: APPROVED
                </Badge>
              </div>

              {sickLeaveRecord && (
                <div className='border border-slate-900 dark:border-zinc-300 rounded-lg p-5 print:p-3 space-y-4 print:space-y-2 text-xs bg-slate-50/40 dark:bg-zinc-900/30 print-avoid-break'>
                  <div className='flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 dark:border-zinc-700 pb-3 print:pb-1.5'>
                    <div>
                      <span className='font-mono text-xs print:text-[8pt] font-bold text-primary'>{sickLeaveRecord.leaveNumber}</span>
                      <h4 className='font-bold text-sm print:text-xs text-foreground mt-0.5'>{sickLeaveRecord.reason}</h4>
                    </div>
                    <Badge variant='outline' className='bg-emerald-100 text-emerald-800 border-emerald-300 text-xs print:text-[8pt] font-bold px-3 py-1'>
                      ✓ Disetujui Head Departemen ({sickLeaveRecord.approvedBy})
                    </Badge>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-2 text-xs print:text-[8pt]'>
                    <div className='space-y-1.5 print:space-y-0.5'>
                      <div className='flex'><span className='w-32 font-semibold text-muted-foreground'>Nama Karyawan</span><span className='font-bold text-foreground'>: {employee.employeeName}</span></div>
                      <div className='flex'><span className='w-32 font-semibold text-muted-foreground'>NIP / Jabatan</span><span>: {nipText} / {positionText}</span></div>
                      <div className='flex'><span className='w-32 font-semibold text-muted-foreground'>Unit / Departemen</span><span>: {employee.department}</span></div>
                      <div className='flex'><span className='w-32 font-semibold text-muted-foreground'>Lokasi & Proyek</span><span>: {locationText} ({projectText})</span></div>
                    </div>

                    <div className='space-y-1.5 print:space-y-0.5'>
                      <div className='flex'><span className='w-32 font-semibold text-muted-foreground'>Periode Sakit</span><span className='font-semibold'>: {sickLeaveRecord.startDate} s.d. {sickLeaveRecord.endDate}</span></div>
                      <div className='flex'><span className='w-32 font-semibold text-muted-foreground'>Jumlah Hari</span><span className='font-bold text-rose-600'>: {sickLeaveRecord.totalDays} Hari</span></div>
                      <div className='flex'><span className='w-32 font-semibold text-muted-foreground'>Diagnosa Dokter</span><span className='font-medium italic'>: {sickLeaveRecord.diagnosis}</span></div>
                      <div className='flex'><span className='w-32 font-semibold text-muted-foreground'>Fasilitas Kesehatan</span><span>: {sickLeaveRecord.clinicOrHospital}</span></div>
                    </div>
                  </div>

                  <div className='p-3 print:p-2 bg-white dark:bg-zinc-950 rounded border border-slate-200 dark:border-zinc-800 text-[11px] print:text-[7.5pt] flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <IconFileCertificate className='size-5 text-emerald-600 shrink-0' />
                      <div>
                        <p className='font-bold'>Surat Keterangan Dokter (SKD) Terverifikasi</p>
                        <p className='text-muted-foreground text-[10px] print:text-[7pt]'>Pemeriksa: {sickLeaveRecord.doctorName} · Dokumen sah tersimpan di arsip medik HRIS</p>
                      </div>
                    </div>
                    <span className='font-mono font-bold text-emerald-600 text-xs print:text-[8pt]'>VALID & ACC</span>
                  </div>

                  {/* Pengesahan Sick Leave */}
                  <div className='grid grid-cols-2 pt-3 print:pt-2 border-t border-slate-200 dark:border-zinc-800 text-center gap-4'>
                    <div className='flex flex-col items-center justify-between min-h-[75px] print:min-h-0'>
                      <p className='font-semibold text-muted-foreground'>Karyawan Bersangkutan:</p>
                      <p className='font-bold underline'>{employee.employeeName}</p>
                      <p className='text-muted-foreground text-[10px] print:text-[7pt]'>{positionText}</p>
                    </div>

                    <div className='flex flex-col items-center justify-between min-h-[75px] print:min-h-0'>
                      <p className='font-semibold text-muted-foreground'>Disetujui Head Departemen & HRD:</p>
                      {isLevel1Approved ? (
                        <DigitalApprovalStamp
                          approverName={approvers.deptHead.name}
                          approverTitle={approvers.deptHead.title}
                          approvedAt={sickLeaveRecord.approvedAt || '01 Sep 2026'}
                          code={approvers.deptHead.approvalCode}
                        />
                      ) : (
                        <div className='p-2 rounded border border-dashed border-amber-300 bg-amber-50/50 text-[9px] text-amber-700 font-semibold'>
                          Menunggu Persetujuan Head Dept ({approvers.deptHead.name})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
