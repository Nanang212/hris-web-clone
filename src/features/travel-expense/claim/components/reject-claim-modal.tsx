// src/features/travel-expense/claim/components/reject-claim-modal.tsx
import { IconAlertTriangle } from '@tabler/icons-react'
import { useState } from 'react'
import type { ClaimRecord } from '../../types'
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

interface RejectClaimModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: ClaimRecord | null
  onReject: (claimId: string, reason: string) => void
}

export function RejectClaimModal({
  open,
  onOpenChange,
  claim,
  onReject,
}: RejectClaimModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (!claim) return null

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Alasan penolakan wajib diisi.')
      return
    }
    setError('')
    onReject(claim.id, reason.trim())
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
                Tolak Pengajuan Klaim ({claim.claimNumber})
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Pengajuan oleh <strong>{claim.employeeName}</strong> senilai Rp{' '}
                {claim.amount.toLocaleString('id-ID')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6 space-y-4'>
          <div className='p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-300 leading-relaxed'>
            Memberitahukan karyawan bahwa klaim ini ditolak. Alasan penolakan akan dikirimkan secara otomatis via notifikasi sistem.
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
              placeholder='Contoh: Kwitansi tidak mencantumkan tanggal / melebihi plafon bulanan yang diizinkan...'
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
            Konfirmasi Tolak Klaim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
