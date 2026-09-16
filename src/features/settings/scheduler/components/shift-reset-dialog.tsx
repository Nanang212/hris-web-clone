import { IconAlertCircle, IconLoader2, IconRotateClockwise } from '@tabler/icons-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'

import type { ResetWorkScheduleOptions, WorkSchedule } from '../types'

interface ShiftResetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: WorkSchedule | null
  onConfirm: (options: ResetWorkScheduleOptions) => Promise<void>
  isPending: boolean
}

export function ShiftResetDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isPending,
}: Readonly<ShiftResetDialogProps>) {
  const [restoreTemplate, setRestoreTemplate] = useState(true)
  const [notifyEmployees, setNotifyEmployees] = useState(true)
  const [resetAssignments, setResetAssignments] = useState(false)

  const handleReset = async () => {
    await onConfirm({
      restoreTemplate,
      notifyEmployees,
      resetAssignments,
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size='md' className='sm:max-w-lg'>
        <AlertDialogHeader>
          <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50'>
            <IconRotateClockwise size={24} className='text-amber-600 dark:text-amber-400' />
          </div>
          <AlertDialogTitle className='text-center text-lg font-semibold'>
            Reset Jadwal Kerja
          </AlertDialogTitle>
          <AlertDialogDescription className='text-center text-sm text-muted-foreground'>
            Konfigurasi jadwal kerja{' '}
            <span className='font-semibold text-foreground'>{item?.name}</span>{' '}
            ({item?.code}) akan direset ke pengaturan template standar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='my-2 space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4'>
          <div className='flex items-start gap-2.5 text-xs text-muted-foreground'>
            <IconAlertCircle size={16} className='shrink-0 text-amber-500 mt-0.5' />
            <span>
              Tindakan ini akan memperbarui jam kerja dan sesi aktif sesuai dengan tipe jadwal{' '}
              <strong className='text-foreground uppercase'>{item?.type}</strong>.
            </span>
          </div>

          <div className='space-y-3 pt-1'>
            <div className='flex items-start space-x-3'>
              <Checkbox
                id='opt-template'
                checked={restoreTemplate}
                onCheckedChange={(checked) => setRestoreTemplate(!!checked)}
              />
              <div className='grid gap-0.5 leading-none'>
                <Label
                  htmlFor='opt-template'
                  className='cursor-pointer text-xs font-medium text-foreground'
                >
                  Kembalikan sesi & jam kerja ke template awal
                </Label>
                <p className='text-[11px] text-muted-foreground'>
                  Mengembalikan jam mulai, selesai, dan toleransi keterlambatan standar.
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <Checkbox
                id='opt-notify'
                checked={notifyEmployees}
                onCheckedChange={(checked) => setNotifyEmployees(!!checked)}
              />
              <div className='grid gap-0.5 leading-none'>
                <Label
                  htmlFor='opt-notify'
                  className='cursor-pointer text-xs font-medium text-foreground'
                >
                  Kirim notifikasi ke karyawan terdaftar
                </Label>
                <p className='text-[11px] text-muted-foreground'>
                  Memberi tahu {item?.totalEmployees ?? 0} karyawan terkait tentang pembaruan jadwal.
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <Checkbox
                id='opt-assignments'
                checked={resetAssignments}
                onCheckedChange={(checked) => setResetAssignments(!!checked)}
              />
              <div className='grid gap-0.5 leading-none'>
                <Label
                  htmlFor='opt-assignments'
                  className='cursor-pointer text-xs font-medium text-foreground'
                >
                  Kosongkan penugasan karyawan
                </Label>
                <p className='text-[11px] text-muted-foreground'>
                  Hapus penugasan karyawan pada jadwal ini (karyawan perlu ditugaskan ulang).
                </p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className='flex gap-2 sm:justify-end'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className='rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50'
          >
            Batal
          </button>
          <Button
            type='button'
            className='bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700'
            disabled={isPending}
            onClick={handleReset}
          >
            {isPending && <IconLoader2 className='animate-spin' />}
            <IconRotateClockwise size={16} />
            Reset Sekarang
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
