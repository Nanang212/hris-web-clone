// src/features/travel-expense/business-trip/components/reject-trip-modal.tsx
import { IconAlertTriangle } from '@tabler/icons-react'
import { useState } from 'react'
import type { BusinessTripRecord } from '../../types'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Textarea } from '@/shared/components/ui/textarea'

interface RejectTripModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: BusinessTripRecord | null
  onReject: (tripId: string, reason: string) => void
}

export function RejectTripModal({
  open,
  onOpenChange,
  trip,
  onReject,
}: RejectTripModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (!trip) return null

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Alasan penolakan perjalanan dinas wajib diisi.')
      return
    }
    setError('')
    onReject(trip.id, reason.trim())
    setReason('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px] p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-rose-500/10'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-rose-600 text-white shrink-0'>
              <IconAlertTriangle size={22} />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                Tolak Perjalanan Dinas ({trip.tripNumber})
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Tujuan: <strong>{trip.destinationCity}</strong> ({trip.startDate} s/d {trip.endDate})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6 space-y-4'>
          <div className='p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-300 leading-relaxed'>
            Pengajuan perjalanan dinas oleh <strong>{trip.employeeName}</strong> akan dibatalkan. Karyawan akan menerima notifikasi dan alasan penolakan ini.
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-foreground'>
              Alasan Penolakan <span className='text-rose-500'>*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              placeholder='Contoh: Anggaran Q2 belum dialokasikan / Jadwal kegiatan dapat dilakukan secara online meeting...'
              className='text-xs min-h-[90px] rounded-xl'
            />
            {error && <p className='text-[11px] text-rose-500 font-semibold'>{error}</p>}
          </div>
        </div>

        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs'
          >
            Batal
          </Button>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={handleConfirm}
            className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs'
          >
            Konfirmasi Tolak Dinas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
