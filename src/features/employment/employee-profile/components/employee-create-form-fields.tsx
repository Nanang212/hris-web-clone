import { IconUpload } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRef } from 'react'
import { Controller, useFormContext, type FieldPath } from 'react-hook-form'

import type {
  EmployeeCreateFormValues,
  SelectOption,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import { m } from '@/i18n/paraglide/messages'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

interface BaseFieldProps {
  name: FieldPath<EmployeeCreateFormValues>
  label: string
  required?: boolean
}

function FormLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <FieldLabel>
      {children}
      {required && <span className='text-destructive'>*</span>}
    </FieldLabel>
  )
}

export function EmployeeTextField({
  name,
  label,
  required,
  type,
}: BaseFieldProps & { type?: React.HTMLInputTypeAttribute }) {
  const { register, getFieldState, formState } = useFormContext<EmployeeCreateFormValues>()
  const error = getFieldState(name, formState).error

  return (
    <Field data-invalid={Boolean(error)}>
      <FormLabel required={required}>{label}</FormLabel>
      <Input type={type} aria-invalid={Boolean(error)} {...register(name)} />
      <FieldError errors={[error]} />
    </Field>
  )
}

export function EmployeeTextareaField({
  name,
  label,
  required,
  className,
}: BaseFieldProps & { className?: string }) {
  const { register, getFieldState, formState } = useFormContext<EmployeeCreateFormValues>()
  const error = getFieldState(name, formState).error

  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <FormLabel required={required}>{label}</FormLabel>
      <Textarea aria-invalid={Boolean(error)} {...register(name)} />
      <FieldError errors={[error]} />
    </Field>
  )
}

export function EmployeeSelectField({
  name,
  label,
  options,
  required,
}: BaseFieldProps & { options: SelectOption[] }) {
  const { control } = useFormContext<EmployeeCreateFormValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FormLabel required={required}>{label}</FormLabel>
          <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
            <SelectTrigger className='w-full' aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={m.employee_information_create_select_placeholder()} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

export function EmployeeFileField({
  name,
  label,
  accept = 'application/pdf,image/jpeg,image/png',
}: BaseFieldProps & { accept?: string }) {
  const { control } = useFormContext<EmployeeCreateFormValues>()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const fileName = String(field.value ?? '')

        return (
          <Field data-invalid={fieldState.invalid}>
            <FormLabel>{label}</FormLabel>
            <input
              ref={inputRef}
              className='sr-only'
              type='file'
              accept={accept}
              onChange={(event) => field.onChange(event.target.files?.[0]?.name ?? '')}
            />
            <button
              type='button'
              className='flex h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-dashed bg-background px-3 text-left text-sm transition-colors hover:border-primary/60 hover:bg-muted/50'
              onClick={() => inputRef.current?.click()}
            >
              <IconUpload className='size-4 shrink-0 text-primary' />
              <span className='min-w-0 flex-1 truncate'>{fileName || label}</span>
            </button>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )
      }}
    />
  )
}

export function EmployeeDateField({ name, label, required }: BaseFieldProps) {
  const { control } = useFormContext<EmployeeCreateFormValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FormLabel required={required}>{label}</FormLabel>
          <DatePicker
            mode='single'
            className='w-full'
            aria-invalid={fieldState.invalid}
            selected={
              typeof field.value === 'string' && field.value
                ? dayjs(field.value).toDate()
                : undefined
            }
            onSelect={(date) => field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')}
            placeholder={m.employee_information_create_date_placeholder()}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

export function EmployeeBooleanField({ name, label }: BaseFieldProps) {
  const { control } = useFormContext<EmployeeCreateFormValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FieldLabel className='h-10 flex-row items-center justify-start rounded-xl border bg-background px-3 transition-colors hover:bg-muted/50'>
          <Checkbox checked={Boolean(field.value)} onCheckedChange={field.onChange} />
          <span>{label}</span>
        </FieldLabel>
      )}
    />
  )
}
