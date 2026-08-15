import { zodResolver } from '@hookform/resolvers/zod'
import { IconChevronDown, IconLock, IconSearch } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import {
  useRolePermissions,
  useRoles,
  useUpdateRolePermissions,
} from '@/features/settings/user-role/data/hooks'
import type {
  PermissionAction,
  PermissionDataScope,
  Role,
  RolePermissionMatrix,
  RolePermissionModule,
} from '@/features/settings/user-role/data/types'

const permissionActions: PermissionAction[] = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
  'export',
  'configure',
]

const actionLabels: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
  export: 'Export',
  configure: 'Configure',
}

type PermissionMatrixFormValues = {
  roleId: string
  defaultDataScope: PermissionDataScope
  modules: RolePermissionModule[]
}

type PermissionMatrixFormProps = Readonly<{
  roles: Role[]
  matrix: RolePermissionMatrix
  onRoleChange: (roleId: string) => void
}>

function PermissionMatrixForm({ roles, matrix, onRoleChange }: PermissionMatrixFormProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [enabledOnly, setEnabledOnly] = useState(false)
  const updatePermissionsMutation = useUpdateRolePermissions()

  const formSchema = useSchema((z) => ({
    roleId: z.string().min(1, { message: 'Role is required.' }),
    defaultDataScope: z.enum(['Self', 'Department', 'Branch', 'Company']),
    modules: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          category: z.string().min(1),
          scope: z.enum(['Company', 'Restricted']),
          permissions: z.object({
            view: z.boolean(),
            create: z.boolean(),
            edit: z.boolean(),
            delete: z.boolean(),
            approve: z.boolean(),
            export: z.boolean(),
            configure: z.boolean(),
          }),
        }),
      )
      .min(1, { message: 'At least one permission module is required.' })
      .refine(
        (modules) => modules.some((module) => Object.values(module.permissions).some(Boolean)),
        { message: 'Select at least one permission before saving.' },
      ),
  }))

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PermissionMatrixFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleId: matrix.roleId,
      defaultDataScope: matrix.defaultDataScope,
      modules: matrix.modules,
    },
    mode: 'onChange',
  })

  const modules = useWatch({ control, name: 'modules' })
  const categories = useMemo(
    () => ['All', ...new Set(modules.map((module) => module.category))],
    [modules],
  )

  const filteredModules = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return modules.filter((module) => {
      const matchesSearch =
        !normalizedSearch ||
        module.name.toLowerCase().includes(normalizedSearch) ||
        module.category.toLowerCase().includes(normalizedSearch)
      const matchesCategory = category === 'All' || module.category === category
      const hasEnabledPermission = Object.values(module.permissions).some(Boolean)

      return matchesSearch && matchesCategory && (!enabledOnly || hasEnabledPermission)
    })
  }, [category, enabledOnly, modules, search])

  const allFilteredSelected =
    filteredModules.length > 0 &&
    filteredModules.every((module) =>
      permissionActions.every((action) => module.permissions[action]),
    )

  const updateModules = (nextModules: RolePermissionModule[]) => {
    setValue('modules', nextModules, { shouldDirty: true, shouldValidate: true })
  }

  const togglePermission = (moduleId: string, action: PermissionAction) => {
    updateModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              permissions: {
                ...module.permissions,
                [action]: !module.permissions[action],
              },
            }
          : module,
      ),
    )
  }

  const toggleModule = (moduleId: string, checked: boolean) => {
    updateModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              permissions: {
                view: checked,
                create: checked,
                edit: checked,
                delete: checked,
                approve: checked,
                export: checked,
                configure: checked,
              },
            }
          : module,
      ),
    )
  }

  const toggleAllFiltered = (checked: boolean) => {
    const filteredIds = new Set(filteredModules.map((module) => module.id))

    updateModules(
      modules.map((module) =>
        filteredIds.has(module.id)
          ? {
              ...module,
              permissions: {
                view: checked,
                create: checked,
                edit: checked,
                delete: checked,
                approve: checked,
                export: checked,
                configure: checked,
              },
            }
          : module,
      ),
    )
  }

  const handleReset = () => {
    reset({
      roleId: matrix.roleId,
      defaultDataScope: matrix.defaultDataScope,
      modules: matrix.modules,
    })
    setSearch('')
    setCategory('All')
    setEnabledOnly(false)
  }

  const handleSave = async (values: PermissionMatrixFormValues) => {
    try {
      await updatePermissionsMutation.mutateAsync({
        id: values.roleId,
        payload: {
          defaultDataScope: values.defaultDataScope,
          modules: values.modules,
        },
      })
      snackbar.success('Role permissions updated successfully.')
    } catch (error) {
      snackbar.exception(error, 'Failed to update role permissions.')
    }
  }

  const submitting = isSubmitting || updatePermissionsMutation.isPending

  return (
    <AppMain
      backTo='/settings/user-role'
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/user-role', label: 'User & Role' },
        { label: 'Permission Matrix' },
      ]}
      title='Permission Matrix'
      subtitle='Atur akses modul dan tindakan yang tersedia untuk setiap role.'
      actions={
        <>
          <Button type='button' variant='outline' onClick={handleReset} disabled={submitting}>
            Reset
          </Button>
          <Button type='submit' form='permission-matrix-form' disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Permissions'}
          </Button>
        </>
      }
    >
      <form id='permission-matrix-form' onSubmit={handleSubmit(handleSave)} noValidate>
        <div className='space-y-6'>
          <section className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
            <div className='grid gap-5 lg:grid-cols-2 lg:items-start'>
              <Field className='gap-2' data-invalid={!!errors.roleId}>
                <FieldLabel htmlFor='permission-role'>Role</FieldLabel>
                <div className='relative'>
                  <select
                    id='permission-role'
                    aria-invalid={!!errors.roleId}
                    className='h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
                    {...register('roleId', {
                      onChange: (event) => onRoleChange(event.target.value),
                    })}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    size={16}
                    className='pointer-events-none absolute top-3 right-3 text-muted-foreground'
                  />
                </div>
                <FieldError errors={errors.roleId ? [errors.roleId] : undefined} />
              </Field>

              <Field className='gap-2' data-invalid={!!errors.defaultDataScope}>
                <FieldLabel htmlFor='permission-data-scope'>Default Data Scope</FieldLabel>
                <div className='relative'>
                  <select
                    id='permission-data-scope'
                    aria-invalid={!!errors.defaultDataScope}
                    className='h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
                    {...register('defaultDataScope')}
                  >
                    <option value='Self'>Self</option>
                    <option value='Department'>Department</option>
                    <option value='Branch'>Branch</option>
                    <option value='Company'>Company</option>
                  </select>
                  <IconChevronDown
                    size={16}
                    className='pointer-events-none absolute top-3 right-3 text-muted-foreground'
                  />
                </div>
                <FieldError
                  errors={errors.defaultDataScope ? [errors.defaultDataScope] : undefined}
                />
              </Field>
            </div>
          </section>

          <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
            <div className='border-b border-border p-5 sm:p-6'>
              <h2 className='text-base font-bold text-foreground'>Permission Configuration</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                Konfigurasikan tindakan yang tersedia untuk setiap modul.
              </p>

              {errors.modules?.message && (
                <p role='alert' className='mt-2 text-sm text-destructive'>
                  {errors.modules.message}
                </p>
              )}

              <div className='mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
                <div className='flex flex-1 flex-col gap-3 sm:flex-row'>
                  <div className='relative min-w-0 flex-1'>
                    <IconSearch
                      size={16}
                      className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                    />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder='Search module or category...'
                      className='h-10 rounded-lg border-input bg-background pl-9'
                    />
                  </div>
                  <div className='relative sm:w-52'>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className='h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm outline-none focus:border-primary'
                      aria-label='Filter permission category'
                    >
                      {categories.map((value) => (
                        <option key={value} value={value}>
                          Category: {value}
                        </option>
                      ))}
                    </select>
                    <IconChevronDown
                      size={16}
                      className='pointer-events-none absolute top-3 right-3 text-muted-foreground'
                    />
                  </div>
                </div>

                <div className='flex flex-wrap items-center gap-5 text-sm'>
                  <label className='flex cursor-pointer items-center gap-2 text-muted-foreground'>
                    <Checkbox
                      checked={enabledOnly}
                      onCheckedChange={(checked) => setEnabledOnly(checked === true)}
                    />
                    Enabled only
                  </label>
                  <label className='flex cursor-pointer items-center gap-2 font-medium text-foreground'>
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={(checked) => toggleAllFiltered(checked === true)}
                    />
                    Select all permissions
                  </label>
                </div>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full min-w-245 text-left text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/50 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                    <th className='px-5 py-3'>Module</th>
                    <th className='px-3 py-3'>Scope</th>
                    {permissionActions.map((action) => (
                      <th key={action} className='px-3 py-3 text-center'>
                        {actionLabels[action]}
                      </th>
                    ))}
                    <th className='px-5 py-3 text-center'>All</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.map((module) => {
                    const allModulePermissions = permissionActions.every(
                      (action) => module.permissions[action],
                    )

                    return (
                      <tr
                        key={module.id}
                        className='border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/30'
                      >
                        <td className='px-5 py-3.5'>
                          <div className='flex items-center gap-2.5'>
                            <span className='font-semibold text-foreground'>{module.name}</span>
                          </div>
                          <span className='mt-0.5 block text-xs text-muted-foreground'>
                            {module.category}
                          </span>
                        </td>
                        <td className='px-3 py-3.5'>
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                              module.scope === 'Restricted'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
                            )}
                          >
                            {module.scope}
                          </span>
                        </td>
                        {permissionActions.map((action) => (
                          <td key={action} className='px-3 py-3.5 text-center'>
                            <Checkbox
                              checked={module.permissions[action]}
                              onCheckedChange={() => togglePermission(module.id, action)}
                              aria-label={`${actionLabels[action]} permission for ${module.name}`}
                              className='mx-auto'
                            />
                          </td>
                        ))}
                        <td className='px-5 py-3.5 text-center'>
                          <Checkbox
                            checked={allModulePermissions}
                            onCheckedChange={(checked) => toggleModule(module.id, checked === true)}
                            aria-label={`Select all permissions for ${module.name}`}
                            className='mx-auto'
                          />
                        </td>
                      </tr>
                    )
                  })}
                  {filteredModules.length === 0 && (
                    <tr>
                      <td
                        colSpan={permissionActions.length + 3}
                        className='px-5 py-14 text-center text-sm text-muted-foreground'
                      >
                        No modules match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className='flex items-start gap-2 border-t border-blue-100 bg-blue-50 px-5 py-3.5 text-xs font-medium text-blue-700 dark:border-blue-950 dark:bg-blue-950/30 dark:text-blue-400'>
              <IconLock size={15} className='mt-0.5 shrink-0' />
              <span>
                Select All hanya diterapkan pada module yang terlihat. Perubahan permission akan
                dicatat di Audit Trail.
              </span>
            </div>
          </section>
        </div>
      </form>
    </AppMain>
  )
}

