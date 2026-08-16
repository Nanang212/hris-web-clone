import {
  IconDots,
  IconEdit,
  IconLock,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
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
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { useDeleteRole, useRoles, useRoleStats } from '@/features/settings/role-access/data/hooks'
import type { Role } from '@/features/settings/role-access/data/types'

const toneClasses = {
  violet: 'text-violet-600 dark:text-violet-400',
  blue: 'text-blue-600 dark:text-blue-400',
  orange: 'text-orange-600 dark:text-orange-400',
  red: 'text-red-600 dark:text-red-400',
} as const

function getNoteColorClass(tone: string): import('clsx').ClassValue {
  return toneClasses[tone as keyof typeof toneClasses] ?? 'text-muted-foreground'
}

function getScopeColorClass(scope: string): import('clsx').ClassValue {
  const scopeClasses: Record<string, string> = {
    global: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    departmental: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    personal: 'bg-gray-50 text-gray-600 dark:bg-gray-950/40 dark:text-gray-400',
  }
  return scopeClasses[scope] ?? 'bg-gray-50 text-gray-600 dark:bg-gray-950/40 dark:text-gray-400'
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  readonly icon: typeof IconUsers
  readonly label: string
  readonly value: string | number
  readonly note: string
  readonly tone: 'violet' | 'blue' | 'orange' | 'red'
}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-500 dark:bg-violet-950/40',
    blue: 'bg-blue-50 text-blue-500 dark:bg-blue-950/40',
    orange: 'bg-orange-50 text-orange-500 dark:bg-orange-950/40',
    red: 'bg-red-50 text-red-500 dark:bg-red-950/40',
  }

  return (
    <Card size='sm' className='rounded-xl border border-border p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <div className={cn('rounded-lg p-2.5', tones[tone])}>
          <Icon size={18} stroke={1.75} />
        </div>
        <div>
          <p className='text-xs font-medium text-muted-foreground'>{label}</p>
          <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>{value}</p>
          <p className={cn('mt-1.5 text-xs font-medium', getNoteColorClass(tone))}>{note}</p>
        </div>
      </div>
    </Card>
  )
}

