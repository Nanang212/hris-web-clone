import {
  IconCalendar,
  IconClock2,
  IconClockPlay,
  IconCoins,
  IconUserCheck,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { mockOvertimeData } from '../data/mock-report-data'
import { ReportFilterBar } from './report-filter-bar'
import type { OvertimeReportRow, ReportFilterCriteria } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { TablePagination } from '@/shared/components/ui/table-pagination'

export function OvertimeReportTab() {
  const [filters, setFilters] = useState<ReportFilterCriteria>({
    datePreset: 'this_month',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    department: 'all',
    searchQuery: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const filteredData = useMemo(() => {
    return mockOvertimeData.filter((item) => {
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
          item.position.toLowerCase().includes(q) ||
          item.date.includes(q)
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
            <p className='text-xs font-semibold text-muted-foreground'>Total Jam Lembur</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>4,584 jam</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Bulan berjalan</p>
          </div>
          <div className='size-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center shrink-0'>
            <IconClock2 size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Biaya Kompensasi</p>
            <h3 className='text-2xl font-black text-foreground font-mono mt-0.5'>Rp 412 Jt</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Sudah termasuk pajak</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCoins size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Karyawan Lembur</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>235</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>18.8% dari total karyawan</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconUserCheck size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Rata-rata / Orang</p>
            <h3 className='text-2xl font-black text-indigo-600 mt-0.5'>19.5 jam</h3>
            <p className='text-[10px] text-indigo-600 font-semibold mt-0.5'>Sesuai regulasi Depnaker</p>
          </div>
          <div className='size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0'>
            <IconClockPlay size={22} />
          </div>
        </div>
      </div>

      {/* ── Filter Bar with Date Inputs ──────────────────────────────────── */}
      <ReportFilterBar
        reportTitle='Overtime Report'
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        searchPlaceholder='Cari nama karyawan, jabatan, atau tanggal...'
        exportHeaders={[
          'NO',
          'TANGGAL LEMBUR',
          'NAMA KARYAWAN',
          'JABATAN',
          'DEPARTEMEN',
          'WEEKDAY',
          'WEEKEND',
          'TOTAL JAM',
          'TARIF / JAM',
          'TOTAL KOMPENSASI',
          'STATUS APPROVAL',
        ]}
        exportRows={filteredData.map((row, i) => [
          i + 1,
          row.date,
          row.employeeName,
          row.position,
          row.department,
          `${row.weekdayHours} jam`,
          `${row.weekendHours} jam`,
          `${row.totalHours} jam`,
          formatIdr(row.ratePerHour),
          formatIdr(row.compensationAmount),
          `${row.approvedRequestsCount} Disetujui`,
        ])}
      />

      {/* ── Detailed Table ──────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-4 border-b border-border/80 flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Rekapitulasi Jam Kerja Lembur & Upah</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Menampilkan rincian alokasi jam lembur weekday vs weekend dan total upah lembur sesuai rentang tanggal
            </p>
          </div>
        </div>

        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full text-left text-xs min-w-[1050px] border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold'>
                <th className='py-3.5 px-3 text-center whitespace-nowrap w-12'>NO</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>TANGGAL LEMBUR</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>NAMA KARYAWAN</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>DEPARTEMEN</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>WEEKDAY (HARI KERJA)</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>WEEKEND (AKHIR PEKAN)</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TOTAL JAM</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>TARIF / JAM</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>KOMPENSASI</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>STATUS APPROVAL</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className='text-center py-12 text-muted-foreground italic text-xs'>
                    Tidak ada data lembur yang sesuai dengan rentang tanggal dan kriteria filter.
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
                        <span className='font-semibold text-foreground'>{row.date}</span>
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
                    <td className='py-3.5 px-4 text-center font-mono font-medium'>{row.weekdayHours} jam</td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium text-amber-600'>
                      {row.weekendHours} jam
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-bold text-foreground'>
                      {row.totalHours} jam
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono text-muted-foreground whitespace-nowrap'>
                      {formatIdr(row.ratePerHour)}
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap'>
                      {formatIdr(row.compensationAmount)}
                    </td>
                    <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                      <Badge
                        variant='outline'
                        className='rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap'
                      >
                        {row.approvedRequestsCount} Pengajuan Disetujui
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          itemLabel='data lembur'
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
