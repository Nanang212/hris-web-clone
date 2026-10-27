import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/components/ui/button'
import { DatePicker } from '@/shared/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { useCreateEmployeeEmploymentScreening } from '@/features/employment/employee-profile/hooks'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeEmploymentScreeningDialogProps {
  employeeId: string
  periodId: string
  periodLabel: string
  onClose: () => void
}

export function EmployeeEmploymentScreeningDialog({
  employeeId,
  periodId,
  periodLabel,
  onClose,
}: EmployeeEmploymentScreeningDialogProps) {
  const [requestId] = useState(() => crypto.randomUUID())
  const mutation = useCreateEmployeeEmploymentScreening()
  const schema = useSchema(() => ({
    screeningDate: z
      .string()
      .refine(
        (value) =>
          /^\d{4}-\d{2}-\d{2}$/.test(value) &&
          dayjs(value).isValid() &&
          dayjs(value).format('YYYY-MM-DD') === value &&
          !dayjs(value).isAfter(dayjs(), 'day'),
        m.employee_history_invalid_date(),
      ),
    result: z.enum(['passed', 'follow_up', 'not_recommended']),
    notes: z
      .string()
      .trim()
      .min(1, m.employee_history_required())
      .max(4000, m.employee_history_too_long()),
  }))
  type Values = z.infer<typeof schema>
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { screeningDate: dayjs().format('YYYY-MM-DD'), result: 'follow_up', notes: '' },
  })
  const results = {
    passed: m.employee_history_result_passed(),
    follow_up: m.employee_history_result_follow_up(),
    not_recommended: m.employee_history_result_not_recommended(),
  }
  const submit = (input: Values) =>
    mutation.mutate(
      { employeeId, periodId, input, requestId },
      {
        onSuccess: () => {
          snackbar.success(m.employee_history_screening_success())
          onClose()
        },
        onError: (error) => snackbar.exception(error),
      },
    )
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose()
      }}
    >
      <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{m.employee_history_record_screening()}</DialogTitle>
          <DialogDescription className='flex flex-col gap-1'>
            <span>{periodLabel}</span>
            <span>{m.employee_history_screening_description()}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <FieldGroup>
            <FieldGroup className='grid gap-4 sm:grid-cols-2'>
              <Field
                data-disabled={mutation.isPending}
                data-invalid={Boolean(errors.screeningDate)}
              >
                <FieldLabel htmlFor='history-screening-date'>
                  {m.employee_history_screening_date()}
                </FieldLabel>
                <Controller
                  name='screeningDate'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id='history-screening-date'
                      mode='single'
                      className='w-full'
                      disabled={mutation.isPending}
                      selected={field.value ? dayjs(field.value).toDate() : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                      aria-invalid={Boolean(errors.screeningDate)}
                      placeholder={m.employee_history_screening_date()}
                    />
                  )}
                />
                <FieldError errors={[errors.screeningDate]} />
              </Field>
              <Field data-disabled={mutation.isPending} data-invalid={Boolean(errors.result)}>
                <FieldLabel htmlFor='history-screening-result'>
                  {m.employee_history_screening_result()}
                </FieldLabel>
                <Controller
                  name='result'
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mutation.isPending}
                    >
                      <SelectTrigger
                        id='history-screening-result'
                        className='w-full'
                        aria-invalid={Boolean(errors.result)}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(results).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.result]} />
              </Field>
            </FieldGroup>
            <Field data-disabled={mutation.isPending} data-invalid={Boolean(errors.notes)}>
              <FieldLabel htmlFor='history-screening-notes'>
                {m.employee_history_notes()}
              </FieldLabel>
              <Textarea
                id='history-screening-notes'
                maxLength={4000}
                disabled={mutation.isPending}
                aria-invalid={Boolean(errors.notes)}
                {...register('notes')}
              />
              <FieldError errors={[errors.notes]} />
            </Field>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                disabled={mutation.isPending}
                onClick={onClose}
              >
                {m.employee_history_cancel()}
              </Button>
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending && <Spinner data-icon='inline-start' />}
                {m.employee_history_save()}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
