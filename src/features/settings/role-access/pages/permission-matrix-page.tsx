import { zodResolver } from '@hookform/resolvers/zod'
import { IconLock, IconSearch } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch, type FieldErrors } from 'react-hook-form'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import {
  useRolePermissions,
  useRoles,
  useUpdateRolePermissions,
} from '@/features/settings/role-access/data/hooks'
import type {
  PermissionAction,
  PermissionDataScope,
  Role,
  RolePermissionMatrix,
  RolePermissionModule,
} from '@/features/settings/role-access/data/types'

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

const permissionScopeClasses: Record<PermissionDataScope, string> = {
  Company: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  Administrator: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  Self: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
}

function getPermissionModuleKey(module: Pick<RolePermissionModule, 'id' | 'scope'>) {
  return `${module.id}:${module.scope}`
}

type PermissionMatrixFormValues = {
  roleId: string
  defaultDataScope: PermissionDataScope
  modules: RolePermissionModule[]
}

type PermissionMatrixFormProps = Readonly<{
  roles: Role[]
  matrix: RolePermissionMatrix
  activeRoleId: string
  isReloading: boolean
  onRoleChange: (roleId: string) => void
}>

function PermissionMatrixForm({
  roles,
  matrix,
  activeRoleId,
  isReloading,
  onRoleChange,
}: PermissionMatrixFormProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [enabledOnly, setEnabledOnly] = useState(false)
  const updatePermissionsMutation = useUpdateRolePermissions()

  const formSchema = useSchema((z) => ({
    roleId: z.string().min(1, { message: 'Role is required.' }),
    defaultDataScope: z.enum(['Company', 'Administrator', 'Self']),
    modules: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          category: z.string().min(1),
          scope: z.enum(['Company', 'Administrator', 'Self']),
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
      .min(1, { message: 'At least one permission module is required.' }),
  }))

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PermissionMatrixFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleId: activeRoleId,
      defaultDataScope: matrix.defaultDataScope,
      modules: matrix.modules,
    },
    mode: 'onChange',
  })

  const modules = useWatch({ control, name: 'modules' })
  const selectedDataScope = useWatch({ control, name: 'defaultDataScope' })
  const categories = useMemo(
    () => [
      'All',
      ...new Set(
        modules
          .filter((module) => module.scope === selectedDataScope)
          .map((module) => module.category),
      ),
    ],
    [modules, selectedDataScope],
  )

  const filteredModules = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return modules.filter((module) => {
      const matchesSearch =
        !normalizedSearch ||
        module.name.toLowerCase().includes(normalizedSearch) ||
        module.category.toLowerCase().includes(normalizedSearch)
      const matchesCategory = category === 'All' || module.category === category
      const matchesScope = module.scope === selectedDataScope
      const hasEnabledPermission = Object.values(module.permissions).some(Boolean)

      return (
        matchesSearch && matchesCategory && matchesScope && (!enabledOnly || hasEnabledPermission)
      )
    })
  }, [category, enabledOnly, modules, search, selectedDataScope])

  const allFilteredSelected =
    filteredModules.length > 0 &&
    filteredModules.every((module) =>
      permissionActions.every((action) => module.permissions[action]),
    )

  const updateModules = (nextModules: RolePermissionModule[]) => {
    setValue('modules', nextModules, { shouldDirty: true, shouldValidate: true })
  }

  const togglePermission = (
    moduleId: string,
    moduleScope: PermissionDataScope,
    action: PermissionAction,
  ) => {
    updateModules(
      modules.map((module) =>
        module.id === moduleId && module.scope === moduleScope
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

  const toggleModule = (moduleId: string, moduleScope: PermissionDataScope, checked: boolean) => {
    updateModules(
      modules.map((module) =>
        module.id === moduleId && module.scope === moduleScope
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
    const filteredModuleKeys = new Set(filteredModules.map(getPermissionModuleKey))

    updateModules(
      modules.map((module) =>
        filteredModuleKeys.has(getPermissionModuleKey(module))
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
      roleId: activeRoleId,
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

  const handleInvalidSubmit = (formErrors: FieldErrors<PermissionMatrixFormValues>) => {
    const invalidModuleIndex = Array.isArray(formErrors.modules)
      ? formErrors.modules.findIndex(Boolean)
      : -1
    const invalidModule = invalidModuleIndex >= 0 ? modules[invalidModuleIndex] : undefined
    const message =
      formErrors.roleId?.message ??
      formErrors.defaultDataScope?.message ??
      formErrors.modules?.message ??
      (invalidModule
        ? `${invalidModule.name} (${invalidModule.scope}) contains invalid permission data.`
        : 'Permission configuration contains invalid data.')

    snackbar.error(message)
  }

  const submitting = isSubmitting || updatePermissionsMutation.isPending
  const controlsDisabled = submitting || isReloading

  return (
    <AppMain
      backTo='/settings/role-access'
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/role-access', label: 'Role & Access' },
        { label: 'Permission Matrix' },
      ]}
      title='Permission Matrix'
      subtitle='Atur akses modul dan tindakan yang tersedia untuk setiap role.'
      actions={
        <>
          <Button type='button' variant='outline' onClick={handleReset} disabled={controlsDisabled}>
            Reset
          </Button>
          <Button type='submit' form='permission-matrix-form' disabled={controlsDisabled}>
            {submitting ? 'Saving...' : 'Save Permissions'}
          </Button>
        </>
      }
    >
      <form
        id='permission-matrix-form'
        onSubmit={handleSubmit(handleSave, handleInvalidSubmit)}
        noValidate
      >
        <div className='space-y-6'>
          <section className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
            <div className='grid gap-5 lg:grid-cols-2 lg:items-start'>
              <Field className='gap-2' data-invalid={!!errors.roleId}>
                <FieldLabel htmlFor='permission-role'>Role</FieldLabel>
                <Controller
                  name='roleId'
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        onRoleChange(value)
                      }}
                    >
                      <SelectTrigger
                        id='permission-role'
                        aria-invalid={!!errors.roleId}
                        className='h-10 w-full rounded-lg border-input bg-background'
                      >
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={errors.roleId ? [errors.roleId] : undefined} />
              </Field>

              <Field className='gap-2' data-invalid={!!errors.defaultDataScope}>
                <FieldLabel htmlFor='permission-data-scope'>Default Data Scope</FieldLabel>
                <Controller
                  name='defaultDataScope'
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      disabled={isReloading}
                      onValueChange={(value) => {
                        field.onChange(value)
                        setCategory('All')
                      }}
                    >
                      <SelectTrigger
                        id='permission-data-scope'
                        aria-invalid={!!errors.defaultDataScope}
                        className='h-10 w-full rounded-lg border-input bg-background'
                      >
                        <SelectValue placeholder='Select data scope' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Company'>Company</SelectItem>
                        <SelectItem value='Administrator'>Administrator</SelectItem>
                        <SelectItem value='Self'>Self</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
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
                Konfigurasikan tindakan pada modul dengan scope {selectedDataScope}.
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
                      disabled={isReloading}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder='Search module or category...'
                      className='h-10 rounded-lg border-input bg-background pl-9'
                    />
                  </div>
                  <Select value={category} onValueChange={setCategory} disabled={isReloading}>
                    <SelectTrigger
                      aria-label='Filter permission category'
                      className='h-10 w-full rounded-lg border-input bg-background sm:w-52'
                    >
                      <SelectValue placeholder='Category: All' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((value) => (
                        <SelectItem key={value} value={value}>
                          Category: {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-wrap items-center gap-5 text-sm'>
                  <Label
                    htmlFor='permission-enabled-only'
                    className='cursor-pointer text-muted-foreground'
                  >
                    <Checkbox
                      id='permission-enabled-only'
                      disabled={isReloading}
                      checked={enabledOnly}
                      onCheckedChange={(checked) => setEnabledOnly(checked === true)}
                    />
                    Enabled only
                  </Label>
                  <Label htmlFor='permission-select-all' className='cursor-pointer text-foreground'>
                    <Checkbox
                      id='permission-select-all'
                      disabled={isReloading}
                      checked={allFilteredSelected}
                      onCheckedChange={(checked) => toggleAllFiltered(checked === true)}
                    />
                    Select all permissions
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Table className='min-w-245 text-left' aria-busy={isReloading}>
                <TableHeader>
                  <TableRow className='border-b border-border bg-muted/50 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                    <TableHead className='px-5 py-3'>Module</TableHead>
                    <TableHead className='px-3 py-3'>Scope</TableHead>
                    {permissionActions.map((action) => (
                      <TableHead key={action} className='px-3 py-3 text-center'>
                        {actionLabels[action]}
                      </TableHead>
                    ))}
                    <TableHead className='px-5 py-3 text-center'>All</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isReloading &&
                    Array.from({ length: 6 }, (_, rowIndex) => (
                      <TableRow key={`permission-skeleton-${rowIndex}`}>
                        <TableCell className='px-5 py-4'>
                          <div className='space-y-2'>
                            <Skeleton className='h-4 w-40' />
                            <Skeleton className='h-3 w-24' />
                          </div>
                        </TableCell>
                        <TableCell className='px-3 py-4'>
                          <Skeleton className='h-6 w-24 rounded-full' />
                        </TableCell>
                        {permissionActions.map((action) => (
                          <TableCell key={action} className='px-3 py-4'>
                            <Skeleton className='mx-auto h-5 w-5 rounded-md' />
                          </TableCell>
                        ))}
                        <TableCell className='px-5 py-4'>
                          <Skeleton className='mx-auto h-5 w-5 rounded-md' />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isReloading &&
                    filteredModules.map((module) => {
                      const allModulePermissions = permissionActions.every(
                        (action) => module.permissions[action],
                      )

                      return (
                        <TableRow
                          key={getPermissionModuleKey(module)}
                          className='border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/30'
                        >
                          <TableCell className='px-5 py-3.5'>
                            <div className='flex items-center gap-2.5'>
                              <span className='font-semibold text-foreground'>{module.name}</span>
                            </div>
                            <span className='mt-0.5 block text-xs text-muted-foreground'>
                              {module.category}
                            </span>
                          </TableCell>
                          <TableCell className='px-3 py-3.5'>
                            <Badge
                              variant='secondary'
                              className={permissionScopeClasses[module.scope]}
                            >
                              {module.scope}
                            </Badge>
                          </TableCell>
                          {permissionActions.map((action) => (
                            <TableCell key={action} className='px-3 py-3.5 text-center'>
                              <Checkbox
                                checked={module.permissions[action]}
                                onCheckedChange={() =>
                                  togglePermission(module.id, module.scope, action)
                                }
                                aria-label={`${actionLabels[action]} permission for ${module.name}`}
                                className='mx-auto'
                              />
                            </TableCell>
                          ))}
                          <TableCell className='px-5 py-3.5 text-center'>
                            <Checkbox
                              checked={allModulePermissions}
                              onCheckedChange={(checked) =>
                                toggleModule(module.id, module.scope, checked === true)
                              }
                              aria-label={`Select all permissions for ${module.name}`}
                              className='mx-auto'
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {!isReloading && filteredModules.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={permissionActions.length + 3}
                        className='px-5 py-14 text-center text-sm text-muted-foreground'
                      >
                        No modules match the {selectedDataScope} scope and selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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

  const pending =
    rolesQuery.isPending ||
    (Boolean(activeRoleId) && permissionsQuery.isPending && !permissionsQuery.data)
  const isTableReloading = permissionsQuery.isFetching && permissionsQuery.isPlaceholderData
  const error = rolesQuery.error ?? permissionsQuery.error
  const notFound = !pending && !error && (roles.length === 0 || !permissionsQuery.data)

  if (pending || error || notFound) {
    return (
      <AppMain
        backTo='/settings/role-access'
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
        backTo='/settings/role-access'
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
      key={`${activeRoleId}:${matrix.roleId}`}
      roles={roles}
      matrix={matrix}
      activeRoleId={activeRoleId}
      isReloading={isTableReloading}
      onRoleChange={setSelectedRoleId}
    />
  )
}
