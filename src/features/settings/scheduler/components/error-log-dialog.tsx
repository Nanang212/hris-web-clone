import { IconAlertTriangle, IconClock, IconX } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

import type { ScheduledJob } from '../types'

interface ErrorLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: ScheduledJob | null
}

export function ErrorLogDialog({ open, onOpenChange, job }: Readonly<ErrorLogDialogProps>) {
  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg p-6'>
        <DialogHeader>
          <div className='flex items-center gap-2.5 text-red-600 dark:text-red-400'>
            <IconAlertTriangle size={20} />
            <DialogTitle className='text-base font-semibold'>Error Log — {job.name}</DialogTitle>
          </div>
          <DialogDescription className='text-xs text-muted-foreground'>
            Modul {job.module} · Terjadi pada eksekusi terakhir
          </DialogDescription>
        </DialogHeader>

        <div className='my-2 space-y-3'>
          <div className='flex items-center gap-2 text-xs font-mono text-muted-foreground'>
            <IconClock size={14} />
            <span>{job.errorLog?.timestamp ?? job.lastRun}</span>
            {job.errorLog?.code && (
              <span className='rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300'>
                {job.errorLog.code}
              </span>
            )}
          </div>

          <div className='rounded-xl border border-red-200/80 bg-red-50/70 p-3.5 font-mono text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'>
            {job.errorLog?.message ?? 'Unknown execution error occurred.'}
          </div>

          {job.errorLog?.details && (
            <div className='rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground'>
              <p className='font-semibold text-foreground mb-1'>Rincian Diagnostik:</p>
              <p className='leading-relaxed'>{job.errorLog.details}</p>
            </div>
          )}
        </div>

        <DialogFooter className='sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            className='text-xs'
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
