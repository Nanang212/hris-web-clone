// src/features/payroll/components/confirmation-modal.tsx — Screen 12: Process calculation modal
import { IconAlertCircle } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'

interface CalculationConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodName: string
  employeeCount: number
  onConfirm: () => void
  isProcessing?: boolean
}

export function CalculationConfirmationModal({
  open,
  onOpenChange,
  periodName,
  employeeCount,
  onConfirm,
  isProcessing,
}: CalculationConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md p-6 rounded-3xl border border-border/80 shadow-2xl bg-card'>
        <div className='flex flex-col items-center text-center space-y-4 pt-2'>
          <div className='flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400'>
            <IconAlertCircle size={32} />
          </div>

          <div className='space-y-1.5'>
            <DialogTitle className='text-base font-bold text-foreground'>
              Proses penggajian sudah siap
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground leading-relaxed max-w-sm'>
              Kalkulasi gaji periode <b className='text-foreground'>{periodName}</b> untuk{' '}
              <b className='text-foreground'>{employeeCount} karyawan</b> akan digenerate
              berdasarkan sinkronisasi presensi dan komponen aktif.
            </DialogDescription>
          </div>

          <div className='w-full pt-4 flex items-center justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className='flex-1 h-9.5 text-xs font-semibold rounded-xl'
            >
              Batal / Periksa Ulang
            </Button>
            <Button
              type='button'
              onClick={onConfirm}
              disabled={isProcessing}
              className='flex-1 h-9.5 text-xs font-semibold rounded-xl bg-primary shadow-sm'
            >
              {isProcessing ? 'Memproses...' : 'Generate Payroll'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
