import { IconCheck, IconLoader2, IconRotateClockwise } from '@tabler/icons-react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'

interface ResetDefaultConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isPending: boolean
}

export function ResetDefaultConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: Readonly<ResetDefaultConfirmDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size='md' className='sm:max-w-[480px] p-6'>
        <AlertDialogHeader className='flex flex-col items-center text-center'>
          <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'>
            <IconRotateClockwise size={26} stroke={2} />
          </div>
          <AlertDialogTitle className='text-lg font-bold tracking-tight text-foreground'>
            Reset scheduler to default?
          </AlertDialogTitle>
          <AlertDialogDescription className='mt-1 text-center text-xs leading-relaxed text-muted-foreground'>
            Semua konfigurasi scheduler akan dikembalikan ke pengaturan default sistem. Perubahan
            manual akan ditimpa.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Warning callout box */}
        <div className='my-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-left dark:border-amber-900/50 dark:bg-amber-950/30'>
          <p className='text-xs font-semibold text-amber-900 dark:text-amber-200'>
            Yang akan dikembalikan
          </p>
          <p className='mt-1 text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/85'>
            Frekuensi & waktu eksekusi · Status aktif/nonaktif · Retry policy & parameter default.
            Riwayat eksekusi tetap disimpan.
          </p>
        </div>

        <AlertDialogFooter className='flex gap-2 sm:justify-end'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className='rounded-xl border border-border px-5 py-2 text-xs font-semibold transition-colors hover:bg-muted disabled:opacity-50'
          >
            Cancel
          </button>
          <Button
            type='button'
            variant='destructive'
            className='gap-1.5 bg-red-600 text-xs font-semibold text-white hover:bg-red-700'
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <IconLoader2 size={15} className='animate-spin' />
            ) : (
              <IconRotateClockwise size={15} />
            )}
            Reset Default
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface ResetDefaultSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalRestored?: number
}

export function ResetDefaultSuccessDialog({
  open,
  onOpenChange,
  totalRestored = 26,
}: Readonly<ResetDefaultSuccessDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size='md' className='sm:max-w-[460px] p-6'>
        <AlertDialogHeader className='flex flex-col items-center text-center'>
          <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'>
            <IconCheck size={26} stroke={2.5} />
          </div>
          <AlertDialogTitle className='text-lg font-bold tracking-tight text-foreground'>
            Scheduler defaults restored
          </AlertDialogTitle>
          <AlertDialogDescription className='mt-1 text-center text-xs leading-relaxed text-muted-foreground'>
            Konfigurasi scheduler sudah dikembalikan ke default sistem. Riwayat eksekusi tetap
            tersimpan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Success info callout */}
        <div className='my-3 rounded-2xl border border-blue-200/80 bg-blue-50/70 p-3.5 text-center dark:border-blue-900/50 dark:bg-blue-950/30'>
          <p className='text-xs font-medium text-blue-700 dark:text-blue-300'>
            {totalRestored} scheduler configurations restored · Execution history preserved
          </p>
        </div>

        <AlertDialogFooter className='sm:justify-center'>
          <Button
            type='button'
            className='w-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
