import { zodResolver } from '@hookform/resolvers/zod'
import { IconChevronDown, IconSearch } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

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
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { cn } from '@/shared/lib/utils'
import type {
  CreateRolePayload,
  RoleEligibilityOption,
  RoleEligibilityOptions,
} from '@/features/settings/role-access/data/types'

type RoleFormProps = Readonly<{
  mode: 'create' | 'edit'
  defaultValues: CreateRolePayload
  eligibilityOptions: RoleEligibilityOptions
  isPending: boolean
  onSubmit: (values: CreateRolePayload) => Promise<void>
}>

type EligibilityDropdownProps = Readonly<{
  options: RoleEligibilityOption[]
  selectedIds: string[]
  placeholder: string
  countLabel: string
  invalid: boolean
  onChange: (ids: string[]) => void
}>

function EligibilityDropdown({
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
    return `${selectedOptions.length} ${countLabel} selected`
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
        <section className='p-1.5' aria-label={`Search ${countLabel}`}>
          <div className='relative'>
            <IconSearch
              size={15}
              className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${countLabel}...`}
              aria-label={`Search ${countLabel}`}
              className='h-9 rounded-lg pl-9'
            />
          </div>
        </section>
        <DropdownMenuSeparator />
        {filteredOptions.length === 0 ? (
          <DropdownMenuLabel>No matching options</DropdownMenuLabel>
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
  const formSchema = useSchema((z) => ({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Role name must contain at least 2 characters.' })
      .max(100, { message: 'Role name cannot exceed 100 characters.' }),
    code: z
      .string()
      .trim()
      .min(2, { message: 'Role code must contain at least 2 characters.' })
      .max(50, { message: 'Role code cannot exceed 50 characters.' })
      .regex(/^[A-Z][A-Z0-9_]*$/, {
        message: 'Use uppercase letters, numbers, and underscores only.',
      }),
    status: z.enum(['Active', 'Inactive', 'Draft']),
    description: z
      .string()
      .trim()
      .min(10, { message: 'Description must contain at least 10 characters.' })
      .max(500, { message: 'Description cannot exceed 500 characters.' }),
    allowMultipleRoles: z.boolean(),
    accessExpiry: z.string().trim().min(1, { message: 'Access expiry is required.' }),
    eligibleDepartments: z
      .array(z.string().min(1))
      .min(1, { message: 'Select at least one eligible department.' }),
    eligibleBranches: z
      .array(z.string().min(1))
      .min(1, { message: 'Select at least one eligible branch.' }),
  }))

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateRolePayload>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const isEdit = mode === 'edit'
  const formId = isEdit ? 'edit-role-form' : 'create-role-form'
  const submitting = isPending || isSubmitting
  const title = isEdit ? 'Edit Role' : 'Create Role'
  const submitLabel = isEdit ? 'Save Changes' : 'Save Role'

  return (
    <AppMain
      backTo='/settings/role-access'
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/role-access', label: 'Role & Access' },
        { label: title },
      ]}
      title={title}
      subtitle={
        isEdit
          ? 'Perbarui informasi dasar dan eligibility role.'
          : 'Input informasi dasar dan tentukan user yang eligible untuk role.'
      }
      actions={
        <>
          <Button asChild variant='outline'>
            <Link to='/settings/role-access'>Cancel</Link>
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => setValue('status', 'Draft', { shouldDirty: true })}
          >
            {isEdit ? 'Set as Draft' : 'Save Draft'}
          </Button>
          <Button type='submit' form={formId} disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.95fr)]'>
          <section className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
            <h2 className='text-base font-bold text-foreground'>Role Information</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Identity and basic behavior for this role.
            </p>

            <div className='mt-6 grid gap-5 md:grid-cols-2'>
              <Field className='gap-2' data-invalid={!!errors.name}>
                <FieldLabel htmlFor={`${formId}-name`}>Role Name</FieldLabel>
                <Input
                  id={`${formId}-name`}
                  aria-invalid={!!errors.name}
                  className='h-10 rounded-lg border-input bg-background'
                  {...register('name')}
                />
                <FieldDescription>Shown to administrators and assignees.</FieldDescription>
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>

              <Field className='gap-2' data-invalid={!!errors.code}>
                <FieldLabel htmlFor={`${formId}-code`}>Role Code</FieldLabel>
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
                <FieldDescription>Unique code used by API and audit logs.</FieldDescription>
                <FieldError errors={errors.code ? [errors.code] : undefined} />
              </Field>
            </div>

            <Field className='mt-5 gap-2' data-invalid={!!errors.status}>
              <FieldLabel htmlFor={`${formId}-status`}>Status</FieldLabel>
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
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Active'>Active</SelectItem>
                      <SelectItem value='Inactive'>Inactive</SelectItem>
                      <SelectItem value='Draft'>Draft</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>
                Draft = belum digunakan · Active = bisa di-assign · Inactive = tidak dapat
                digunakan.
              </FieldDescription>
              <FieldError errors={errors.status ? [errors.status] : undefined} />
            </Field>

            <Field className='mt-5 gap-2' data-invalid={!!errors.description}>
              <FieldLabel htmlFor={`${formId}-description`}>Description</FieldLabel>
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
            <h2 className='text-base font-bold text-foreground'>Role Eligibility</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Tentukan department dan branch yang user-nya dapat menerima role ini.
            </p>

            <div className='mt-6 space-y-6'>
              <Controller
                name='eligibleDepartments'
                control={control}
                render={({ field }) => (
                  <Field className='gap-2' data-invalid={!!errors.eligibleDepartments}>
                    <FieldLabel>Eligible Departments</FieldLabel>
                    <EligibilityDropdown
                      options={eligibilityOptions.departments}
                      selectedIds={field.value}
                      placeholder='Select departments'
                      countLabel='departments'
                      invalid={!!errors.eligibleDepartments}
                      onChange={field.onChange}
                    />
                    <FieldDescription>
                      Hanya user dari department terpilih yang eligible untuk role ini.
                    </FieldDescription>
                    {errors.eligibleDepartments?.message && (
                      <p role='alert' className='text-xs text-destructive'>
                        {errors.eligibleDepartments.message}
                      </p>
                    )}
                  </Field>
                )}
              />

              <Controller
                name='eligibleBranches'
                control={control}
                render={({ field }) => (
                  <Field className='gap-2' data-invalid={!!errors.eligibleBranches}>
                    <FieldLabel>Eligible Branches</FieldLabel>
                    <EligibilityDropdown
                      options={eligibilityOptions.branches}
                      selectedIds={field.value}
                      placeholder='Select branches'
                      countLabel='branches'
                      invalid={!!errors.eligibleBranches}
                      onChange={field.onChange}
                    />
                    <FieldDescription>
                      Hanya user dari branch terpilih yang eligible untuk role ini.
                    </FieldDescription>
                    {errors.eligibleBranches?.message && (
                      <p role='alert' className='text-xs text-destructive'>
                        {errors.eligibleBranches.message}
                      </p>
                    )}
                  </Field>
                )}
              />

              <Controller
                name='allowMultipleRoles'
                control={control}
                render={({ field }) => (
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='text-sm font-medium text-foreground'>Allow multiple roles</p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        Users may keep existing roles when this role is assigned.
                      </p>
                    </div>
                    <Switch
                      aria-label='Allow multiple roles'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>

            <Field className='mt-5 gap-2' data-invalid={!!errors.accessExpiry}>
              <FieldLabel htmlFor={`${formId}-access-expiry`}>Access Expiry</FieldLabel>
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
                      <SelectValue placeholder='Select access expiry' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='No expiry'>No expiry</SelectItem>
                      <SelectItem value='30 days'>30 days</SelectItem>
                      <SelectItem value='90 days'>90 days</SelectItem>
                      <SelectItem value='180 days'>180 days</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>
                Access Expiry: No expiry · 30 hari · 90 hari · Custom date.
              </FieldDescription>
              <FieldError errors={errors.accessExpiry ? [errors.accessExpiry] : undefined} />
            </Field>

            <Button type='submit' form={formId} disabled={submitting} className='mt-8 w-full'>
              {submitting ? 'Saving...' : submitLabel}
            </Button>
          </section>
        </div>
      </form>
    </AppMain>
  )
}