export default function RoleAccessPage() {
  const [searchRole, setSearchRole] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const deleteRoleMutation = useDeleteRole()
  const { data: stats, isPending: isStatsPending } = useRoleStats()
  const {
    data: roles = [],
    isPending: isRolesPending,
    isFetching: isRolesFetching,
  } = useRoles({
    search: searchRole,
    status: statusFilter,
  })
  const hasActiveRoleFilters = searchRole.trim().length > 0 || statusFilter !== 'All'
  const isInitialPageLoading = isStatsPending || (isRolesPending && !hasActiveRoleFilters)
  const isRoleTableLoading = isRolesFetching && !isInitialPageLoading

  const handleDeleteRole = async () => {
    if (!roleToDelete) return

    try {
      await deleteRoleMutation.mutateAsync(roleToDelete.id)
      snackbar.success(`${roleToDelete.name} role deleted successfully.`)
      setRoleToDelete(null)
    } catch (error) {
      snackbar.exception(error)
    }
  }

  return (
    <AppMain
      breadcrumbs={[{ to: '/', label: 'Pengaturan' }, { label: 'Role & Access' }]}
      title='Role & Access'
      subtitle='Kelola role, assignment user, scope data, dan permission setiap modul.'
      pending={isInitialPageLoading}
      loadingComponent={
        <SkeletonPattern
          gap={12}
          rowGap={12}
          height={[126, 430]}
          pattern={`
            ==-==-==-==
            ===========
          `}
        />
      }
      actions={
        <>
          <Button variant='outline'>Export Roles</Button>
          <Button asChild>
            <Link to='/settings/role-access/create-role'>
              <IconPlus size={16} /> Create Role
            </Link>
          </Button>
        </>
      }
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        <StatCard
          icon={IconShieldCheck}
          label='Active Roles'
          value={isStatsPending ? '...' : (stats?.activeRoles ?? 0)}
          note='Configured roles'
          tone='violet'
        />
        <StatCard
          icon={IconUsers}
          label='User Assignments'
          value={isStatsPending ? '...' : (stats?.userAssignments ?? 0)}
          note='Across all roles'
          tone='blue'
        />
        <StatCard
          icon={IconSparkles}
          label='Permission Sets'
          value={isStatsPending ? '...' : (stats?.permissionSets ?? 0)}
          note='Across all modules'
          tone='orange'
        />
      </div>

      <section className='rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5'>
        <div className='flex flex-col justify-between gap-3 lg:flex-row lg:items-start'>
          <div>
            <h2 className='text-base font-bold text-foreground'>Role Directory</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Cari role, cek scope data, permission coverage, dan assignment user.
            </p>
          </div>
          <Button asChild variant='outline'>
            <Link to='/settings/role-access/permission-matrix'>Permission Matrix</Link>
          </Button>
        </div>

        <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
          <div className='relative flex-1'>
            <IconSearch
              size={16}
              className='pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              aria-label='Search role'
              className='h-10 rounded-lg border-input bg-background pl-9'
              placeholder='Search role...'
              value={searchRole}
              onChange={(event) => setSearchRole(event.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='h-10 w-full rounded-lg border-input bg-background sm:w-44'>
              <SelectValue placeholder='Status: All' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='All'>Status: All</SelectItem>
              <SelectItem value='Active'>Status: Active</SelectItem>
              <SelectItem value='Inactive'>Status: Inactive</SelectItem>
              <SelectItem value='Draft'>Status: Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='mt-4 rounded-lg border border-border'>
          <Table className='min-w-190 text-left' aria-busy={isRoleTableLoading}>
            <TableHeader className='border-b border-border/60 bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
              <TableRow>
                <TableHead className='px-4 py-3'>Role</TableHead>
                <TableHead className='px-4 py-3'>Users</TableHead>
                <TableHead className='px-4 py-3'>Data Scope</TableHead>
                <TableHead className='px-4 py-3'>Coverage</TableHead>
                <TableHead className='px-4 py-3'>Last Updated</TableHead>
                <TableHead className='px-4 py-3'>Status</TableHead>
                <TableHead className='px-4 py-3 text-center'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isRoleTableLoading &&
                Array.from({ length: 5 }, (_, rowIndex) => (
                  <TableRow key={`role-skeleton-${rowIndex}`}>
                    <TableCell className='px-4 py-4'>
                      <div className='flex items-center gap-2.5'>
                        <Skeleton className='h-7 w-7 shrink-0 rounded-md' />
                        <Skeleton className='h-4 w-32' />
                      </div>
                    </TableCell>
                    <TableCell className='px-4 py-4'>
                      <Skeleton className='h-4 w-10' />
                    </TableCell>
                    <TableCell className='px-4 py-4'>
                      <Skeleton className='h-6 w-24 rounded-full' />
                    </TableCell>
                    <TableCell className='px-4 py-4'>
                      <Skeleton className='h-4 w-20' />
                    </TableCell>
                    <TableCell className='px-4 py-4'>
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                    <TableCell className='px-4 py-4'>
                      <Skeleton className='h-6 w-16 rounded-full' />
                    </TableCell>
                    <TableCell className='px-4 py-4'>
                      <Skeleton className='mx-auto h-7 w-7 rounded-md' />
                    </TableCell>
                  </TableRow>
                ))}
              {!isRoleTableLoading && roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className='py-8 text-center text-sm text-muted-foreground'>
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
              {!isRoleTableLoading &&
                roles.length > 0 &&
                roles.map((role) => (
                  <TableRow
                    key={role.id || role.name}
                    className='border-t border-border/80 text-sm text-foreground transition-colors hover:bg-muted/30'
                  >
                    <TableCell className='px-4 py-3 font-semibold'>
                      <span className='mr-2.5 inline-flex rounded-md bg-blue-50 p-1 text-blue-500 dark:bg-blue-950/40'>
                        <IconShieldCheck size={15} />
                      </span>
                      {role.name}
                    </TableCell>
                    <TableCell className='px-4 py-3'>{role.users}</TableCell>
                    <TableCell className='px-4 py-3'>
                      <Badge variant='secondary' className={cn(getScopeColorClass(role.scope))}>
                        {role.scope}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-4 py-3 font-medium text-blue-600 dark:text-blue-400'>
                      {role.coverage}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-muted-foreground'>
                      {role.updatedAt}
                    </TableCell>
                    <TableCell className='px-4 py-3'>
                      <Badge className='bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-4 py-3 text-center'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            size='icon-xs'
                            aria-label={`Actions for ${role.name}`}
                          >
                            <IconDots size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-52'>
                          <DropdownMenuLabel className='truncate'>{role.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              to='/settings/role-access/$roleId/edit'
                              params={{ roleId: role.id }}
                            >
                              <IconEdit />
                              Edit Role
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to='/settings/role-access/$roleId/assign-users'
                              params={{ roleId: role.id }}
                            >
                              <IconUserPlus />
                              Assign Users
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant='destructive'
                            disabled={deleteRoleMutation.isPending}
                            onSelect={() => setRoleToDelete(role)}
                          >
                            <IconTrash />
                            {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div className='mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3.5 py-2.5 text-xs font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
          <IconLock size={15} /> Role changes, permission updates, dan assignments are recorded in
          Audit Trail.
        </div>
      </section>

      <Dialog
        open={roleToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteRoleMutation.isPending) setRoleToDelete(null)
        }}
      >
        <DialogContent showCloseButton={!deleteRoleMutation.isPending}>
          <DialogHeader>
            <div className='mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'>
              <IconTrash size={20} />
            </div>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the <strong>{roleToDelete?.name}</strong> role? This
              action cannot be undone and may affect assigned users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline' disabled={deleteRoleMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type='button'
              variant='destructive'
              disabled={deleteRoleMutation.isPending}
              onClick={() => void handleDeleteRole()}
            >
              <IconTrash size={16} />
              {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
