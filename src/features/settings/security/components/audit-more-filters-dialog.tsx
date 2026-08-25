import { zodResolver } from '@hookform/resolvers/zod'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useSchema } from '@/shared/lib/schema'
import type { AuditTrailFilterOptions } from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

export interface AuditTrailMoreFilterValues {
  roleId: string
  branchId: string
  entityType: string
  result: string
  source: string
  device: string
  correlationId: string
}

interface AuditMoreFiltersDialogProps {
  values: AuditTrailMoreFilterValues
  options: AuditTrailFilterOptions
  onApply: (values: AuditTrailMoreFilterValues) => void
  onClear: () => void
  onOpenChange: (open: boolean) => void
}

interface FilterSelectProps {
  id: string
  label: string
  value: string
  allLabel: string
  options: AuditTrailFilterOptions['roles']
  onChange: (value: string) => void
}

function FilterSelect({
  id,
  label,
  value,
  allLabel,
  options,
  onChange,
}: Readonly<FilterSelectProps>) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value='All'>{allLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

export function AuditMoreFiltersDialog({
  values,
  options,
  onApply,
  onClear,
  onOpenChange,
}: Readonly<AuditMoreFiltersDialogProps>) {
  const schema = useSchema((z) => ({
    roleId: z.string(),
    branchId: z.string(),
    entityType: z.string(),
    result: z.string(),
    source: z.string(),
    device: z.string().trim().max(100, { message: m.security_audit_device_invalid() }),
    correlationId: z.string().trim().max(100, { message: m.security_audit_correlation_invalid() }),
  }))
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: values,
  })

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{m.security_audit_more_filters_title()}</DialogTitle>
          <DialogDescription>{m.security_audit_more_filters_description()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onApply)} noValidate>
          <FieldGroup className='grid gap-4 sm:grid-cols-2'>
            <Controller
              name='roleId'
              control={control}
              render={({ field }) => (
                <FilterSelect
                  id='audit-role'
                  label={m.security_audit_role_label()}
                  value={field.value}
                  allLabel={m.security_audit_all_roles()}
                  options={options.roles}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name='branchId'
              control={control}
              render={({ field }) => (
                <FilterSelect
                  id='audit-branch'
                  label={m.security_audit_branch_label()}
                  value={field.value}
                  allLabel={m.security_audit_all_branches()}
                  options={options.branches}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name='entityType'
              control={control}
              render={({ field }) => (
                <FilterSelect
                  id='audit-entity-type'
                  label={m.security_audit_entity_type_label()}
                  value={field.value}
                  allLabel={m.security_audit_all_entity_types()}
                  options={options.entityTypes}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name='result'
              control={control}
              render={({ field }) => (
                <FilterSelect
                  id='audit-result'
                  label={m.security_audit_result_label()}
                  value={field.value}
                  allLabel={m.security_audit_all_results()}
                  options={options.results}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name='source'
              control={control}
              render={({ field }) => (
                <FilterSelect
                  id='audit-source'
                  label={m.security_audit_source_label()}
                  value={field.value}
                  allLabel={m.security_audit_all_sources()}
                  options={options.sources}
                  onChange={field.onChange}
                />
              )}
            />
            <Field data-invalid={!!errors.device}>
              <FieldLabel htmlFor='audit-device'>{m.security_audit_device_label()}</FieldLabel>
              <Input
                id='audit-device'
                placeholder={m.security_audit_device_placeholder()}
                aria-invalid={!!errors.device}
                {...register('device')}
              />
              <FieldError errors={errors.device ? [errors.device] : undefined} />
            </Field>
            <Field className='sm:col-span-2' data-invalid={!!errors.correlationId}>
              <FieldLabel htmlFor='audit-correlation-id'>
                {m.security_audit_correlation_label()}
              </FieldLabel>
              <Input
                id='audit-correlation-id'
                placeholder={m.security_audit_correlation_placeholder()}
                aria-invalid={!!errors.correlationId}
                {...register('correlationId')}
              />
              <FieldError errors={errors.correlationId ? [errors.correlationId] : undefined} />
            </Field>
          </FieldGroup>

          <DialogFooter className='mt-6'>
            <Button type='button' variant='outline' onClick={onClear}>
              {m.security_audit_more_filters_reset()}
            </Button>
            <Button type='submit'>{m.security_audit_more_filters_apply()}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
