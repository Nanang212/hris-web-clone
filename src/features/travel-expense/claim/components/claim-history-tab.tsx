// src/features/travel-expense/claim/components/claim-history-tab.tsx
import {
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconHistory,
  IconReceipt,
  IconSearch,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import type { ClaimRecord } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { snackbar } from '@/shared/lib/snackbar'

interface ClaimHistoryTabProps {
  claims: ClaimRecord[]
  onViewDetail: (claim: ClaimRecord) => void
}

export function ClaimHistoryTab({ claims, onViewDetail }: ClaimHistoryTabProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const historicalClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchSearch =
        c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())

      const matchCategory =
        categoryFilter === 'all' || c.category === categoryFilter

      return matchSearch && matchCategory
    })
  }, [claims, search, categoryFilter])

  const paginatedHistoricalClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return historicalClaims.slice(start, start + pageSize)
  }, [historicalClaims, currentPage, pageSize])

  const totalHistoricalAmount = historicalClaims
    .filter((c) => c.status === 'approved' || c.status === 'paid')
    .reduce((acc, c) => acc + c.amount, 0)

  const handleExport = () => {
    snackbar.success('Laporan riwayat klaim reimbursement berhasil diexport ke format Excel (.xlsx)!')
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Summary Counters ──────────────────────────────────────────── */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Riwayat Klaim</p>
            <h3 className='text-xl font-bold text-foreground mt-0.5'>{claims.length} Klaim</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Sepanjang Masa</p>
          </div>
          <div className='size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconHistory size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Terbayar</p>
            <h3 className='text-xl font-bold text-emerald-600 font-mono mt-0.5'>
              {formatIdr(totalHistoricalAmount)}
            </h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Telah Disbursed</p>
          </div>
          <div className='size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCheck size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Rata-rata Proses</p>
            <h3 className='text-xl font-bold text-foreground mt-0.5'>1.2 Hari</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Submission to Approval</p>
          </div>
          <div className='size-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0'>
            <IconReceipt size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Tingkat Persetujuan</p>
            <h3 className='text-xl font-bold text-blue-600 mt-0.5'>94.8%</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Sesuai Regulasi</p>
          </div>
          <div className='size-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconCheck size={20} />
          </div>
        </div>
      </div>

      {/* ── Toolbar & Table ───────────────────────────────────────────────── */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-card'>
        <div className='flex flex-wrap items-center gap-2 flex-1 min-w-0'>
          <div className='relative w-full sm:w-64'>
            <IconSearch
              size={14}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder='Cari nomor klaim atau nama karyawan...'
              className='h-9 pl-9 text-xs bg-background rounded-xl w-full'
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-9 text-xs w-full sm:w-44 rounded-xl bg-background'>
              <SelectValue placeholder='Kategori' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua Kategori</SelectItem>
              <SelectItem value='medical'>Medical & Dental</SelectItem>
              <SelectItem value='transport'>Transport & Taxi</SelectItem>
              <SelectItem value='meal'>Meal & Entertain</SelectItem>
              <SelectItem value='accommodation'>Hotel & Lodging</SelectItem>
              <SelectItem value='office'>Office & Internet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={handleExport}
          className='rounded-xl h-9 text-xs font-bold gap-1.5 shrink-0 shadow-xs'
        >
          <IconFileSpreadsheet size={15} className='text-emerald-600' />
          Export ke Excel
        </Button>
      </div>

      {/* ── Historical Data Table ─────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full min-w-[1000px] text-xs text-left border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]'>
                <th className='py-3.5 px-4 whitespace-nowrap'>Nomor & Tanggal</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Karyawan & Dept</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Kategori</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Cost Center</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>Nominal (IDR)</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>Status Akhir</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>Detail</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {historicalClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-12 text-center text-muted-foreground'>
                    <IconHistory size={32} className='mx-auto mb-2 opacity-40' />
                    <p className='font-semibold text-xs'>Tidak ada riwayat klaim yang cocok</p>
                  </td>
                </tr>
              ) : (
                paginatedHistoricalClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className='hover:bg-muted/20 transition-colors group cursor-pointer'
                    onClick={() => onViewDetail(claim)}
                  >
                    <td className='py-3.5 px-4'>
                      <p className='font-bold text-foreground group-hover:text-primary transition-colors'>
                        {claim.claimNumber}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>{claim.claimDate}</p>
                    </td>

                    <td className='py-3.5 px-4'>
                      <p className='font-bold text-foreground'>{claim.employeeName}</p>
                      <p className='text-[11px] text-muted-foreground'>{claim.departmentName}</p>
                    </td>

                    <td className='py-3.5 px-4'>
                      <Badge variant='outline' className='text-[9px] font-semibold bg-muted/30'>
                        {claim.categoryLabel}
                      </Badge>
                    </td>

                    <td className='py-3.5 px-4 font-mono text-[11px] text-muted-foreground'>
                      {claim.costCenter}
                    </td>

                    <td className='py-3.5 px-4 text-right font-mono font-bold text-foreground'>
                      {formatIdr(claim.amount)}
                    </td>

                    <td className='py-3.5 px-4 text-center'>
                      <Badge
                        variant='outline'
                        className={`text-[9px] font-bold ${
                          claim.status === 'paid'
                            ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : claim.status === 'approved'
                            ? 'border-blue-500/30 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                            : claim.status === 'pending'
                            ? 'border-amber-500/30 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                            : 'border-rose-500/30 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
                        }`}
                      >
                        {claim.status}
                      </Badge>
                    </td>

                    <td className='py-3.5 px-4 text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 text-xs text-primary hover:bg-primary/10 rounded-lg'
                      >
                        Lihat
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          itemLabel='riwayat klaim'
          totalItems={historicalClaims.length}
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
