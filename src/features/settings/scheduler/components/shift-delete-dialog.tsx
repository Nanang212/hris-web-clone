import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'

import type { WorkSchedule } from '../types'

interface ShiftDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: WorkSchedule | null
  onConfirm: () => Promise<void>
  isPending: boolean
}

export function ShiftDeleteDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isPending,
}: Readonly<ShiftDeleteDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size='sm'>
        <AlertDialogHeader>
          <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40'>
            <IconAlertTriangle size={24} className='text-red-600 dark:text-red-400' />
          </div>
          <AlertDialogTitle className='text-center text-base'>Hapus Jadwal Kerja?</AlertDialogTitle>
          <AlertDialogDescription className='text-center text-sm'>
            Jadwal{' '}
            <span className='font-semibold text-foreground'>{item?.name}</span>{' '}
            ({item?.code}) akan dihapus permanen.
            {item && item.totalEmployees > 0 && (
              <span className='mt-1 block text-amber-600 dark:text-amber-400'>
                ⚠ Masih ada {item.totalEmployees} karyawan menggunakan jadwal ini.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex gap-2 sm:justify-center'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className='flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50'
          >
            Batal
          </button>
          <Button
            variant='destructive'
            className='flex-1'
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <IconLoader2 className='animate-spin' />}
            Hapus
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
