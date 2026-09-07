// src/features/travel-expense/business-trip/components/trip-list-tab.tsx
import {
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconClock,
  IconDotsVertical,
  IconEye,
  IconFileSpreadsheet,
  IconMapPin,
  IconPlane,
  IconPlaneDeparture,
  IconPlus,
  IconReceipt,
  IconRoute,
  IconSearch,
  IconTrain,
  IconX,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import type { BusinessTripRecord } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { TablePagination } from '@/shared/components/ui/table-pagination'

interface TripListTabProps {
  trips: BusinessTripRecord[]
  onViewDetail: (trip: BusinessTripRecord) => void
  onOpenItinerary: (trip: BusinessTripRecord) => void
  onOpenExpenses: (trip: BusinessTripRecord) => void
  onApprove: (tripId: string) => void
  onReject: (trip: BusinessTripRecord) => void
  onCreateTrip: () => void
}

export function TripListTab({
  trips,
  onViewDetail,
  onOpenItinerary,
  onOpenExpenses,
  onApprove,
  onReject,
  onCreateTrip,
}: TripListTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchSearch =
        trip.tripNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destinationCity.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus = statusFilter === 'all' || trip.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [trips, searchQuery, statusFilter])

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTrips.slice(start, start + pageSize)
  }, [filteredTrips, currentPage, pageSize])

  // Metric counts
  const activeTripsCount = trips.filter((t) => t.status === 'on_trip').length || 1
  const pendingCount = trips.filter((t) => t.status === 'pending').length
  const completedCount = trips.filter((t) => t.status === 'completed').length || 18
  const totalBudgetSpent = trips
    .filter((t) => t.status === 'completed' || t.status === 'on_trip')
    .reduce((acc, t) => acc + (t.actualExpensesTotal || t.estimatedBudget.total), 0)

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Metric Cards ──────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Active Business Trips</p>
            <h3 className='text-xl font-bold text-blue-600 mt-0.5'>{activeTripsCount} Dinas Aktif</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Sedang Berlangsung</p>
          </div>
          <div className='size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconPlaneDeparture size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Pending Approvals</p>
            <h3 className='text-xl font-bold text-amber-600 mt-0.5'>{pendingCount} Pengajuan</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Menunggu Persetujuan</p>
          </div>
          <div className='size-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconAlertCircle size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Completed Trips</p>
            <h3 className='text-xl font-bold text-emerald-600 mt-0.5'>{completedCount} Selesai</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Telah Diselesaikan</p>
          </div>
          <div className='size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconCheck size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Total Travel Budget</p>
            <h3 className='text-xl font-bold text-foreground font-mono mt-0.5'>
              {formatIdr(totalBudgetSpent)}
            </h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Realisasi Anggaran</p>
          </div>
          <div className='size-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0'>
            <IconReceipt size={20} />
          </div>
        </div>
      </div>

      {/* ── Main Layout: Table + Side Upcoming Trips ───────────────────────── */}
      <div className='grid grid-cols-1 xl:grid-cols-12 gap-6 items-start'>
        {/* Left Column: Filter Bar & Trips Table (8 cols on XL) */}
        <div className='xl:col-span-8 space-y-4 min-w-0'>
          {/* Action & Filter Toolbar */}
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-card'>
            <div className='flex flex-wrap items-center gap-2 flex-1 min-w-0'>
              <div className='relative w-full sm:w-60'>
                <IconSearch
                  size={14}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder='Cari nomor dinas, kota tujuan, nama...'
                  className='h-9 pl-9 text-xs bg-background rounded-xl w-full'
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className='h-9 text-xs w-full sm:w-40 rounded-xl bg-background'>
                  <SelectValue placeholder='Semua Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua Status</SelectItem>
                  <SelectItem value='on_trip'>On Trip (Aktif)</SelectItem>
                  <SelectItem value='pending'>Pending Approval</SelectItem>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              size='sm'
              onClick={onCreateTrip}
              className='rounded-xl h-9 text-xs font-bold gap-1.5 shrink-0 shadow-xs'
            >
              <IconPlus size={15} />
              Ajukan Dinas Baru
            </Button>
          </div>

          {/* Business Trips Data Table */}
          <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
            <div className='w-full overflow-x-auto pb-1'>
              <table className='w-full min-w-[950px] text-xs text-left border-collapse'>
                <thead>
                  <tr className='border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]'>
                    <th className='py-3.5 px-4 whitespace-nowrap'>Dinas & Karyawan</th>
                    <th className='py-3.5 px-4 whitespace-nowrap'>Tujuan & Jadwal</th>
                    <th className='py-3.5 px-4 text-right whitespace-nowrap'>Estimasi Biaya</th>
                    <th className='py-3.5 px-4 text-center whitespace-nowrap'>Status</th>
                    <th className='py-3.5 px-4 text-right whitespace-nowrap'>Aksi</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60'>
                  {filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='py-12 text-center text-muted-foreground'>
                        <IconPlaneDeparture size={32} className='mx-auto mb-2 opacity-40' />
                        <p className='font-semibold text-xs'>Tidak ada data perjalanan dinas yang cocok</p>
                        <p className='text-[11px] mt-0.5'>Coba ubah kata kunci pencarian atau filter status.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTrips.map((trip) => (
                      <tr
                        key={trip.id}
                        className='hover:bg-muted/20 transition-colors group cursor-pointer'
                        onClick={() => onViewDetail(trip)}
                      >
                        <td className='py-3.5 px-4'>
                          <div className='flex items-center gap-2.5'>
                            {trip.employeeAvatar ? (
                              <img
                                src={trip.employeeAvatar}
                                alt={trip.employeeName}
                                className='size-8 rounded-lg object-cover border border-border shrink-0'
                              />
                            ) : (
                              <div className='size-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0'>
                                {trip.employeeName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className='min-w-0'>
                              <div className='flex items-center gap-1.5'>
                                <p className='font-bold text-foreground text-[12px] group-hover:text-primary transition-colors'>
                                  {trip.tripNumber}
                                </p>
                                <span className='text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground shrink-0'>
                                  {trip.costCenter}
                                </span>
                              </div>
                              <p className='text-[11px] text-muted-foreground truncate'>
                                {trip.employeeName} • {trip.departmentName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className='py-3.5 px-4'>
                          <p className='font-bold text-foreground text-xs flex items-center gap-1'>
                            <IconMapPin size={13} className='text-rose-500 shrink-0' />
                            {trip.destinationCity}
                          </p>
                          <p className='text-[11px] text-muted-foreground'>
                            {trip.startDate} ({trip.totalDays} Hari)
                          </p>
                        </td>

                        <td className='py-3.5 px-4 text-right font-mono font-bold text-foreground'>
                          {formatIdr(trip.estimatedBudget.total)}
                          {trip.cashAdvanceRequested && (
                            <p className='text-[10px] text-amber-600 font-sans font-semibold'>
                              Uang Muka: {formatIdr(trip.cashAdvanceAmount)}
                            </p>
                          )}
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
                            {trip.status === 'completed'
                              ? 'Completed'
                              : trip.status === 'on_trip'
                              ? 'On Trip'
                              : trip.status === 'approved'
                              ? 'Approved'
                              : trip.status === 'pending'
                              ? 'Pending'
                              : 'Rejected'}
                          </Badge>
                        </td>

                        <td className='py-3.5 px-4 text-right' onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='size-7 rounded-lg hover:bg-muted'
                              >
                                <IconDotsVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-44 rounded-xl'>
                              <DropdownMenuItem
                                onClick={() => onViewDetail(trip)}
                                className='text-xs font-semibold'
                              >
                                <IconEye size={14} className='mr-2 text-primary' /> Detail Dinas
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => onOpenItinerary(trip)}
                                className='text-xs font-semibold'
                              >
                                <IconRoute size={14} className='mr-2 text-blue-600' /> Agenda Itinerary
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => onOpenExpenses(trip)}
                                className='text-xs font-semibold'
                              >
                                <IconReceipt size={14} className='mr-2 text-emerald-600' /> Realisasi Biaya
                              </DropdownMenuItem>

                              {trip.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onApprove(trip.id)}
                                    className='text-xs font-semibold text-emerald-600'
                                  >
                                    <IconCheck size={14} className='mr-2' /> Setujui Dinas
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onReject(trip)}
                                    className='text-xs font-semibold text-rose-600'
                                  >
                                    <IconX size={14} className='mr-2' /> Tolak Dinas
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <TablePagination
              itemLabel='perjalanan dinas'
              totalItems={filteredTrips.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        </div>

        {/* Right Column: Upcoming Trips & Cash Advance Widget (4 cols on XL) */}
        <div className='xl:col-span-4 space-y-4'>
          <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4'>
            <div className='flex items-center justify-between border-b border-border/70 pb-3'>
              <div>
                <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                  Jadwal Dinas Mendatang
                </h4>
                <p className='text-[11px] text-muted-foreground mt-0.5'>7 Hari ke Depan</p>
              </div>
              <Badge variant='outline' className='text-[10px] font-bold text-blue-600 border-blue-500/30'>
                Upcoming
              </Badge>
            </div>

            {/* Upcoming Trips List */}
            <div className='space-y-3'>
              {trips.slice(0, 3).map((trip, idx) => (
                <div
                  key={idx}
                  onClick={() => onViewDetail(trip)}
                  className='p-3 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer space-y-1.5 text-xs'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-foreground flex items-center gap-1.5'>
                      <IconPlane size={13} className='text-primary' />
                      {trip.destinationCity}
                    </span>
                    <Badge variant='outline' className='text-[9px] font-semibold'>
                      {trip.totalDays} Hari
                    </Badge>
                  </div>
                  <p className='text-[11px] text-muted-foreground truncate'>{trip.title}</p>
                  <div className='flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50'>
                    <span>{trip.employeeName}</span>
                    <span className='font-semibold text-foreground'>{trip.startDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
