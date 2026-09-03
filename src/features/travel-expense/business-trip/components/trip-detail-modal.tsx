// src/features/travel-expense/business-trip/components/trip-detail-modal.tsx
import {
  IconBed,
  IconBuilding,
  IconCalendar,
  IconCash,
  IconCheck,
  IconClock,
  IconDownload,
  IconMapPin,
  IconPlane,
  IconPlaneDeparture,
  IconTrain,
  IconUser,
  IconX,
} from '@tabler/icons-react'
import type { BusinessTripRecord } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { snackbar } from '@/shared/lib/snackbar'

interface TripDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: BusinessTripRecord | null
  onApprove?: (trip: BusinessTripRecord) => void
  onReject?: (trip: BusinessTripRecord) => void
  onOpenItinerary?: (trip: BusinessTripRecord) => void
  onOpenExpenses?: (trip: BusinessTripRecord) => void
}

export function TripDetailModal({
  open,
  onOpenChange,
  trip,
  onApprove,
  onReject,
  onOpenItinerary,
  onOpenExpenses,
}: TripDetailModalProps) {
  if (!trip) return null

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const handleDownloadSuratTugas = () => {
    snackbar.success(`Surat Tugas Perjalanan Dinas (${trip.tripNumber}) berhasil didownload dalam format PDF resmi!`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[760px] p-0 overflow-hidden rounded-2xl'>
        {/* Modal Header */}
        <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-linear-to-r from-blue-500/10 via-primary/5 to-purple-500/10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs'>
                <IconPlaneDeparture size={24} />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <DialogTitle className='text-base font-bold text-foreground'>
                    {trip.title}
                  </DialogTitle>
                  <Badge
                    variant='outline'
                    className={`text-[10px] font-bold ${
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
                      ? 'Selesai (Completed)'
                      : trip.status === 'on_trip'
                      ? 'Sedang Dinas (On Trip)'
                      : trip.status === 'approved'
                      ? 'Disetujui (Approved)'
                      : trip.status === 'pending'
                      ? 'Menunggu Persetujuan'
                      : 'Dibatalkan / Ditolak'}
                  </Badge>
                </div>
                <DialogDescription className='text-xs font-mono text-muted-foreground mt-0.5'>
                  {trip.tripNumber} • {trip.originCity} ➔ {trip.destinationCity} ({trip.totalDays} Hari)
                </DialogDescription>
              </div>
            </div>

            <div className='text-right hidden sm:block'>
              <p className='text-[10px] text-muted-foreground font-semibold uppercase tracking-wider'>
                Estimasi Anggaran
              </p>
              <p className='text-lg font-bold text-primary font-mono'>
                {formatIdr(trip.estimatedBudget.total)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6 space-y-6 max-h-[72vh] overflow-y-auto'>
          {/* Employee & Objective Summary */}
          <div className='p-4 rounded-2xl border border-border/80 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div className='flex items-center gap-3.5'>
              {trip.employeeAvatar ? (
                <img
                  src={trip.employeeAvatar}
                  alt={trip.employeeName}
                  className='size-11 rounded-xl object-cover border border-border shrink-0'
                />
              ) : (
                <div className='size-11 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0'>
                  {trip.employeeName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className='flex items-center gap-1.5'>
                  <p className='text-xs font-bold text-foreground'>{trip.employeeName}</p>
                  <span className='text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground'>
                    {trip.employeeNik}
                  </span>
                </div>
                <p className='text-[11px] text-muted-foreground'>{trip.jobTitle}</p>
                <p className='text-[10px] text-primary font-semibold'>{trip.departmentName}</p>
              </div>
            </div>

            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleDownloadSuratTugas}
              className='rounded-xl h-8 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 shrink-0'
            >
              <IconDownload size={13} />
              Surat Tugas PDF
            </Button>
          </div>

          {/* Quick Metrics Grid */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs'>
            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] text-muted-foreground font-semibold flex items-center gap-1'>
                <IconCalendar size={12} />
                Jadwal Dinas
              </p>
              <p className='font-bold text-foreground mt-0.5 text-[11px]'>
                {trip.startDate} s/d {trip.endDate}
              </p>
              <p className='text-[10px] text-muted-foreground'>{trip.totalDays} Hari Kalender</p>
            </div>

            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] text-muted-foreground font-semibold flex items-center gap-1'>
                <IconMapPin size={12} />
                Kota Tujuan
              </p>
              <p className='font-bold text-foreground mt-0.5'>{trip.destinationCity}</p>
              <p className='text-[10px] text-muted-foreground'>{trip.destinationCountry}</p>
            </div>

            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] text-muted-foreground font-semibold flex items-center gap-1'>
                <IconCash size={12} />
                Uang Muka Dinas
              </p>
              <p className='font-mono font-bold text-foreground mt-0.5'>
                {trip.cashAdvanceRequested ? formatIdr(trip.cashAdvanceAmount) : 'Tidak Ada'}
              </p>
              <p className='text-[10px] text-emerald-600 font-semibold'>
                {trip.cashAdvanceDisbursed ? 'Sudah Ditransfer' : 'Belum Ditransfer'}
              </p>
            </div>

            <div className='p-3 rounded-xl border border-border/80 bg-card'>
              <p className='text-[10px] text-muted-foreground font-semibold flex items-center gap-1'>
                <IconBuilding size={12} />
                Cost Center
              </p>
              <p className='font-mono font-bold text-foreground mt-0.5'>{trip.costCenter}</p>
              <p className='text-[10px] text-muted-foreground'>Anggaran Operasional</p>
            </div>
          </div>

          {/* Purpose & Description */}
          <div className='space-y-1.5'>
            <h5 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Maksud & Tujuan Perjalanan Dinas
            </h5>
            <div className='p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs text-foreground leading-relaxed'>
              {trip.purpose}
            </div>
          </div>

          {/* Logistics Booking Cards (Transport & Hotel) */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Transport Card */}
            <div className='p-4 rounded-xl border border-border/80 bg-card space-y-2 text-xs'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-foreground flex items-center gap-1.5'>
                  {trip.transportType === 'flight' ? <IconPlane size={15} className='text-blue-600' /> : <IconTrain size={15} className='text-amber-600' />}
                  Transportasi Terjadwal
                </span>
                <Badge variant='outline' className='text-[9px] capitalize'>
                  {trip.transportType}
                </Badge>
              </div>
              <p className='font-bold text-foreground text-xs'>{trip.flightAirline || 'Transportasi Darat / Kereta'}</p>
              {trip.flightBookingCode && (
                <p className='text-[11px] font-mono text-muted-foreground'>
                  Kode Booking: <strong className='text-foreground'>{trip.flightBookingCode}</strong>
                </p>
              )}
            </div>

            {/* Hotel Card */}
            <div className='p-4 rounded-xl border border-border/80 bg-card space-y-2 text-xs'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-foreground flex items-center gap-1.5'>
                  <IconBed size={15} className='text-purple-600' />
                  Akomodasi Hotel
                </span>
                <Badge variant='outline' className='text-[9px]'>
                  4-Star Corporate
                </Badge>
              </div>
              <p className='font-bold text-foreground text-xs'>{trip.hotelName || 'Tidak Menggunakan Hotel'}</p>
              {trip.hotelBookingCode && (
                <p className='text-[11px] font-mono text-muted-foreground'>
                  Kode Voucher: <strong className='text-foreground'>{trip.hotelBookingCode}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Estimated Budget Breakdown */}
          <div className='p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2.5 text-xs'>
            <h5 className='font-bold text-foreground uppercase tracking-wider text-[11px]'>
              Rincian Estimasi Biaya Perjalanan Dinas
            </h5>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1'>
              <div className='p-2 rounded-lg bg-card border border-border/60'>
                <p className='text-muted-foreground text-[10px]'>Tiket Transport</p>
                <p className='font-mono font-bold text-foreground'>{formatIdr(trip.estimatedBudget.transport)}</p>
              </div>
              <div className='p-2 rounded-lg bg-card border border-border/60'>
                <p className='text-muted-foreground text-[10px]'>Penginapan Hotel</p>
                <p className='font-mono font-bold text-foreground'>{formatIdr(trip.estimatedBudget.accommodation)}</p>
              </div>
              <div className='p-2 rounded-lg bg-card border border-border/60'>
                <p className='text-muted-foreground text-[10px]'>Per Diem Allowance</p>
                <p className='font-mono font-bold text-foreground'>{formatIdr(trip.estimatedBudget.perDiem)}</p>
              </div>
              <div className='p-2 rounded-lg bg-card border border-border/60'>
                <p className='text-muted-foreground text-[10px]'>Biaya Lokal & Lainnya</p>
                <p className='font-mono font-bold text-foreground'>{formatIdr(trip.estimatedBudget.localExpenses)}</p>
              </div>
            </div>
          </div>

          {/* Approval Routing */}
          <div className='space-y-3 pt-3 border-t border-border/80'>
            <h5 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
              <IconClock size={14} className='text-primary' />
              Alur Persetujuan Perjalanan Dinas
            </h5>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {trip.approvalFlow.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs relative ${
                    step.status === 'approved'
                      ? 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : step.status === 'pending'
                      ? 'border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20'
                  }`}
                >
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-[10px] font-bold uppercase text-muted-foreground'>
                      Tahap {idx + 1}: {step.role}
                    </span>
                    <Badge
                      variant='outline'
                      className={`text-[8px] font-bold px-1.5 py-0 ${
                        step.status === 'approved'
                          ? 'border-emerald-500/30 text-emerald-600'
                          : step.status === 'pending'
                          ? 'border-amber-500/30 text-amber-600'
                          : 'border-rose-500/30 text-rose-600'
                      }`}
                    >
                      {step.status}
                    </Badge>
                  </div>
                  <p className='font-bold text-foreground truncate'>{step.approverName}</p>
                  {step.date && (
                    <p className='text-[10px] text-muted-foreground mt-0.5'>{step.date}</p>
                  )}
                  {step.notes && (
                    <p className='text-[10px] italic text-foreground/80 mt-1 border-t border-border/50 pt-1'>
                      "{step.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-between'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs'
          >
            Tutup
          </Button>

          <div className='flex items-center gap-2'>
            {onOpenItinerary && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  onOpenChange(false)
                  onOpenItinerary(trip)
                }}
                className='rounded-xl h-9 text-xs font-bold text-primary border-primary/30 hover:bg-primary/10'
              >
                Lihat Itinerary
              </Button>
            )}

            {onOpenExpenses && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  onOpenChange(false)
                  onOpenExpenses(trip)
                }}
                className='rounded-xl h-9 text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-50'
              >
                Realisasi Biaya
              </Button>
            )}

            {trip.status === 'pending' && onReject && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  onOpenChange(false)
                  onReject(trip)
                }}
                className='rounded-xl h-9 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold'
              >
                <IconX size={14} className='mr-1' />
                Tolak
              </Button>
            )}

            {trip.status === 'pending' && onApprove && (
              <Button
                type='button'
                size='sm'
                onClick={() => {
                  onOpenChange(false)
                  onApprove(trip)
                }}
                className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white'
              >
                <IconCheck size={14} />
                Setujui Dinas
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
