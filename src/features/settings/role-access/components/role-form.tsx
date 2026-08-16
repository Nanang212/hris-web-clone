import { zodResolver } from '@hookform/resolvers/zod'
import { IconChevronDown, IconSearch } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { cn } from '@/shared/lib/utils'
import type {
  CreateRolePayload,
  RoleEligibilityOption,
  RoleEligibilityOptions,
} from '@/features/settings/role-access/types'
import { m } from '@/i18n/paraglide/messages'

type RoleFormProps = Readonly<{
  mode: 'create' | 'edit'
  defaultValues: CreateRolePayload
  eligibilityOptions: RoleEligibilityOptions
  isPending: boolean
  onSubmit: (values: CreateRolePayload) => void
}>

type EligibilityDropdownProps = Readonly<{
  id: string
  options: RoleEligibilityOption[]
  selectedIds: string[]
  placeholder: string
  countLabel: string
  invalid: boolean
  onChange: (ids: string[]) => void
}>

function EligibilityDropdown({
  id,
  options,
  selectedIds,
  placeholder,
  countLabel,
  invalid,
  onChange,
}: EligibilityDropdownProps) {
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const selectedOptions = options.filter((option) => selectedIds.includes(option.id))
  const normalizedSearch = search.trim().toLowerCase()
  const filteredOptions = options.filter(
    (option) => !normalizedSearch || option.name.toLowerCase().includes(normalizedSearch),
  )
  const getTriggerLabel = () => {
    if (selectedOptions.length === 0) {
      return placeholder
    }
    if (selectedOptions.length === 1) {
      return selectedOptions[0].name
    }
    return m.role_access_selected_count({ count: selectedOptions.length, label: countLabel })
  }
  const triggerLabel = getTriggerLabel()

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) {
          setSearch('')
          return
        }

        requestAnimationFrame(() => {
          searchInputRef.current?.focus()
        })
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          type='button'
          variant='outline'
          aria-invalid={invalid}
          className='h-10 w-full justify-between rounded-lg border-input bg-background px-3 font-normal'
        >
          <span className={cn('truncate', selectedOptions.length === 0 && 'text-muted-foreground')}>
            {triggerLabel}
          </span>
          <IconChevronDown size={16} className='shrink-0 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='max-h-64 rounded-xl bg-popover'>
        <section className='p-1.5' aria-label={m.role_access_search_options({ label: countLabel })}>
          <div className='relative'>
            <IconSearch
              size={15}
              className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.role_access_search_options({ label: countLabel })}
              aria-label={m.role_access_search_options({ label: countLabel })}
              className='h-9 rounded-lg pl-9'
            />
          </div>
        </section>
        <DropdownMenuSeparator />
        {filteredOptions.length === 0 ? (
          <DropdownMenuLabel>{m.role_access_no_matching_options()}</DropdownMenuLabel>
        ) : (
          filteredOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.id}
              checked={selectedIds.includes(option.id)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selectedIds, option.id]
                    : selectedIds.filter((id) => id !== option.id),
                )
              }
            >
              {option.name}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function RoleForm({
  mode,
  defaultValues,
  eligibilityOptions,
  isPending,
  onSubmit,
}: RoleFormProps) {
  const formSchema = useSchema(() => ({
    name: z
      .string()
      .trim()
      .min(2, { message: m.role_access_validation_role_name_min() })
      .max(100, { message: m.role_access_validation_role_name_max() }),
    code: z
      .string()
      .trim()
      .min(2, { message: m.role_access_validation_role_code_min() })
      .max(50, { message: m.role_access_validation_role_code_max() })
      .regex(/^[A-Z][A-Z0-9_]*$/, {
        message: m.role_access_validation_role_code_format(),
      }),
    status: z.enum(['Active', 'Inactive', 'Draft'], {
      message: m.role_access_validation_status(),
    }),
    description: z
      .string()
      .trim()
      .min(10, { message: m.role_access_validation_description_min() })
      .max(500, { message: m.role_access_validation_description_max() }),
    allowMultipleRoles: z.boolean(),
    accessExpiry: z.string().trim().min(1, { message: m.role_access_validation_access_expiry() }),
    eligibleDepartments: z
      .array(z.string().min(1))
      .min(1, { message: m.role_access_validation_department() }),
    eligibleBranches: z
      .array(z.string().min(1))
      .min(1, { message: m.role_access_validation_branch() }),
  }))

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const isEdit = mode === 'edit'
  const formId = isEdit ? 'edit-role-form' : 'create-role-form'
  const submitting = isPending || isSubmitting
  const title = isEdit ? m.role_access_edit_title() : m.role_access_create_title()
  const submitLabel = isEdit ? m.role_access_save_changes() : m.role_access_save_role()

  return (
    <AppMain
      backTo='/settings/role-access'
      breadcrumbs={[
        { to: '/', label: m.role_access_breadcrumb_settings() },
        { to: '/settings/role-access', label: m.role_access_title() },
        { label: title },
      ]}
      title={title}
      subtitle={isEdit ? m.role_access_edit_subtitle() : m.role_access_create_subtitle()}
      actions={
        <>
          <Button asChild variant='outline'>
            <Link to='/settings/role-access'>{m.role_access_cancel()}</Link>
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => setValue('status', 'Draft', { shouldDirty: true })}
          >
            {isEdit ? m.role_access_set_as_draft() : m.role_access_save_draft()}
          </Button>
          <Button type='submit' form={formId} disabled={submitting}>
            {submitting && <Spinner />}
            {submitting ? m.role_access_saving() : submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <div className='grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.95fr)]'>
            <section className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
              <h2 className='text-base font-bold text-foreground'>
                {m.role_access_role_information()}
              </h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                {m.role_access_role_information_description()}
              </p>

              <div className='mt-6 grid gap-5 md:grid-cols-2'>
                <Field className='gap-2' data-invalid={!!errors.name}>
                  <FieldLabel htmlFor={`${formId}-name`}>{m.role_access_role_name()}</FieldLabel>
                  <Input
                    id={`${formId}-name`}
                    aria-invalid={!!errors.name}
                    className='h-10 rounded-lg border-input bg-background'
                    {...register('name')}
                  />
                  <FieldDescription>{m.role_access_role_name_help()}</FieldDescription>
                  <FieldError errors={errors.name ? [errors.name] : undefined} />
                </Field>

                <Field className='gap-2' data-invalid={!!errors.code}>
                  <FieldLabel htmlFor={`${formId}-code`}>{m.role_access_role_code()}</FieldLabel>
                  <Input
                    id={`${formId}-code`}
                    aria-invalid={!!errors.code}
                    className='h-10 rounded-lg border-input bg-background uppercase'
                    {...register('code', {
                      onChange: (event) => {
                        event.target.value = event.target.value.toUpperCase()
                      },
                    })}
                  />
                  <FieldDescription>{m.role_access_role_code_help()}</FieldDescription>
                  <FieldError errors={errors.code ? [errors.code] : undefined} />
                </Field>
              </div>

              <Field className='mt-5 gap-2' data-invalid={!!errors.status}>
                <FieldLabel htmlFor={`${formId}-status`}>{m.role_access_status()}</FieldLabel>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={`${formId}-status`}
                        aria-invalid={!!errors.status}
                        className='h-10 w-full rounded-lg border-input bg-background'
                      >
                        <SelectValue placeholder={m.role_access_select_status()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Active'>{m.role_access_status_active()}</SelectItem>
                        <SelectItem value='Inactive'>{m.role_access_status_inactive()}</SelectItem>
                        <SelectItem value='Draft'>{m.role_access_status_draft()}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>{m.role_access_status_help()}</FieldDescription>
                <FieldError errors={errors.status ? [errors.status] : undefined} />
              </Field>

              <Field className='mt-5 gap-2' data-invalid={!!errors.description}>
                <FieldLabel htmlFor={`${formId}-description`}>
                  {m.role_access_description()}
                </FieldLabel>
                <Textarea
                  id={`${formId}-description`}
                  aria-invalid={!!errors.description}
                  className='min-h-28 w-full resize-none rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 aria-invalid:border-destructive'
                  {...register('description')}
                />
                <FieldError errors={errors.description ? [errors.description] : undefined} />
              </Field>
            </section>

            <section className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
              <h2 className='text-base font-bold text-foreground'>
                {m.role_access_role_eligibility()}
              </h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                {m.role_access_role_eligibility_description()}
              </p>

              <div className='mt-6 space-y-6'>
                <Controller
                  name='eligibleDepartments'
                  control={control}
                  render={({ field }) => (
                    <Field className='gap-2' data-invalid={!!errors.eligibleDepartments}>
                      <FieldLabel htmlFor={`${formId}-eligible-departments`}>
                        {m.role_access_eligible_departments()}
                      </FieldLabel>
                      <EligibilityDropdown
                        id={`${formId}-eligible-departments`}
                        options={eligibilityOptions.departments}
                        selectedIds={field.value}
                        placeholder={m.role_access_select_departments()}
                        countLabel={m.role_access_departments()}
                        invalid={!!errors.eligibleDepartments}
                        onChange={field.onChange}
                      />
                      <FieldDescription>{m.role_access_department_help()}</FieldDescription>
                      <FieldError
                        errors={
                          errors.eligibleDepartments ? [errors.eligibleDepartments] : undefined
                        }
                      />
                    </Field>
                  )}
                />

                <Controller
                  name='eligibleBranches'
                  control={control}
                  render={({ field }) => (
                    <Field className='gap-2' data-invalid={!!errors.eligibleBranches}>
                      <FieldLabel htmlFor={`${formId}-eligible-branches`}>
                        {m.role_access_eligible_branches()}
                      </FieldLabel>
                      <EligibilityDropdown
                        id={`${formId}-eligible-branches`}
                        options={eligibilityOptions.branches}
                        selectedIds={field.value}
                        placeholder={m.role_access_select_branches()}
                        countLabel={m.role_access_branches()}
                        invalid={!!errors.eligibleBranches}
                        onChange={field.onChange}
                      />
                      <FieldDescription>{m.role_access_branch_help()}</FieldDescription>
                      <FieldError
                        errors={errors.eligibleBranches ? [errors.eligibleBranches] : undefined}
                      />
                    </Field>
                  )}
                />

                <Controller
                  name='allowMultipleRoles'
                  control={control}
                  render={({ field }) => (
                    <Field orientation='horizontal'>
                      <div>
                        <FieldLabel htmlFor={`${formId}-allow-multiple-roles`}>
                          {m.role_access_allow_multiple_roles()}
                        </FieldLabel>
                        <p className='mt-1 text-xs text-muted-foreground'>
                          {m.role_access_allow_multiple_roles_help()}
                        </p>
                      </div>
                      <Switch
                        id={`${formId}-allow-multiple-roles`}
                        aria-label={m.role_access_allow_multiple_roles()}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              </div>

              <Field className='mt-5 gap-2' data-invalid={!!errors.accessExpiry}>
                <FieldLabel htmlFor={`${formId}-access-expiry`}>
                  {m.role_access_access_expiry()}
                </FieldLabel>
                <Controller
                  name='accessExpiry'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={`${formId}-access-expiry`}
                        aria-invalid={!!errors.accessExpiry}
                        className='h-10 w-full rounded-lg border-input bg-background'
                      >
                        <SelectValue placeholder={m.role_access_select_access_expiry()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='No expiry'>{m.role_access_no_expiry()}</SelectItem>
                        <SelectItem value='30 days'>{m.role_access_days_30()}</SelectItem>
                        <SelectItem value='90 days'>{m.role_access_days_90()}</SelectItem>
                        <SelectItem value='180 days'>{m.role_access_days_180()}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>{m.role_access_access_expiry_help()}</FieldDescription>
                <FieldError errors={errors.accessExpiry ? [errors.accessExpiry] : undefined} />
              </Field>

              <Button type='submit' form={formId} disabled={submitting} className='mt-8 w-full'>
                {submitting && <Spinner />}
                {submitting ? m.role_access_saving() : submitLabel}
              </Button>
            </section>
          </div>
        </FieldGroup>
      </form>
    </AppMain>
  )
}
