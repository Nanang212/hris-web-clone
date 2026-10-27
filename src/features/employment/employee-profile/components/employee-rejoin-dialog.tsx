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
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { useRejoinEmployee } from '@/features/employment/employee-profile/hooks'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeRejoinDialogProps {
  employeeId: string
  name: string
  lastWorkingDate?: string | null
  onClose: () => void
}

export function EmployeeRejoinDialog({
  employeeId,
  name,
  lastWorkingDate,
  onClose,
}: EmployeeRejoinDialogProps) {
  const [requestId] = useState(() => crypto.randomUUID())
  const mutation = useRejoinEmployee()
  const baseSchema = useSchema(() => {
    const date = z
      .string()
      .refine(
        (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).isValid(),
        m.payroll_revision_period_invalid(),
      )
    return {
      joinDate: date.refine(
        (value) => !lastWorkingDate || dayjs(value).isAfter(lastWorkingDate, 'day'),
        m.payroll_revision_period_invalid(),
      ),
      contractStart: date,
      contractEnd: z.union([date, z.literal('')]),
      reference: z.string().trim().min(1, m.payroll_employee_components_name_required()),
      notes: z.string(),
    }
  })
  const schema = baseSchema.refine(
    (value) => !value.contractEnd || value.contractEnd >= value.contractStart,
    { path: ['contractEnd'], message: m.payroll_revision_period_invalid() },
  )
  type Values = z.infer<typeof schema>
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { joinDate: '', contractStart: '', contractEnd: '', reference: '', notes: '' },
  })
  const onSubmit = (values: Values) =>
    mutation.mutate(
      {
        employeeId,
        requestId,
        input: {
          joinDate: values.joinDate,
          contract: {
            startDate: values.contractStart,
            endDate: values.contractEnd || undefined,
            reference: values.reference,
          },
          notes: values.notes,
        },
      },
      {
        onSuccess: () => {
          snackbar.success(m.payroll_revision_rejoin_success())
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
      <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {m.payroll_revision_rejoin()} · {name}
          </DialogTitle>
          <DialogDescription>{m.payroll_revision_rejoin_description()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FieldGroup className='grid gap-4 sm:grid-cols-2'>
              {(['joinDate', 'contractStart', 'contractEnd'] as const).map((key) => (
                <Field key={key} data-invalid={Boolean(errors[key])}>
                  <FieldLabel htmlFor={`rejoin-${key}`}>
                    {
                      {
                        joinDate: m.payroll_revision_join_date(),
                        contractStart: m.payroll_revision_contract_start(),
                        contractEnd: m.payroll_revision_contract_end(),
                      }[key]
                    }
                  </FieldLabel>
                  <Controller
                    name={key}
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        mode='single'
                        id={`rejoin-${key}`}
                        className='w-full'
                        disabled={mutation.isPending}
                        placeholder={m.payroll_wizard_select_payment_date()}
                        selected={field.value ? dayjs(field.value).toDate() : undefined}
                        onSelect={(date) =>
                          field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                        }
                        aria-invalid={Boolean(errors[key])}
                      />
                    )}
                  />
                  <FieldError errors={[errors[key]]} />
                </Field>
              ))}
              <Field data-invalid={Boolean(errors.reference)}>
                <FieldLabel htmlFor='rejoin-reference'>
                  {m.payroll_revision_contract_reference()}
                </FieldLabel>
                <Input
                  id='rejoin-reference'
                  {...register('reference')}
                  disabled={mutation.isPending}
                  aria-invalid={Boolean(errors.reference)}
                />
                <FieldError errors={[errors.reference]} />
              </Field>
            </FieldGroup>
            <Field>
              <FieldLabel htmlFor='rejoin-notes'>{m.payroll_revision_rejoin_reason()}</FieldLabel>
              <Textarea id='rejoin-notes' {...register('notes')} disabled={mutation.isPending} />
            </Field>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={mutation.isPending}
              >
                {m.payroll_wizard_cancel()}
              </Button>
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending && <Spinner data-icon='inline-start' />}
                {m.payroll_revision_rejoin()}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
