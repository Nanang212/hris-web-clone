// document-preview-dialog.tsx — High-fidelity document viewer popup modal
import {
  IconAward,
  IconBuildingBank,
  IconCheck,
  IconDownload,
  IconFileText,
  IconFileTypePdf,
  IconHeartbeat,
  IconId,
} from '@tabler/icons-react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { snackbar } from '@/shared/lib/snackbar'
import { downloadEmployeeDocument } from '@/features/employment/document/lib/download-helper'

export interface PreviewDocInfo {
  key: string
  name: string
  fieldLabel: string
  fieldValue?: string
  fileName?: string
  fileSize?: string
  employeeName: string
  employeeCode: string
  department: string
  status?: string
  verifiedAt?: string
}

interface DocumentPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: PreviewDocInfo | null
}

export function DocumentPreviewDialog({ open, onOpenChange, doc }: DocumentPreviewDialogProps) {
  if (!doc) return null

  const handleDownload = () => {
    downloadEmployeeDocument({
      name: doc.name,
      fileName: doc.fileName,
      fieldLabel: doc.fieldLabel,
      fieldValue: doc.fieldValue,
      employeeName: doc.employeeName,
      employeeCode: doc.employeeCode,
      department: doc.department,
      status: doc.status,
      verifiedAt: doc.verifiedAt,
    })
    snackbar.success(`Downloaded ${doc.fileName || doc.name} successfully!`)
  }

  const getDocIcon = () => {
    switch (doc.key) {
      case 'ktp':
      case 'kk':
        return <IconId size={20} className='text-primary' />
      case 'npwp':
      case 'bpjs_kes':
      case 'bpjs_tk':
        return <IconBuildingBank size={20} className='text-blue-600' />
      case 'certificate':
        return <IconAward size={20} className='text-purple-600' />
      case 'mcu':
        return <IconHeartbeat size={20} className='text-rose-600' />
      default:
        return <IconFileText size={20} className='text-primary' />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!block !max-h-[85vh] !overflow-y-auto !p-0 sm:max-w-[700px]'>
        {/* Modal Header */}
        <DialogHeader className='flex flex-row items-center justify-between border-b border-border/60 p-5'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              {getDocIcon()}
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <DialogTitle className='text-base font-bold text-foreground'>
                  {doc.name} Preview
                </DialogTitle>
                <Badge variant='green' className='py-0.2 px-2 text-[10px]'>
                  Verified
                </Badge>
              </div>
              <DialogDescription className='mt-0.5 text-xs text-muted-foreground'>
                {doc.employeeName} ({doc.employeeCode}) · {doc.department}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Document Canvas */}
        <div className='flex flex-col items-center gap-4 bg-muted/30 p-6'>
          {/* File Meta Pill */}
          <div className='flex w-full max-w-xl flex-wrap items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-2.5 text-xs shadow-xs'>
            <div className='flex items-center gap-2'>
              <IconFileTypePdf size={18} className='flex-shrink-0 text-rose-500' />
              <span className='font-semibold text-foreground'>
                {doc.fileName || `${doc.name}.pdf`}
              </span>
              <span className='text-[11px] text-muted-foreground'>
                ({doc.fileSize || '1.2 MB'})
              </span>
            </div>
            <span className='text-[11px] text-muted-foreground'>
              Uploaded: {doc.verifiedAt || '2026-08-24'}
            </span>
          </div>

          {/* Simulated Document Sheet */}
          <div className='relative w-full max-w-xl overflow-hidden rounded-xl border border-border/80 bg-background p-7 text-xs shadow-md select-none'>
            {/* Header / Watermark */}
            <div className='mb-5 flex items-start justify-between border-b border-border/60 pb-4'>
              <div>
                <p className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
                  OFFICIAL HR RECORD ARCHIVE
                </p>
                <h4 className='mt-0.5 text-sm font-bold text-foreground uppercase'>{doc.name}</h4>
                <p className='text-[11px] text-muted-foreground'>
                  Republic of Indonesia / Corporate Registry
                </p>
              </div>
              <div className='flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted font-mono text-[10px] font-bold text-muted-foreground'>
                DOC
              </div>
            </div>

            {/* Document Field Details */}
            <div className='my-5 space-y-3.5'>
              <div className='grid grid-cols-3 gap-2 border-b border-border/30 py-1.5'>
                <span className='font-semibold text-muted-foreground'>Holder Name:</span>
                <span className='col-span-2 font-bold text-foreground'>{doc.employeeName}</span>
              </div>

              <div className='grid grid-cols-3 gap-2 border-b border-border/30 py-1.5'>
                <span className='font-semibold text-muted-foreground'>Employee ID / NIP:</span>
                <span className='col-span-2 font-semibold text-foreground'>{doc.employeeCode}</span>
              </div>

              <div className='grid grid-cols-3 gap-2 border-b border-border/30 py-1.5'>
                <span className='font-semibold text-muted-foreground'>{doc.fieldLabel}:</span>
                <span className='col-span-2 font-mono font-bold text-primary'>
                  {doc.fieldValue || '3171012345678901'}
                </span>
              </div>

              <div className='grid grid-cols-3 gap-2 border-b border-border/30 py-1.5'>
                <span className='font-semibold text-muted-foreground'>Department:</span>
                <span className='col-span-2 text-foreground'>{doc.department}</span>
              </div>

              <div className='grid grid-cols-3 gap-2 border-b border-border/30 py-1.5'>
                <span className='font-semibold text-muted-foreground'>Verification Status:</span>
                <span className='col-span-2 flex items-center gap-1.5 font-semibold text-emerald-600'>
                  <IconCheck size={14} />
                  Verified by HR Operations
                </span>
              </div>
            </div>

            {/* Digital Stamp / Verification seal */}
            <div className='mt-6 flex items-center justify-between border-t border-border/40 pt-4'>
              <div className='text-[10px] text-muted-foreground'>
                <p>Archived at: HRIS Document Vault</p>
                <p>Checksum: SHA-256 Validated</p>
              </div>

              <div className='inline-flex rotate-[-3deg] items-center gap-1 rounded-lg border-2 border-emerald-600/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400'>
                <IconCheck size={12} strokeWidth={3} />
                VERIFIED COPY
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className='flex items-center justify-between border-t border-border/60 bg-card p-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleDownload}
            className='gap-1.5 text-xs font-semibold'
          >
            <IconDownload size={14} />
            Download Original
          </Button>

          <Button
            variant='default'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='text-xs font-semibold'
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
