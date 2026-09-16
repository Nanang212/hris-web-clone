import {
  IconClock,
  IconLoader2,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react'
import { useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/utils'

import { allWorkDays, workDayLabels } from '../data'
import type {
  CreateWorkScheduleInput,
  ShiftSession,
  ShiftType,
  WorkDay,
  WorkSchedule,
} from '../types'

interface ShiftFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: WorkSchedule
  onSubmit: (data: CreateWorkScheduleInput) => Promise<void>
  isPending: boolean
}

const defaultSession = (): ShiftSession => ({ label: '', startTime: '08:00', endTime: '17:00' })

export function ShiftFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending,
}: Readonly<ShiftFormDialogProps>) {
  const isEdit = !!initialData

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkScheduleInput>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'regular',
      sessions: [defaultSession()],
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      gracePeriodMinutes: 15,
      breakDurationMinutes: 60,
      overtimeThresholdMinutes: 30,
      status: 'active',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'sessions' })
  const watchType = watch('type')
  const watchWorkDays = watch('workDays')

  useEffect(() => {
    if (!open) return
    if (initialData) {
      reset({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description,
        type: initialData.type,
        sessions: initialData.sessions,
        workDays: initialData.workDays,
        gracePeriodMinutes: initialData.gracePeriodMinutes,
        breakDurationMinutes: initialData.breakDurationMinutes,
        overtimeThresholdMinutes: initialData.overtimeThresholdMinutes,
        status: initialData.status,
      })
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        type: 'regular',
        sessions: [defaultSession()],
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        gracePeriodMinutes: 15,
        breakDurationMinutes: 60,
        overtimeThresholdMinutes: 30,
        status: 'active',
      })
    }
  }, [open, initialData, reset])

  const handleTypeChange = (val: ShiftType) => {
    setValue('type', val)
    if (val === 'regular') {
      setValue('sessions', [{ label: 'Kerja', startTime: '08:00', endTime: '17:00' }])
    } else if (val === 'shifting') {
      setValue('sessions', [{ label: 'Pagi', startTime: '06:00', endTime: '14:00' }])
    } else {
      setValue('sessions', [
        { label: 'Sesi Pagi', startTime: '08:00', endTime: '12:00' },
        { label: 'Sesi Sore', startTime: '16:00', endTime: '21:00' },
      ])
    }
  }

  const toggleWorkDay = (day: WorkDay) => {
    const current = watchWorkDays ?? []
    if (current.includes(day)) {
      setValue('workDays', current.filter((d) => d !== day))
    } else {
      setValue('workDays', [...current, day])
    }
  }

  const typeConfig: Record<ShiftType, { label: string; hint: string; badge: string }> = {
    regular: {
      label: 'Regular',
      hint: 'Satu sesi kerja penuh, contoh 08:00-17:00',
      badge: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40',
    },
    shifting: {
      label: 'Shifting',
      hint: 'Rotasi shift, contoh Pagi / Siang / Malam',
      badge: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40',
    },
    split: {
      label: 'Jam Penggal',
      hint: 'Dua sesi terpisah dengan jeda panjang',
      badge: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40',
    },
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  const canAddSession = watchType === 'shifting' || watchType === 'split'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] w-full flex-col overflow-hidden p-0 sm:max-w-4xl'>
        <DialogHeader className='shrink-0 border-b border-border/60 px-7 pt-6 pb-5'>
          <DialogTitle className='text-lg font-semibold'>
            {isEdit ? 'Edit Jadwal Kerja' : 'Tambah Jadwal Kerja'}
          </DialogTitle>
          <p className='mt-0.5 text-sm text-muted-foreground'>
            {isEdit
              ? 'Perbarui konfigurasi jam dan hari kerja'
              : 'Buat jadwal kerja baru dengan konfigurasi sesi dan hari kerja'}
          </p>
        </DialogHeader>

        <form
          id='shift-form'
          onSubmit={handleFormSubmit}
          noValidate
          className='flex-1 overflow-y-auto overflow-x-hidden'
        >
          <div className='grid grid-cols-1 divide-y divide-border/60 md:grid-cols-[1fr_260px] md:divide-x md:divide-y-0'>
            <div className='flex min-w-0 flex-col gap-6 px-7 py-6'>
              <div className='grid grid-cols-2 gap-4'>
                <Field data-invalid={!!errors.code}>
                  <FieldLabel htmlFor='shift-code'>Kode Jadwal *</FieldLabel>
                  <Input
                    id='shift-code'
                    placeholder='Contoh: WS-REG-01'
                    aria-invalid={!!errors.code}
                    {...register('code', { required: 'Kode wajib diisi' })}
                  />
                  <FieldError errors={errors.code ? [errors.code] : undefined} />
                </Field>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor='shift-name'>Nama Jadwal *</FieldLabel>
                  <Input
                    id='shift-name'
                    placeholder='Contoh: Jam Kerja Reguler'
                    aria-invalid={!!errors.name}
                    {...register('name', { required: 'Nama wajib diisi' })}
                  />
                  <FieldError errors={errors.name ? [errors.name] : undefined} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor='shift-desc'>Deskripsi</FieldLabel>
                <Textarea
                  id='shift-desc'
                  placeholder='Keterangan singkat tentang jadwal ini...'
                  rows={2}
                  {...register('description')}
                />
              </Field>

              <Field>
                <FieldLabel>Tipe Jadwal *</FieldLabel>
                <div className='grid grid-cols-3 gap-3'>
                  {(Object.entries(typeConfig) as [ShiftType, typeof typeConfig.regular][]).map(
                    ([val, cfg]) => (
                      <button
                        key={val}
                        type='button'
                        onClick={() => handleTypeChange(val)}
                        className={cn(
                          'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                          watchType === val
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:bg-muted/40',
                        )}
                      >
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            cfg.badge,
                          )}
                        >
                          {cfg.label}
                        </span>
                        <span className='text-xs leading-snug text-muted-foreground'>
                          {cfg.hint}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </Field>

              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <span className='text-sm font-medium'>Sesi Kerja</span>
                    <span className='ml-2 text-xs text-muted-foreground'>
                      {watchType === 'regular'
                        ? '— satu sesi penuh'
                        : watchType === 'shifting'
                          ? '— satu shift per baris'
                          : '— minimal 2 sesi'}
                    </span>
                  </div>
                  {canAddSession && (
                    <button
                      type='button'
                      onClick={() => append(defaultSession())}
                      className='flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary'
                    >
                      <IconPlus size={12} />
                      Tambah Sesi
                    </button>
                  )}
                </div>

                <div className='flex flex-col gap-2'>
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className='grid grid-cols-[1fr_110px_110px_36px] items-end gap-2 rounded-xl bg-muted/25 px-3 py-3'
                    >
                      <Field>
                        <FieldLabel className='text-xs text-muted-foreground'>
                          Label Sesi
                        </FieldLabel>
                        <Input
                          placeholder={
                            watchType === 'shifting'
                              ? 'Pagi / Siang / Malam'
                              : 'Contoh: Sesi Pagi'
                          }
                          className='h-9 text-sm'
                          {...register(`sessions.${idx}.label`)}
                        />
                      </Field>

                      <Field>
                        <FieldLabel className='text-xs text-muted-foreground'>Mulai</FieldLabel>
                        <div className='relative'>
                          <IconClock
                            size={13}
                            className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                          />
                          <Input
                            type='time'
                            className='h-9 pl-8 text-sm'
                            {...register(`sessions.${idx}.startTime`, { required: true })}
                          />
                        </div>
                      </Field>

                      <Field>
                        <FieldLabel className='text-xs text-muted-foreground'>Selesai</FieldLabel>
                        <div className='relative'>
                          <IconClock
                            size={13}
                            className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                          />
                          <Input
                            type='time'
                            className='h-9 pl-8 text-sm'
                            {...register(`sessions.${idx}.endTime`, { required: true })}
                          />
                        </div>
                      </Field>

                      {canAddSession && fields.length > 1 ? (
                        <button
                          type='button'
                          onClick={() => remove(idx)}
                          className='flex size-9 items-center justify-center self-end rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive'
                        >
                          <IconMinus size={13} />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-5 bg-muted/10 px-6 py-6'>
              <div>
                <p className='mb-2 text-sm font-medium'>Hari Kerja *</p>
                <div className='grid grid-cols-2 gap-1.5'>
                  {allWorkDays.map((day) => {
                    const isChecked = (watchWorkDays ?? []).includes(day)
                    return (
                      <button
                        key={day}
                        type='button'
                        onClick={() => toggleWorkDay(day)}
                        className={cn(
                          'rounded-lg border py-2 text-center text-xs font-semibold transition-all',
                          isChecked
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                        )}
                      >
                        {workDayLabels[day]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className='border-t border-border/50' />

              <div>
                <p className='mb-1.5 text-xs font-medium text-muted-foreground'>
                  Toleransi Terlambat
                </p>
                <div className='relative'>
                  <Input
                    id='grace-period'
                    type='number'
                    min={0}
                    max={120}
                    className='h-9 pr-14 text-sm'
                    {...register('gracePeriodMinutes', { valueAsNumber: true })}
                  />
                  <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground'>
                    menit
                  </span>
                </div>
              </div>

              <div>
                <p className='mb-1.5 text-xs font-medium text-muted-foreground'>
                  Durasi Istirahat
                </p>
                <div className='relative'>
                  <Input
                    id='break-duration'
                    type='number'
                    min={0}
                    max={180}
                    className='h-9 pr-14 text-sm'
                    {...register('breakDurationMinutes', { valueAsNumber: true })}
                  />
                  <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground'>
                    menit
                  </span>
                </div>
              </div>

              <div>
                <p className='mb-1.5 text-xs font-medium text-muted-foreground'>Batas Overtime</p>
                <div className='relative'>
                  <Input
                    id='overtime-threshold'
                    type='number'
                    min={0}
                    className='h-9 pr-14 text-sm'
                    {...register('overtimeThresholdMinutes', { valueAsNumber: true })}
                  />
                  <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground'>
                    menit
                  </span>
                </div>
              </div>

              <div className='border-t border-border/50' />

              <div className='flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3'>
                <div>
                  <p className='text-xs font-semibold'>Status Aktif</p>
                  <p className='mt-0.5 text-[11px] leading-snug text-muted-foreground'>
                    Dapat digunakan untuk penugasan
                  </p>
                </div>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id='shift-status'
                      checked={field.value === 'active'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'active' : 'inactive')
                      }
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className='shrink-0 border-t border-border/60 px-7 py-4'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='rounded-xl border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-muted'
          >
            Batal
          </button>
          <Button type='submit' form='shift-form' disabled={isPending}>
            {isPending && <IconLoader2 className='animate-spin' />}
            {isEdit ? 'Simpan Perubahan' : 'Tambah Jadwal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
