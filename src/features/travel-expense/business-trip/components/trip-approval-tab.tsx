// src/features/travel-expense/business-trip/components/trip-approval-tab.tsx
import {
  IconAlertCircle,
  IconCheck,
  IconEye,
  IconMapPin,
  IconPlaneDeparture,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import type { BusinessTripRecord } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { snackbar } from '@/shared/lib/snackbar'

interface TripApprovalTabProps {
  trips: BusinessTripRecord[]
  onViewDetail: (trip: BusinessTripRecord) => void
  onApprove: (trip: BusinessTripRecord) => void
  onReject: (trip: BusinessTripRecord) => void
  onBatchApprove?: (tripIds: string[]) => void
}

export function TripApprovalTab({
  trips,
  onViewDetail,
  onApprove,
  onReject,
}: TripApprovalTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const pendingTrips = useMemo(() => {
    return trips.filter((t) => t.status === 'pending')
  }, [trips])

  const paginatedPendingTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return pendingTrips.slice(start, start + pageSize)
  }, [pendingTrips, currentPage, pageSize])

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingTrips.map((t) => t.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleBatchApprove = () => {
    if (onBatchApprove) {
      onBatchApprove(selectedIds)
    } else {
      selectedIds.forEach((id) => {
        const found = trips.find((t) => t.id === id)
        if (found) onApprove(found)
      })
      snackbar.success(`${selectedIds.length} permohonan dinas berhasil disetujui!`)
    }
    setSelectedIds([])
  }

  const totalPendingBudget = pendingTrips.reduce((acc, t) => acc + t.estimatedBudget.total, 0)

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Top Summary ───────────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Antrean Persetujuan Dinas</p>
            <h3 className='text-xl font-bold text-amber-600 mt-0.5'>{pendingTrips.length} Dinas</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Perlu Ditinjau</p>
          </div>
          <div className='size-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0'>
            <IconAlertCircle size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Estimasi Komitmen Anggaran</p>
            <h3 className='text-xl font-bold text-foreground font-mono mt-0.5'>
              {formatIdr(totalPendingBudget)}
            </h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Total Permohonan</p>
          </div>
          <div className='size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0'>
            <IconPlaneDeparture size={20} />
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Travel Policy Compliance</p>
            <h3 className='text-xl font-bold text-emerald-600 mt-0.5'>100% Compliant</h3>
            <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Grade & Rate Sesuai</p>
          </div>
          <div className='size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0'>
            <IconShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* ── Policy Banner & Batch Actions ─────────────────────────────────── */}
      <div className='p-4 rounded-2xl border border-border/80 bg-linear-to-r from-blue-500/10 via-card to-purple-500/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs'>
        <div className='flex items-center gap-3'>
          <div className='size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs'>
            <IconShieldCheck size={18} />
          </div>
          <div>
            <p className='font-bold text-foreground'>Verifikasi Kepatuhan Perjalanan Dinas Korporat</p>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              Plafon hotel dan kelas penerbangan disesuaikan secara otomatis berdasarkan Job Grade pemohon.
            </p>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className='flex items-center gap-2'>
            <span className='text-xs font-semibold text-foreground'>{selectedIds.length} dipilih</span>
            <Button
              size='sm'
              onClick={handleBatchApprove}
              className='rounded-xl h-8 text-xs font-bold gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              <IconCheck size={14} />
              Setujui Sekaligus
            </Button>
          </div>
        )}
      </div>

      {/* ── Pending Trips Table ───────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='w-full overflow-x-auto pb-1'>
          <table className='w-full min-w-[1000px] text-xs text-left border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]'>
                <th className='py-3.5 px-4 w-10 text-center whitespace-nowrap'>
                  <input
                    type='checkbox'
                    checked={
                      pendingTrips.length > 0 &&
                      selectedIds.length === pendingTrips.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className='rounded border-border'
                  />
                </th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Dinas & Pemohon</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Tujuan & Tanggal</th>
                <th className='py-3.5 px-4 whitespace-nowrap'>Pemeriksaan Kebijakan</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>Estimasi Biaya</th>
                <th className='py-3.5 px-4 text-right whitespace-nowrap'>Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {pendingTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-12 text-center text-muted-foreground'>
                    <IconCheck size={32} className='mx-auto mb-2 text-emerald-500 opacity-80' />
                    <p className='font-bold text-xs text-foreground'>Semua Permohonan Dinas Telah Diproses</p>
                    <p className='text-[11px] mt-0.5'>Tidak ada antrean persetujuan perjalanan dinas saat ini.</p>
                  </td>
                </tr>
              ) : (
                paginatedPendingTrips.map((trip) => {
                  const isSelected = selectedIds.includes(trip.id)
                  return (
                    <tr
                      key={trip.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className='py-3.5 px-4 text-center' onClick={(e) => e.stopPropagation()}>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => handleToggleSelect(trip.id)}
                          className='rounded border-border'
                        />
                      </td>

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
                            <p className='font-bold text-foreground text-[12px]'>
                              {trip.tripNumber}
                            </p>
                            <p className='text-[11px] text-muted-foreground truncate'>
                              {trip.employeeName} ({trip.departmentName})
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

                      <td className='py-3.5 px-4'>
                        <div className='space-y-1 text-[10px]'>
                          <span className='inline-flex items-center gap-1 text-emerald-600 font-semibold'>
                            <IconCheck size={12} />
                            Kelas Tiket Sesuai Grade
                          </span>
                          <br />
                          <span className='inline-flex items-center gap-1 text-emerald-600 font-semibold'>
                            <IconCheck size={12} />
                            Tarif Hotel Dalam Batas Kota
                          </span>
                        </div>
                      </td>

                      <td className='py-3.5 px-4 text-right font-mono font-bold text-foreground'>
                        {formatIdr(trip.estimatedBudget.total)}
                      </td>

                      <td className='py-3.5 px-4 text-right'>
                        <div className='flex items-center justify-end gap-1.5'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onViewDetail(trip)}
                            className='rounded-lg h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10'
                          >
                            <IconEye size={13} className='mr-1' /> Review
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onReject(trip)}
                            className='rounded-lg h-7 px-2.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50'
                          >
                            <IconX size={13} />
                          </Button>
                          <Button
                            size='sm'
                            onClick={() => onApprove(trip)}
                            className='rounded-lg h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white'
                          >
                            <IconCheck size={13} className='mr-1' /> Setujui
                          </Button>
                        </div>
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
          itemLabel='antrean dinas'
          totalItems={pendingTrips.length}
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
