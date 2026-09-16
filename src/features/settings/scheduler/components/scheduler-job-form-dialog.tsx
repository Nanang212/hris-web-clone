import { IconLoader2 } from '@tabler/icons-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'

import type { CreateScheduledJobInput, ScheduledJob, SchedulerModule } from '../types'

const modules: SchedulerModule[] = [
  'Attendance',
  'Leave',
  'Payroll',
  'Employee',
  'Workflow',
  'System',
  'Overtime',
  'Claim',
  'Business Trip',
]

interface SchedulerJobFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ScheduledJob
  onSubmit: (data: CreateScheduledJobInput) => Promise<void>
  isPending: boolean
}

export function SchedulerJobFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending,
}: Readonly<SchedulerJobFormDialogProps>) {
  const isEdit = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateScheduledJobInput>({
    defaultValues: {
      name: '',
      module: 'Attendance',
      frequency: 'Daily · 00:00',
      status: 'active',
      description: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        module: initialData.module,
        frequency: initialData.frequency,
        status: initialData.status,
        description: initialData.description ?? '',
      })
    } else {
      reset({
        name: '',
        module: 'Attendance',
        frequency: 'Daily · 01:00',
        status: 'active',
        description: '',
      })
    }
  }, [initialData, reset, open])

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg p-6'>
        <DialogHeader>
          <DialogTitle className='text-base font-bold'>
            {isEdit ? 'Edit Scheduler' : 'Add Scheduler'}
          </DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground'>
            {isEdit
              ? 'Perbarui konfigurasi jadwal eksekusi otomatis job'
              : 'Buat konfigurasi proses background job baru'}
          </DialogDescription>
        </DialogHeader>

        <form id='scheduler-job-form' onSubmit={handleFormSubmit} className='space-y-4 py-2'>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor='job-name'>Nama Scheduler *</FieldLabel>
            <Input
              id='job-name'
              placeholder='Contoh: Daily Attendance Processing'
              {...register('name', { required: 'Nama scheduler wajib diisi' })}
            />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>

          <div className='grid grid-cols-2 gap-3'>
            <Field>
              <FieldLabel htmlFor='job-module'>Modul HRIS *</FieldLabel>
              <Controller
                name='module'
                control={control}
                render={({ field }) => (
                  <select
                    id='job-module'
                    value={field.value}
                    onChange={field.onChange}
                    className='h-9 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30'
                  >
                    {modules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                )}
              />
            </Field>

            <Field data-invalid={!!errors.frequency}>
              <FieldLabel htmlFor='job-freq'>Frekuensi Eksekusi *</FieldLabel>
              <Input
                id='job-freq'
                placeholder='Contoh: Daily · 01:00, Hourly'
                {...register('frequency', { required: 'Frekuensi wajib diisi' })}
              />
              <FieldError errors={errors.frequency ? [errors.frequency] : undefined} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor='job-desc'>Deskripsi</FieldLabel>
            <Textarea
              id='job-desc'
              rows={2}
              placeholder='Keterangan singkat tentang job ini...'
              {...register('description')}
            />
          </Field>
        </form>

        <DialogFooter className='flex gap-2 sm:justify-end'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className='rounded-xl border border-border px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted disabled:opacity-50'
          >
            Batal
          </button>
          <Button
            type='submit'
            form='scheduler-job-form'
            className='bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
            disabled={isPending}
          >
            {isPending && <IconLoader2 className='animate-spin size-4' />}
            {isEdit ? 'Simpan Perubahan' : 'Tambah Scheduler'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