export function PermissionMatrixPage() {
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const rolesQuery = useRoles()
  const roles = rolesQuery.data ?? []
  const activeRoleId = selectedRoleId || roles[0]?.id || ''
  const permissionsQuery = useRolePermissions(activeRoleId)

  const pending = rolesQuery.isPending || (Boolean(activeRoleId) && permissionsQuery.isPending)
  const error = rolesQuery.error ?? permissionsQuery.error
  const notFound = !pending && !error && (roles.length === 0 || !permissionsQuery.data)

  if (pending || error || notFound) {
    return (
      <AppMain
        backTo='/settings/user-role'
        pending={pending}
        error={error}
        retry={() => {
          void rolesQuery.refetch()
          if (activeRoleId) void permissionsQuery.refetch()
        }}
        notFound={notFound}
        loadingComponent={
          <SkeletonPattern
            gap={12}
            rowGap={16}
            height={[128, 480]}
            pattern={`
              ===========
              ===========
            `}
          />
        }
      />
    )
  }

  const matrix = permissionsQuery.data

  if (!matrix) {
    return (
      <AppMain
        backTo='/settings/user-role'
        pending={pending}
        error={error}
        retry={() => {
          void rolesQuery.refetch()
          if (activeRoleId) void permissionsQuery.refetch()
        }}
        notFound={notFound}
        loadingComponent={
          <SkeletonPattern
            gap={12}
            rowGap={16}
            height={[128, 480]}
            pattern={`
              ===========
              ===========
            `}
          />
        }
      />
    )
  }

  return (
    <PermissionMatrixForm
      key={activeRoleId}
      roles={roles}
      matrix={matrix}
      onRoleChange={setSelectedRoleId}
    />
  )
}
