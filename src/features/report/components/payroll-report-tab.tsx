import {
  IconArrowDownRight,
  IconCalendar,
  IconCreditCard,
  IconReceipt2,
  IconUsers,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { mockPayrollData } from '../data/mock-report-data'
import { ReportFilterBar } from './report-filter-bar'
import type { PayrollReportRow, ReportFilterCriteria } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { TablePagination } from '@/shared/components/ui/table-pagination'

export function PayrollReportTab() {
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
    return mockPayrollData.filter((item) => {
      // Date filter
      if (filters.startDate && item.payDate < filters.startDate) return false
      if (filters.endDate && item.payDate > filters.endDate) return false

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
          item.period.toLowerCase().includes(q) ||
          item.payDate.includes(q)
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
            <p className='text-xs font-semibold text-muted-foreground'>Total Gaji Bruto</p>
            <h3 className='text-xl font-black text-foreground mt-0.5'>Rp 6.35 M</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Gaji pokok + tunjangan</p>
          </div>
          <div className='size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconReceipt2 size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Potongan & Pajak</p>
            <h3 className='text-xl font-black text-rose-600 mt-0.5'>Rp 780 Jt</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>PPh 21 & BPJS</p>
          </div>
          <div className='size-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0'>
            <IconArrowDownRight size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Net Payout</p>
            <h3 className='text-xl font-black text-emerald-600 mt-0.5'>Rp 5.57 M</h3>
            <p className='text-[10px] text-emerald-600 font-semibold mt-0.5'>100% Ditransfer Bank</p>
          </div>
          <div className='size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCreditCard size={22} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Pegawai Diproses</p>
            <h3 className='text-xl font-black text-foreground mt-0.5'>1,246</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Seluruh Departemen</p>
          </div>
          <div className='size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0'>
            <IconUsers size={22} />
          </div>
        </div>
      </div>

      {/* ── Filter Bar with Date Inputs ──────────────────────────────────── */}
      <ReportFilterBar
        reportTitle='Payroll Report'
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        searchPlaceholder='Cari departemen atau periode...'
        exportHeaders={[
          'NO',
          'TANGGAL BAYAR',
          'DEPARTEMEN',
          'PERIODE',
          'PEGAWAI',
          'GAJI POKOK',
          'TUNJANGAN',
          'LEMBUR',
          'POTONGAN',
          'PAJAK PPH21',
          'NET PAYOUT',
          'STATUS',
        ]}
        exportRows={filteredData.map((row, i) => [
          i + 1,
          row.payDate,
          row.department,
          row.period,
          `${row.totalEmployees} org`,
          formatIdr(row.basicSalaryTotal),
          formatIdr(row.allowancesTotal),
          formatIdr(row.overtimeTotal),
          `-${formatIdr(row.deductionsTotal)}`,
          `-${formatIdr(row.taxTotal)}`,
          formatIdr(row.netPayTotal),
          row.status.toUpperCase(),
        ])}
      />

      {/* ── Detailed Table ──────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-4 border-b border-border/80 flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Komponen Rekapitulasi Penggajian</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Menampilkan rincian penggajian per departemen untuk tanggal dan periode terpilih
            </p>
          </div>
        </div>

        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full text-left text-xs min-w-[1150px] border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold'>
                <th className='py-3.5 px-3 text-center whitespace-nowrap w-12'>NO</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>TANGGAL BAYAR</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>DEPARTEMEN</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>PEGAWAI</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>GAJI POKOK</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>TUNJANGAN</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>LEMBUR</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>POTONGAN</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>PAJAK PPH21</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>NET PAYOUT</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>STATUS</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className='text-center py-12 text-muted-foreground italic text-xs'>
                    Tidak ada data payroll yang sesuai dengan rentang tanggal dan kriteria filter.
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
                        <span className='font-semibold text-foreground'>{row.payDate}</span>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 font-bold text-foreground whitespace-nowrap'>
                      <div>
                        <p>{row.department}</p>
                        <span className='text-[10px] text-muted-foreground font-mono'>
                          {row.period}
                        </span>
                      </div>
                    </td>
                    <td className='py-3.5 px-4 text-center font-mono font-medium whitespace-nowrap'>
                      {row.totalEmployees} org
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono text-muted-foreground whitespace-nowrap'>
                      {formatIdr(row.basicSalaryTotal)}
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono text-muted-foreground whitespace-nowrap'>
                      {formatIdr(row.allowancesTotal)}
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono text-muted-foreground whitespace-nowrap'>
                      {formatIdr(row.overtimeTotal)}
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono text-rose-600 whitespace-nowrap'>
                      -{formatIdr(row.deductionsTotal)}
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono text-rose-600 whitespace-nowrap'>
                      -{formatIdr(row.taxTotal)}
                    </td>
                    <td className='py-3.5 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap'>
                      {formatIdr(row.netPayTotal)}
                    </td>
                    <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                      <Badge
                        variant='outline'
                        className='rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap'
                      >
                        {row.status === 'paid' ? 'Disalurkan' : 'Diproses'}
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
          itemLabel='departemen payroll'
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
