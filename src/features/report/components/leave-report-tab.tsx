import {
  IconCalendar,
  IconCalendarEvent,
  IconCalendarStats,
  IconCheckupList,
  IconClockPlay,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { mockLeaveData } from '../data/mock-report-data'
import { ReportFilterBar } from './report-filter-bar'
import type { LeaveReportRow, ReportFilterCriteria } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { TablePagination } from '@/shared/components/ui/table-pagination'

export function LeaveReportTab() {
  const [filters, setFilters] = useState<ReportFilterCriteria>({
    datePreset: 'this_year',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    department: 'all',
    searchQuery: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const filteredData = useMemo(() => {
    return mockLeaveData.filter((item) => {
      // Date filter
      if (filters.startDate && item.endDate < filters.startDate) return false
      if (filters.endDate && item.startDate > filters.endDate) return false

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
          item.position.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.dateRange.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filters])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const handleReset = () => {
    setFilters({
      datePreset: 'this_year',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
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
            <p className='text-xs font-semibold text-muted-foreground'>Total Pengajuan Cuti</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>1,284</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Tahun 2026 berjalan</p>
          </div>
          <div className='size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconCalendarEvent size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Hari Diambil</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>3,420 hari</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Rata-rata 2.7 hari/cuti</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconCalendarStats size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Sedang Cuti Hari Ini</p>
            <h3 className='text-2xl font-black text-indigo-600 mt-0.5'>17</h3>
            <p className='text-[10px] text-indigo-600 font-semibold mt-0.5'>Karyawan cuti aktif</p>
          </div>
          <div className='size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0'>
            <IconClockPlay size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Tingkat Persetujuan</p>
            <h3 className='text-2xl font-black text-emerald-600 mt-0.5'>98.4%</h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>Alur persetujuan cepat</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCheckupList size={22} />
          </div>
        </div>
      </div>

      {/* ── Filter Bar with Date Inputs ──────────────────────────────────── */}
      <ReportFilterBar
        reportTitle='Leave Report'
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        searchPlaceholder='Cari nama pegawai, jabatan, atau tanggal...'
        exportHeaders={[
          'NO',
          'PERIODE CUTI',
          'NAMA KARYAWAN',
          'JABATAN',
          'DEPARTEMEN',
          'CUTI TAHUNAN',
          'CUTI SAKIT',
          'IZIN KHUSUS',
          'TOTAL DIPAKAI',
          'SISA SALDO',
          'APPROVAL',
        ]}
        exportRows={filteredData.map((row, i) => [
          i + 1,
          row.dateRange,
          row.employeeName,
          row.position,
          row.department,
          `${row.annualLeaveUsed} hari`,
          `${row.sickLeaveUsed} hari`,
          `${row.specialLeaveUsed} hari`,
          `${row.totalDaysUsed} hari`,
          `${row.remainingBalance} hari`,
          `${row.approvalRate}%`,
        ])}
      />

      {/* ── Detailed Table ──────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-4 border-b border-border/80 flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Laporan Penggunaan Hak Cuti Pegawai</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Menampilkan {filteredData.length} data pemanfaatan kuota cuti sesuai rentang tanggal
            </p>
          </div>
        </div>

        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full text-left text-xs min-w-[1050px] border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold'>
                <th className='py-3.5 px-3 text-center whitespace-nowrap w-12'>NO</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>PERIODE CUTI</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>NAMA KARYAWAN</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>DEPARTEMEN</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>CUTI TAHUNAN</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>CUTI SAKIT</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>IZIN KHUSUS</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TOTAL DIPAKAI</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>SISA SALDO</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TINGKAT APPROVAL</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className='text-center py-12 text-muted-foreground italic text-xs'>
                    Tidak ada data cuti yang sesuai dengan rentang tanggal dan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={row.id} className='hover:bg-muted/20 transition-colors'>
                    <td className='py-3.5 px-3 text-center font-mono font-medium text-muted-foreground whitespace-nowrap'>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className='py-3.5 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap'>
                      <div className='flex items-center gap-1.5'>
                        <IconCalendar size={13} className='text-primary' />
                        <span className='font-semibold text-foreground'>{row.dateRange}</span>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 font-bold text-foreground whitespace-nowrap'>
                      <div>
                        <p>{row.employeeName}</p>
                        <span className='text-[10px] text-muted-foreground font-normal'>
                          {row.position}
                        </span>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 text-muted-foreground whitespace-nowrap'>
                      {row.department}
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium'>{row.annualLeaveUsed} hari</td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium text-amber-600'>
                      {row.sickLeaveUsed} hari
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium text-blue-600'>
                      {row.specialLeaveUsed} hari
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-bold text-foreground'>
                      {row.totalDaysUsed} hari
                    </td>
                    <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                      <Badge
                        variant='outline'
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                          row.remainingBalance >= 6
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {row.remainingBalance} hari tersisa
                      </Badge>
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-bold text-emerald-600 whitespace-nowrap'>
                      {row.approvalRate}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          itemLabel='data cuti'
          totalItems={filteredData.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>
    </div>
  )
}
