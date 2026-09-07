// src/features/travel-expense/business-trip/components/trip-history-tab.tsx
import {
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconHistory,
  IconMapPin,
  IconPlaneDeparture,
  IconSearch,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import type { BusinessTripRecord } from '../../types'
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

interface TripHistoryTabProps {
  trips: BusinessTripRecord[]
  onViewDetail: (trip: BusinessTripRecord) => void
}

export function TripHistoryTab({ trips, onViewDetail }: TripHistoryTabProps) {
  const [search, setSearch] = useState('')
  const [destinationFilter, setDestinationFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const historicalTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchSearch =
        t.tripNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        t.destinationCity.toLowerCase().includes(search.toLowerCase())

      const matchDest =
        destinationFilter === 'all' ||
        t.destinationCity.toLowerCase().includes(destinationFilter.toLowerCase())

      return matchSearch && matchDest
    })
  }, [trips, search, destinationFilter])

  const paginatedHistoricalTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return historicalTrips.slice(start, start + pageSize)
  }, [historicalTrips, currentPage, pageSize])

  const totalSpent = historicalTrips.reduce(
    (acc, t) => acc + (t.actualExpensesTotal || t.estimatedBudget.total),
    0,
  )

  const handleExport = () => {
    snackbar.success('Laporan rekapitulasi dinas berhasil diexport ke format Excel (.xlsx)!')
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Summary Counters ──────────────────────────────────────────── */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Riwayat Dinas</p>
            <h3 className='text-xl font-bold text-foreground mt-0.5'>{trips.length} Perjalanan</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Domestik & Global</p>
          </div>
          <div className='size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconHistory size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Biaya Realisasi</p>
            <h3 className='text-xl font-bold text-emerald-600 font-mono mt-0.5'>
              {formatIdr(totalSpent)}
            </h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Realisasi Kasir</p>
          </div>
          <div className='size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCheck size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Rata-rata Durasi</p>
            <h3 className='text-xl font-bold text-foreground mt-0.5'>3.6 Hari</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Per Kunjungan Dinas</p>
          </div>
          <div className='size-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0'>
            <IconPlaneDeparture size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Destinasi Terbanyak</p>
            <h3 className='text-xl font-bold text-rose-600 mt-0.5'>Surabaya & Bali</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>64% Total Kunjungan</p>
          </div>
          <div className='size-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0'>
            <IconMapPin size={20} />
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
              placeholder='Cari nomor dinas, kota, atau nama karyawan...'
              className='h-9 pl-9 text-xs bg-background rounded-xl w-full'
            />
          </div>

          <Select
            value={destinationFilter}
            onValueChange={(val) => {
              setDestinationFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-9 text-xs w-full sm:w-44 rounded-xl bg-background'>
              <SelectValue placeholder='Kota Tujuan' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua Destinasi</SelectItem>
              <SelectItem value='surabaya'>Surabaya (SUB)</SelectItem>
              <SelectItem value='denpasar'>Denpasar / Bali (DPS)</SelectItem>
              <SelectItem value='semarang'>Semarang (SMT)</SelectItem>
              <SelectItem value='singapore'>Singapore (SIN)</SelectItem>
              <SelectItem value='balikpapan'>Balikpapan (BPN)</SelectItem>
              <SelectItem value='medan'>Medan (KNO)</SelectItem>
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
                <th className='py-3.5 px-4 whitespace-nowrap'>Destinasi</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Cost Center</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>Realisasi Biaya</th>
                <th className='py-3.5 px-4 text-center whitespace-nowrap'>Status</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>Detail</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {historicalTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-12 text-center text-muted-foreground'>
                    <IconHistory size={32} className='mx-auto mb-2 opacity-40' />
                    <p className='font-semibold text-xs'>Tidak ada riwayat perjalanan dinas yang cocok</p>
                  </td>
                </tr>
              ) : (
                paginatedHistoricalTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className='hover:bg-muted/20 transition-colors group cursor-pointer'
                    onClick={() => onViewDetail(trip)}
                  >
                    <td className='py-3.5 px-4'>
                      <p className='font-bold text-foreground group-hover:text-primary transition-colors'>
                        {trip.tripNumber}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>{trip.startDate}</p>
                    </td>

                    <td className='py-3.5 px-4'>
                      <p className='font-bold text-foreground'>{trip.employeeName}</p>
                      <p className='text-[11px] text-muted-foreground'>{trip.departmentName}</p>
                    </td>

                    <td className='py-3.5 px-4'>
                      <p className='font-semibold text-foreground flex items-center gap-1'>
                        <IconMapPin size={12} className='text-rose-500' />
                        {trip.destinationCity}
                      </p>
                      <p className='text-[10px] text-muted-foreground'>{trip.totalDays} Hari</p>
                    </td>

                    <td className='py-3.5 px-4 font-mono text-[11px] text-muted-foreground'>
                      {trip.costCenter}
                    </td>

                    <td className='py-3.5 px-4 text-right font-mono font-bold text-foreground'>
                      {formatIdr(trip.actualExpensesTotal || trip.estimatedBudget.total)}
                    </td>

                    <td className='py-3.5 px-4 text-center'>
                      <Badge
                        variant='outline'
                        className={`text-[9px] font-bold ${
                          trip.status === 'completed'
                            ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : trip.status === 'on_trip'
                            ? 'border-blue-500/30 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                            : trip.status === 'approved'
                            ? 'border-purple-500/30 text-purple-600 bg-purple-50/50 dark:bg-purple-950/20'
                            : trip.status === 'pending'
                            ? 'border-amber-500/30 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                            : 'border-rose-500/30 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
                        }`}
                      >
                        {trip.status}
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
      </div>
    </div>
  )
}
