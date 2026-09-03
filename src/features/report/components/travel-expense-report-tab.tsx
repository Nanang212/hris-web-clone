import {
  IconCalendar,
  IconCheck,
  IconCoin,
  IconPlaneDeparture,
  IconReceiptTax,
  IconTrendingDown,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { mockTravelExpenseData } from '../data/mock-report-data'
import { ReportFilterBar } from './report-filter-bar'
import type { ReportFilterCriteria, TravelExpenseReportRow } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { TablePagination } from '@/shared/components/ui/table-pagination'

export function TravelExpenseReportTab() {
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
    return mockTravelExpenseData.filter((item) => {
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
        return (
          item.department.toLowerCase().includes(q) ||
          item.costCenter.toLowerCase().includes(q) ||
          item.periodDate.includes(q)
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
            <p className='text-xs font-semibold text-muted-foreground'>Total Klaim & Reimbursement</p>
            <h3 className='text-2xl font-black text-foreground font-mono mt-0.5'>Rp 184.5 Jt</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>178 pengajuan klaim</p>
          </div>
          <div className='size-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0'>
            <IconReceiptTax size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Anggaran Dinas (SPPD)</p>
            <h3 className='text-2xl font-black text-foreground font-mono mt-0.5'>Rp 342.0 Jt</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>44 perjalanan disetujui</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconPlaneDeparture size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Realisasi Biaya</p>
            <h3 className='text-2xl font-black text-emerald-600 font-mono mt-0.5'>Rp 512.8 Jt</h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>Klaim + Dinas Aktual</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCoin size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Efisiensi Budget Dinas</p>
            <h3 className='text-2xl font-black text-emerald-600 mt-0.5'>97.2%</h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>Hemat Rp 13.7 Jt dari estimasi</p>
          </div>
          <div className='size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0'>
            <IconTrendingDown size={22} />
          </div>
        </div>
      </div>

      {/* ── Filter Bar with Date Inputs ──────────────────────────────────── */}
      <ReportFilterBar
        reportTitle='Travel and Expense Report'
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        searchPlaceholder='Cari departemen, cost center, atau tanggal...'
        exportHeaders={[
          'NO',
          'PERIODE DATA',
          'DEPARTEMEN',
          'COST CENTER',
          'TOTAL KLAIM',
          'NILAI KLAIM',
          'DINAS (SPPD)',
          'BUDGET ESTIMASI',
          'REALISASI DINAS',
          'TOTAL PENGELUARAN',
        ]}
        exportRows={filteredData.map((row, i) => [
          i + 1,
          row.periodDate,
          row.department,
          row.costCenter,
          `${row.totalClaimsCount} klaim`,
          formatIdr(row.claimsAmount),
          `${row.totalTripsCount} SPPD`,
          formatIdr(row.tripsBudget),
          formatIdr(row.tripsRealized),
          formatIdr(row.totalCost),
        ])}
      />

      {/* ── Detailed Table ──────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-4 border-b border-border/80 flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Alokasi Pengeluaran Klaim & Perjalanan Dinas</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Menampilkan rincian biaya klaim dan realisasi perjalanan dinas per cost center sesuai rentang tanggal
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
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>COST CENTER</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>TOTAL KLAIM</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>NILAI KLAIM</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>DINAS (SPPD)</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>BUDGET ESTIMASI</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>REALISASI DINAS</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>TOTAL PENGELUARAN</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className='text-center py-12 text-muted-foreground italic text-xs'>
                    Tidak ada data travel & expense yang sesuai dengan rentang tanggal dan kriteria filter.
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
                    <td className='py-3.5 px-4 text-center font-mono text-[11px] text-muted-foreground whitespace-nowrap'>
                      {row.costCenter}
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium'>{row.totalClaimsCount} klaim</td>
                    <td className='py-3.5 px-4 text-right font-mono text-muted-foreground whitespace-nowrap'>
                      {formatIdr(row.claimsAmount)}
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium'>{row.totalTripsCount} SPPD</td>
                    <td className='py-3.5 px-4 text-right font-mono text-muted-foreground whitespace-nowrap'>
                      {formatIdr(row.tripsBudget)}
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono text-foreground whitespace-nowrap'>
                      {formatIdr(row.tripsRealized)}
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap'>
                      {formatIdr(row.totalCost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          itemLabel='cost center'
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
