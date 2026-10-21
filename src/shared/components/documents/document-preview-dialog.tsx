import { useState } from 'react'
import { IconFileText, IconPrinter, IconX } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { SpklDocumentPreview, type SpklDocumentPreviewProps } from './spkl-document-preview'
import { LeaveDocumentPreview, type LeaveDocumentPreviewProps } from './leave-document-preview'

export interface DocumentPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'overtime' | 'leave'
  spklProps?: SpklDocumentPreviewProps
  leaveProps?: LeaveDocumentPreviewProps
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  type,
  spklProps,
  leaveProps,
}: DocumentPreviewDialogProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl'>
        <DialogHeader className='flex flex-row items-center justify-between pb-3 border-b border-border'>
          <div className='flex items-center gap-2'>
            <div className='size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <IconFileText size={18} />
            </div>
            <div>
              <DialogTitle className='text-sm sm:text-base font-bold text-foreground'>
                {type === 'overtime'
                  ? 'Preview Surat Perintah Kerja Lembur (SPKL)'
                  : 'Preview Formulir Permohonan Cuti / Izin'}
              </DialogTitle>
              <p className='text-[11px] text-muted-foreground'>
                Dokumen resmi PT. Bintang Fajar Persada sebelum persetujuan
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handlePrint}
              className='gap-1.5 text-xs'
            >
              <IconPrinter size={14} />
              <span>Cetak Dokumen</span>
            </Button>
          </div>
        </DialogHeader>

        <div className='mt-2'>
          {type === 'overtime' && spklProps && (
            <SpklDocumentPreview {...spklProps} />
          )}

          {type === 'leave' && leaveProps && (
            <LeaveDocumentPreview {...leaveProps} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
