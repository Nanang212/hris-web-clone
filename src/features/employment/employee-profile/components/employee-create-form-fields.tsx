import dayjs from 'dayjs'
import { Controller, useFormContext, type FieldPath } from 'react-hook-form'

import { Checkbox } from '@/shared/components/ui/checkbox'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { FileUploader } from '@/shared/components/ui/file-uploader'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/utils'
import type {
  EmployeeCreateFormValues,
  SelectOption,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import { m } from '@/i18n/paraglide/messages'

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

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        return (
          <Field data-invalid={fieldState.invalid}>
            <FormLabel>{label}</FormLabel>
            <FileUploader
              mode='SINGLE'
              value={typeof field.value === 'string' && field.value ? field.value : null}
              onFilesChange={field.onChange}
              accept={accept}
              placeholder={label}
            />
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
        <FieldLabel
          className={cn(
            'h-10 w-full flex-row items-center justify-start rounded-xl border border-border/70 bg-background px-3 transition-colors hover:bg-muted/50',
            Boolean(field.value) && 'border-primary/30 bg-primary/5',
          )}
        >
          <Checkbox
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            className='size-4 rounded-[4px]'
          />
          <span className='truncate text-sm'>{label}</span>
        </FieldLabel>
      )}
    />
  )
}
