import {
  IconChevronDown,
  IconSearch,
  IconShieldCheck,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { AssignUsersDialog } from '@/features/settings/user-role/components/assign-users-dialog'
import {
  useAssignRoleUsers,
  useRemoveAllRoleUsers,
  useRemoveRoleUser,
  useRole,
  useRoleAssignments,
} from '@/features/settings/user-role/data/hooks'
import type {
  RoleAssignmentUser,
  UserAssignmentStatus,
} from '@/features/settings/user-role/data/types'

type UserAssignmentPageProps = Readonly<{
  roleId: string
}>

type AssignmentDialogState = {
  initialUserIds: string[]
}

const emptyAssignmentUsers: RoleAssignmentUser[] = []

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getStatusClass(status: UserAssignmentStatus): string {
  if (status === 'Assigned') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
  }
  return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
}

export function UserAssignmentPage({ roleId }: UserAssignmentPageProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserAssignmentStatus | 'All'>('All')
  const [assignmentDialog, setAssignmentDialog] = useState<AssignmentDialogState | null>(null)
  const roleQuery = useRole(roleId)
  const assignmentsQuery = useRoleAssignments(roleId)
  const assignUsersMutation = useAssignRoleUsers()
  const removeUserMutation = useRemoveRoleUser()
  const removeAllUsersMutation = useRemoveAllRoleUsers()
  const users = assignmentsQuery.data?.users ?? emptyAssignmentUsers

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.employeeId.toLowerCase().includes(normalizedSearch) ||
        user.department.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, users])

  const pending = roleQuery.isPending || assignmentsQuery.isPending
  const error = roleQuery.error ?? assignmentsQuery.error
  const notFound = !pending && !error && (!roleQuery.data || !assignmentsQuery.data)

  if (pending || error || notFound) {
    return (
      <AppMain
        backTo='/settings/user-role'
        pending={pending}
        error={error}
        retry={() => {
          void roleQuery.refetch()
          void assignmentsQuery.refetch()
        }}
        notFound={notFound}
      />
    )
  }

  const role = roleQuery.data

  const assignedCount = users.filter((user) => user.status === 'Assigned').length
  const eligibleCount = users.filter((user) => user.status !== 'Assigned').length
  const eligibleUsers = users.filter((user) => user.status !== 'Assigned')

  const handleAssign = async (userIds: string[], effectiveDate: string, notifyUsers: boolean) => {
    try {
      await assignUsersMutation.mutateAsync({
        id: roleId,
        payload: { userIds, effectiveDate, notifyUsers },
      })
      setAssignmentDialog(null)
      snackbar.success(
        `${userIds.length} ${userIds.length === 1 ? 'user' : 'users'} assigned successfully.`,
      )
    } catch (mutationError) {
      snackbar.exception(mutationError, 'Failed to assign users.')
    }
  }

  const handleRemove = async (userId: string, name: string) => {
    try {
      await removeUserMutation.mutateAsync({ id: roleId, userId })
      snackbar.success(`${name} removed from ${role.name}.`)
    } catch (mutationError) {
      snackbar.exception(mutationError, `Failed to remove ${name} from this role.`)
    }
  }

  const handleBulkUnassign = async () => {
    try {
      await removeAllUsersMutation.mutateAsync(roleId)
      snackbar.success(`All users removed from ${role.name}.`)
    } catch (mutationError) {
      snackbar.exception(mutationError, `Failed to remove users from ${role.name}.`)
    }
  }

  return (
    <AppMain
      backTo='/settings/user-role'
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/user-role', label: 'User & Role' },
        { label: 'User Assignment' },
      ]}
      title='User Assignment'
      subtitle='Kelola user yang memenuhi eligibility department dan branch untuk role ini.'
      actions={
        <Button type='button' onClick={() => setAssignmentDialog({ initialUserIds: [] })}>
          <IconUserPlus size={16} />
          Assign Users
        </Button>
      }
    >
      <section className='rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-950 dark:bg-blue-950/20'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <IconShieldCheck size={21} />
            </div>
            <div>
              <p className='text-xs font-medium text-muted-foreground'>Selected Role</p>
              <h2 className='text-lg font-bold text-foreground'>{role.name}</h2>
              <p className='text-xs text-muted-foreground'>
                {role.code} · {role.scope} scope · {role.status}
              </p>
            </div>
          </div>
          <p className='max-w-xl text-sm text-muted-foreground'>
            Users assigned to this role inherit its module permissions and data scope. Eligibility
            ditentukan oleh department dan branch pada konfigurasi role.
          </p>
        </div>
      </section>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {[
          {
            label: 'Assigned Users',
            value: assignedCount,
            note: 'Active role members',
            icon: IconUserCheck,
            tone: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50',
          },
          {
            label: 'Eligible Users',
            value: eligibleCount,
            note: 'Available to assign',
            icon: IconUsers,
            tone: 'text-blue-600 bg-blue-100 dark:bg-blue-950/50',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className='flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'
            >
              <div className={cn('rounded-xl p-2.5', stat.tone)}>
                <Icon size={18} />
              </div>
              <div>
                <p className='text-xs font-medium text-muted-foreground'>{stat.label}</p>
                <p className='text-2xl font-bold'>{stat.value}</p>
                <p className='text-xs text-muted-foreground'>{stat.note}</p>
              </div>
            </div>
          )
        })}
      </div>

      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='border-b border-border p-5 sm:p-6'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div>
              <h2 className='text-base font-bold'>Role Members</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                Current members and employees eligible for this role.
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              disabled={assignedCount === 0 || removeAllUsersMutation.isPending}
              onClick={() => void handleBulkUnassign()}
            >
              {removeAllUsersMutation.isPending ? 'Removing...' : 'Bulk Unassign'}
            </Button>
          </div>

          <div className='mt-5 flex flex-col gap-2 sm:flex-row'>
            <div className='relative flex-1'>
              <IconSearch
                size={16}
                className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Search employee, NIP, or department...'
                className='h-10 rounded-lg border-input bg-background pl-9'
              />
            </div>
            <div className='relative sm:w-48'>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as UserAssignmentStatus | 'All')
                }
                className='h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm outline-none focus:border-primary'
              >
                <option value='All'>Status: All</option>
                <option value='Assigned'>Status: Assigned</option>
                <option value='Eligible'>Status: Eligible</option>
              </select>
              <IconChevronDown
                size={16}
                className='pointer-events-none absolute top-3 right-3 text-muted-foreground'
              />
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-190 text-left text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                <th className='px-5 py-3'>Employee</th>
                <th className='px-4 py-3'>Department</th>
                <th className='px-4 py-3'>Branch</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-5 py-3 text-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className='border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/30'
                >
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className='font-semibold'>{user.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {user.employeeId} · {user.position}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3.5'>{user.department}</td>
                  <td className='px-4 py-3.5 text-muted-foreground'>{user.branch}</td>
                  <td className='px-4 py-3.5'>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                        getStatusClass(user.status),
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className='px-5 py-3.5 text-center'>
                    {user.status === 'Assigned' ? (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        disabled={removeUserMutation.isPending}
                        onClick={() => void handleRemove(user.id, user.name)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => setAssignmentDialog({ initialUserIds: [user.id] })}
                      >
                        Assign
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className='px-5 py-14 text-center text-muted-foreground'>
                    No users match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='border-t border-blue-100 bg-blue-50 px-5 py-3 text-xs font-medium text-blue-700 dark:border-blue-950 dark:bg-blue-950/30 dark:text-blue-400'>
          Role permission and assignment changes are recorded in Audit Trail.
        </div>
      </section>

      {assignmentDialog && (
        <AssignUsersDialog
          roleName={role.name}
          users={eligibleUsers}
          initialUserIds={assignmentDialog.initialUserIds}
          isPending={assignUsersMutation.isPending}
          onClose={() => setAssignmentDialog(null)}
          onAssign={handleAssign}
        />
      )}
    </AppMain>
  )
}
