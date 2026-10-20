import {
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconClockHour4,
  IconEye,
  IconFileSpreadsheet,
  IconFileText,
  IconPercentage,
  IconUserCheck,
  IconUserX,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { mockAttendanceData } from '../data/mock-report-data'
import { ReportFilterBar } from './report-filter-bar'
import type { AttendanceReportRow, ReportFilterCriteria, TimesheetStatus } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { cn } from '@/shared/lib/utils'
import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import { EmployeeAttendanceDetailDialog } from './employee-attendance-detail-dialog'

export function AttendanceReportTab() {
  const { timesheets } = useApprovalSyncStore()

  const [filters, setFilters] = useState<ReportFilterCriteria>({
    datePreset: 'this_month',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    department: 'all',
    searchQuery: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] =
    useState<AttendanceReportRow | null>(null)

  const getTimesheetStatusForEmployee = (row: AttendanceReportRow) => {
    const ts = timesheets.find(
      (t) =>
        t.id === `req-ts-${row.id}` ||
        t.id.endsWith(row.id) ||
        t.employeeName.toLowerCase() === row.employeeName.toLowerCase(),
    )

    if (!ts) {
      return {
        status: (row.timesheetStatus || 'PENDING_DEPT_HEAD') as TimesheetStatus,
        label: 'Menunggu Head Dept',
        level: 'Tahap 1/2',
        color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400',
        isApproved: false,
      }
    }

    if (ts.status === 'approved') {
      return {
        status: 'APPROVED' as TimesheetStatus,
        label: 'Disetujui Penuh',
        level: 'Selesai 2/2',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400',
        isApproved: true,
      }
    }

    if (ts.status === 'rejected') {
      return {
        status: 'REJECTED' as TimesheetStatus,
        label: 'Ditolak',
        level: 'Ditolak',
        color: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400',
        isApproved: false,
      }
    }

    if (ts.currentLevel === 2) {
      return {
        status: 'PENDING_DIV_HEAD' as TimesheetStatus,
        label: 'Menunggu Head Divisi',
        level: 'Tahap 2/2',
        color: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400',
        isApproved: false,
      }
    }

    return {
      status: 'PENDING_DEPT_HEAD' as TimesheetStatus,
      label: 'Menunggu Head Dept',
      level: 'Tahap 1/2',
      color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400',
      isApproved: false,
    }
  }

  const filteredData = useMemo(() => {
    return mockAttendanceData.map((item) => {
      const tsInfo = getTimesheetStatusForEmployee(item)
      return {
        ...item,
        timesheetStatus: tsInfo.status,
      }
    }).filter((item) => {
      // Date filter
      if (filters.startDate && item.date < filters.startDate) return false
      if (filters.endDate && item.date > filters.endDate) return false

      // Department filter
      if (
        filters.department !== 'all' &&
        item.department.toLowerCase() !== filters.department.toLowerCase()
      ) {
        return false
      }

      // Search filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase()
        return (
          item.employeeName.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.date.includes(q)
        )
      }
      return true
    })
  }, [filters, timesheets])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const handleReset = () => {
    setFilters({
      datePreset: 'this_month',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      department: 'all',
      searchQuery: '',
    })
    setCurrentPage(1)
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Metric Cards ────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Tingkat Kehadiran</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>94.2%</h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>+1.4% vs bulan lalu</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconPercentage size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Kehadiran</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>1,180</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Hari kerja normal</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconUserCheck size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Terlambat</p>
            <h3 className='text-2xl font-black text-amber-600 mt-0.5'>98</h3>
            <p className='text-[10px] text-amber-600 font-semibold mt-0.5'>Perlu tindak lanjut</p>
          </div>
          <div className='size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconClockHour4 size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Mangkir / Alpha</p>
            <h3 className='text-2xl font-black text-rose-600 mt-0.5'>20</h3>
            <p className='text-[10px] text-rose-600 font-semibold mt-0.5'>-5 kasus vs bulan lalu</p>
          </div>
          <div className='size-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0'>
            <IconUserX size={22} />
          </div>
        </div>
      </div>

      {/* ── Filter Bar with Date Inputs ──────────────────────────────────── */}
      <ReportFilterBar
        reportTitle='Attendance Report'
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        searchPlaceholder='Cari nama karyawan atau tanggal...'
        exportHeaders={[
          'NO',
          'TANGGAL',
          'NAMA KARYAWAN',
          'DEPARTEMEN',
          'HARI KERJA',
          'HADIR',
          'TERLAMBAT',
          'ALPHA',
          'CUTI/IZIN',
          'TINGKAT HADIR',
          'JAM LEMBUR',
          'STATUS TIMESHEET',
        ]}
        exportRows={filteredData.map((row, i) => {
          const tsInfo = getTimesheetStatusForEmployee(row)
          return [
            i + 1,
            row.date,
            row.employeeName,
            row.department,
            `${row.workDays} hari`,
            row.presentDays,
            row.lateDays,
            row.absentDays,
            row.leaveDays,
            `${row.attendanceRate}%`,
            `${row.overtimeHours} jam`,
            tsInfo.label,
          ]
        })}
      />

      {/* ── Detailed Table ──────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-4 border-b border-border/80 flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Rincian Presensi & Kehadiran Pegawai</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Menampilkan {filteredData.length} data presensi beserta status pengesahan timesheet
            </p>
          </div>
        </div>

        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full text-left text-xs min-w-[1250px] border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold'>
                <th className='py-3.5 px-3 text-center whitespace-nowrap w-12'>NO</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>TANGGAL</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>NAMA KARYAWAN</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>DEPARTEMEN</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>HARI KERJA</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>HADIR</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TERLAMBAT</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>ALPHA</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>CUTI/IZIN</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TINGKAT HADIR</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>JAM LEMBUR</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>STATUS TIMESHEET</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>FORM ABSENSI</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={13} className='text-center py-12 text-muted-foreground italic text-xs'>
                    Tidak ada data presensi yang sesuai dengan rentang tanggal dan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const tsInfo = getTimesheetStatusForEmployee(row)

                  return (
                    <tr key={row.id} className='hover:bg-muted/20 transition-colors'>
                      <td className='py-3.5 px-3 text-center font-mono font-medium text-muted-foreground whitespace-nowrap'>
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className='py-3.5 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap'>
                        <div className='flex items-center gap-1.5'>
                          <IconCalendar size={13} className='text-primary' />
                          <span className='font-semibold text-foreground'>{row.date}</span>
                        </div>
                      </td>
                      <td className='py-3.5 px-4 font-bold text-foreground whitespace-nowrap'>
                        <button
                          type='button'
                          onClick={() => setSelectedEmployeeForDetail(row)}
                          className='flex items-center gap-2 text-left hover:text-primary transition-colors cursor-pointer group'
                        >
                          <div className='size-7 rounded-lg bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                            {row.employeeName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className='min-w-0'>
                            <span className='group-hover:underline block leading-tight'>{row.employeeName}</span>
                            {row.employeeCode && (
                              <span className='font-mono text-[10px] text-muted-foreground font-normal'>
                                {row.employeeCode}
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className='py-3.5 px-4 text-muted-foreground whitespace-nowrap'>
                        {row.department}
                      </td>
                      <td className='py-3.5 px-4 text-center font-mono font-medium'>{row.workDays} hari</td>
                      <td className='py-3.5 px-4 text-center font-mono font-bold text-emerald-600'>
                        {row.presentDays}
                      </td>
                      <td className='py-3.5 px-4 text-center font-mono font-medium text-amber-600'>
                        {row.lateDays}
                      </td>
                      <td className='py-3.5 px-4 text-center font-mono font-medium text-rose-600'>
                        {row.absentDays}
                      </td>
                      <td className='py-3.5 px-4 text-center font-mono font-medium text-muted-foreground'>
                        {row.leaveDays}
                      </td>
                      <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                        <Badge
                          variant='outline'
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                            row.attendanceRate >= 95
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : row.attendanceRate >= 90
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {row.attendanceRate}%
                        </Badge>
                      </td>
                      <td className='py-3.5 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap'>
                        {row.overtimeHours > 0 ? `${row.overtimeHours} jam` : '-'}
                      </td>
                      <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                        <Badge
                          variant='outline'
                          className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold gap-1', tsInfo.color)}
                        >
                          {tsInfo.isApproved && <IconCheck size={11} className='stroke-3' />}
                          <span>{tsInfo.label}</span>
                          <span className='opacity-70 font-mono text-[9px]'>({tsInfo.level})</span>
                        </Badge>
                      </td>
                      <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => setSelectedEmployeeForDetail(row)}
                          className='h-7.5 px-2.5 text-xs font-semibold gap-1.5 hover:bg-primary hover:text-primary-foreground border-primary/30 text-primary transition-colors'
                          title={`Lihat Form Absensi Resmi ${row.employeeName}`}
                        >
                          <IconFileText size={14} />
                          <span>Detail & Unduh</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          itemLabel='data presensi'
          totalItems={filteredData.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* ── Detail Form Absensi Karyawan Modal (Format Resmi BFP) ── */}
      <EmployeeAttendanceDetailDialog
        open={!!selectedEmployeeForDetail}
        onOpenChange={(open) => !open && setSelectedEmployeeForDetail(null)}
        employee={selectedEmployeeForDetail}
        periodLabel={`${filters.startDate || '01-08-2026'} s.d. ${filters.endDate || '31-08-2026'}`}
        yearMonth={filters.startDate ? filters.startDate.slice(0, 7) : '2026-08'}
      />
    </div>
  )
}
