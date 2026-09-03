import {
  IconBriefcase,
  IconCalendar,
  IconChartPie,
  IconTrendingDown,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { mockEmployeeData } from '../data/mock-report-data'
import { ReportFilterBar } from './report-filter-bar'
import type { EmployeeReportRow, ReportFilterCriteria } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { TablePagination } from '@/shared/components/ui/table-pagination'

export function EmployeeReportTab() {
  const [filters, setFilters] = useState<ReportFilterCriteria>({
    datePreset: 'this_month',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    department: 'all',
    searchQuery: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const filteredData = useMemo(() => {
    return mockEmployeeData.filter((item) => {
      // Date filter
      if (filters.startDate && item.periodDate < filters.startDate) return false
      if (filters.endDate && item.periodDate > filters.endDate) return false

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
        return item.department.toLowerCase().includes(q)
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
            <p className='text-xs font-semibold text-muted-foreground'>Total Karyawan Aktif</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>1,246</h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>+38 karyawan baru Q3</p>
          </div>
          <div className='size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0'>
            <IconUsers size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Karyawan Tetap (PKWTT)</p>
            <h3 className='text-2xl font-black text-foreground mt-0.5'>842</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>67.5% dari total headcount</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconUserCheck size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Kontrak & Probasi</p>
            <h3 className='text-2xl font-black text-amber-600 mt-0.5'>404</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>348 PKWT, 56 Probasi</p>
          </div>
          <div className='size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconBriefcase size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Rasio Turnover</p>
            <h3 className='text-2xl font-black text-emerald-600 mt-0.5'>2.4%</h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>Sangat sehat (&lt; 5%)</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconTrendingDown size={22} />
          </div>
        </div>
      </div>

      {/* ── Filter Bar with Date Inputs ──────────────────────────────────── */}
      <ReportFilterBar
        reportTitle='Employee Demographics Report'
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        searchPlaceholder='Cari departemen...'
        exportHeaders={[
          'NO',
          'PERIODE DATA',
          'DEPARTEMEN',
          'TOTAL HEADCOUNT',
          'TETAP (PKWTT)',
          'KONTRAK (PKWT)',
          'PROBASI',
          'PRIA',
          'WANITA',
          'MASA KERJA',
          'TURNOVER',
        ]}
        exportRows={filteredData.map((row, i) => [
          i + 1,
          row.periodDate,
          row.department,
          `${row.totalHeadcount} org`,
          row.permanentCount,
          row.contractCount,
          row.probationCount,
          row.maleCount,
          row.femaleCount,
          `${row.avgTenureYears} tahun`,
          `${row.turnoverRate}%`,
        ])}
      />

      {/* ── Detailed Table ──────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-4 border-b border-border/80 flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Distribusi Headcount & Demografi Karyawan</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Menampilkan data komposisi status kepegawaian dan masa kerja per departemen
            </p>
          </div>
        </div>

        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full text-left text-xs min-w-[1050px] border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold'>
                <th className='py-3.5 px-3 text-center whitespace-nowrap w-12'>NO</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>PERIODE DATA</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>DEPARTEMEN</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TOTAL HEADCOUNT</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TETAP (PKWTT)</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>KONTRAK (PKWT)</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>PROBASI</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>KOMPOSISI GENDER</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>RATA-RATA MASA KERJA</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TURNOVER</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className='text-center py-12 text-muted-foreground italic text-xs'>
                    Tidak ada data karyawan yang sesuai dengan rentang tanggal dan kriteria filter.
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
                        <span className='font-semibold text-foreground'>{row.periodDate}</span>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 font-bold text-foreground whitespace-nowrap'>
                      {row.department}
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-bold text-foreground'>
                      {row.totalHeadcount} org
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium text-emerald-600'>
                      {row.permanentCount}
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium text-amber-600'>
                      {row.contractCount}
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium text-muted-foreground'>
                      {row.probationCount}
                    </td>
                    <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                      <div className='flex items-center justify-center gap-1.5 font-mono text-[11px]'>
                        <span className='text-blue-600 font-semibold'>{row.maleCount} ♂</span>
                        <span className='text-muted-foreground'>/</span>
                        <span className='text-rose-500 font-semibold'>{row.femaleCount} ♀</span>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium whitespace-nowrap'>
                      {row.avgTenureYears} tahun
                    </td>
                    <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                      <Badge
                        variant='outline'
                        className='rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap'
                      >
                        {row.turnoverRate}%
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
          itemLabel='departemen'
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
