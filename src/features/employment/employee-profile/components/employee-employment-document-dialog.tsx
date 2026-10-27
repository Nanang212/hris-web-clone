import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
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
import { useUploadEmployeeEmploymentDocument } from '@/features/employment/employee-profile/hooks'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeEmploymentDocumentDialogProps {
  employeeId: string
  periodId: string
  periodLabel: string
  onClose: () => void
}

export function EmployeeEmploymentDocumentDialog({
  employeeId,
  periodId,
  periodLabel,
  onClose,
}: EmployeeEmploymentDocumentDialogProps) {
  const [requestId] = useState(() => crypto.randomUUID())
  const mutation = useUploadEmployeeEmploymentDocument()
  const schema = useSchema(() => ({
    title: z
      .string()
      .trim()
      .min(1, m.employee_history_required())
      .max(150, m.employee_history_too_long()),
    category: z.enum(['contract', 'employment_certificate', 'screening', 'other']),
    notes: z.string().trim().max(4000, m.employee_history_too_long()),
    file: z
      .file({ error: m.employee_history_required() })
      .max(10 * 1024 * 1024, m.employee_history_file_size())
      .mime(['application/pdf', 'image/jpeg', 'image/png'], m.employee_history_file_type())
      .refine((file) => /\.(pdf|jpe?g|png)$/i.test(file.name), m.employee_history_file_type()),
  }))
  type Values = z.infer<typeof schema>
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', category: 'contract', notes: '', file: undefined },
  })
  const categories = {
    contract: m.employee_history_contract(),
    employment_certificate: m.employee_history_employment_certificate(),
    screening: m.employee_history_screening(),
    other: m.employee_history_other(),
  }
  const submit = (input: Values) =>
    mutation.mutate(
      { employeeId, periodId, input, requestId },
      {
        onSuccess: () => {
          snackbar.success(m.employee_history_document_success())
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
          <DialogTitle>{m.employee_history_add_document()}</DialogTitle>
          <DialogDescription className='flex flex-col gap-1'>
            <span>{periodLabel}</span>
            <span>{m.employee_history_document_description()}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <FieldGroup>
            <Field data-disabled={mutation.isPending} data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor='history-document-title'>
                {m.employee_history_document_title()}
              </FieldLabel>
              <Input
                id='history-document-title'
                maxLength={150}
                disabled={mutation.isPending}
                aria-invalid={Boolean(errors.title)}
                {...register('title')}
              />
              <FieldError errors={[errors.title]} />
            </Field>
            <Field data-disabled={mutation.isPending} data-invalid={Boolean(errors.category)}>
              <FieldLabel htmlFor='history-document-category'>
                {m.employee_history_document_category()}
              </FieldLabel>
              <Controller
                name='category'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger
                      id='history-document-category'
                      className='w-full'
                      aria-invalid={Boolean(errors.category)}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(categories).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.category]} />
            </Field>
            <Field data-disabled={mutation.isPending} data-invalid={Boolean(errors.file)}>
              <FieldLabel htmlFor='history-document-file'>
                {m.employee_history_document_file()}
              </FieldLabel>
              <Controller
                name='file'
                control={control}
                render={({ field }) => (
                  <Input
                    id='history-document-file'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    disabled={mutation.isPending}
                    aria-invalid={Boolean(errors.file)}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.files?.[0])}
                  />
                )}
              />
              <FieldDescription>{m.employee_history_document_hint()}</FieldDescription>
              <FieldError errors={[errors.file]} />
            </Field>
            <Field data-disabled={mutation.isPending} data-invalid={Boolean(errors.notes)}>
              <FieldLabel htmlFor='history-document-notes'>{m.employee_history_notes()}</FieldLabel>
              <Textarea
                id='history-document-notes'
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
