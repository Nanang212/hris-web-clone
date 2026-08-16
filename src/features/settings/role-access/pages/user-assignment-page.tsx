import {
  IconSearch,
  IconShieldCheck,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'

import { m } from '@/i18n/paraglide/messages'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
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
import { AssignUsersDialog } from '@/features/settings/role-access/components/assign-users-dialog'
import {
  useAssignRoleUsers,
  useRemoveAllRoleUsers,
  useRemoveRoleUser,
  useRole,
  useRoleAssignments,
} from '@/features/settings/role-access/data/hooks'
import type {
  RoleAssignmentUser,
  UserAssignmentStatus,
} from '@/features/settings/role-access/data/types'

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

function getStatusLabel(status: string) {
  return status === 'Assigned'
    ? m.role_access_status_assigned()
    : m.role_access_status_eligible()
}

function getRoleStatusLabel(status: string) {
  const labels: Record<string, string> = {
    Active: m.role_access_status_active(),
    Inactive: m.role_access_status_inactive(),
    Draft: m.role_access_status_draft(),
  }
  return labels[status] ?? status
}

function getScopeLabel(scope: string) {
  const labels: Record<string, string> = {
    Company: m.role_access_scope_company(),
    Administrator: m.role_access_scope_administrator(),
    Self: m.role_access_scope_self(),
  }
  return labels[scope] ?? scope
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
        backTo='/settings/role-access'
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
      snackbar.success(m.role_access_assign_success({ count: userIds.length }))
    } catch (mutationError) {
      snackbar.exception(mutationError, m.role_access_assign_error())
    }
  }

  const handleRemove = async (userId: string, name: string) => {
    try {
      await removeUserMutation.mutateAsync({ id: roleId, userId })
      snackbar.success(m.role_access_remove_success({ name, roleName: role?.name ?? '' }))
    } catch (mutationError) {
      snackbar.exception(mutationError, m.role_access_remove_error({ name }))
    }
  }

  const handleBulkUnassign = async () => {
    try {
      await removeAllUsersMutation.mutateAsync(roleId)
      snackbar.success(m.role_access_remove_all_success({ roleName: role?.name ?? '' }))
    } catch (mutationError) {
      snackbar.exception(mutationError, m.role_access_remove_all_error({ roleName: role?.name ?? '' }))
    }
  }

  return (
    <AppMain
      backTo='/settings/role-access'
      breadcrumbs={[
        { to: '/', label: m.role_access_breadcrumb_settings() },
        { to: '/settings/role-access', label: m.role_access_title() },
        { label: m.role_access_user_assignment_title() },
      ]}
      title={m.role_access_user_assignment_title()}
      subtitle={m.role_access_user_assignment_subtitle()}
      actions={
        <Button type='button' onClick={() => setAssignmentDialog({ initialUserIds: [] })}>
          <IconUserPlus size={16} />
          {m.role_access_assign_users()}
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
              <p className='text-xs font-medium text-muted-foreground'>{m.role_access_selected_role()}</p>
              <h2 className='text-lg font-bold text-foreground'>{role?.name}</h2>
              <p className='text-xs text-muted-foreground'>
                {m.role_access_selected_role_meta({
                  code: role?.code ?? '',
                  scope: getScopeLabel(role?.scope ?? ''),
                  status: getRoleStatusLabel(role?.status ?? ''),
                })}
              </p>
            </div>
          </div>
          <p className='max-w-xl text-sm text-muted-foreground'>
            {m.role_access_selected_role_description()}
          </p>
        </div>
      </section>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {[
          {
            label: m.role_access_assigned_users(),
            value: assignedCount,
            note: m.role_access_active_role_members(),
            icon: IconUserCheck,
            tone: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50',
          },
          {
            label: m.role_access_eligible_users(),
            value: eligibleCount,
            note: m.role_access_available_to_assign(),
            icon: IconUsers,
            tone: 'text-blue-600 bg-blue-100 dark:bg-blue-950/50',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              size='sm'
              key={stat.label}
              className='gap-0 rounded-2xl border border-border bg-card py-0 shadow-sm'
            >
              <CardContent className='flex items-center gap-3 p-4'>
                <div className={cn('shrink-0 rounded-xl p-2.5', stat.tone)}>
                  <Icon size={18} />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-xs font-medium text-muted-foreground'>{stat.label}</p>
                  <p className='mt-1 text-2xl leading-none font-bold'>{stat.value}</p>
                  <p className='mt-1.5 truncate text-xs text-muted-foreground'>{stat.note}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='border-b border-border p-5 sm:p-6'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div>
              <h2 className='text-base font-bold'>{m.role_access_role_members()}</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                {m.role_access_role_members_description()}
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              disabled={assignedCount === 0 || removeAllUsersMutation.isPending}
              onClick={() => void handleBulkUnassign()}
            >
              {removeAllUsersMutation.isPending ? m.role_access_removing() : m.role_access_bulk_unassign()}
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
                placeholder={m.role_access_search_employee()}
                className='h-10 rounded-lg border-input bg-background pl-9'
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as UserAssignmentStatus | 'All')}
            >
              <SelectTrigger className='h-10 w-full rounded-lg border-input bg-background sm:w-48'>
                <SelectValue placeholder={m.role_access_status_all()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='All'>{m.role_access_status_all()}</SelectItem>
                <SelectItem value='Assigned'>{m.role_access_status_filter({ status: m.role_access_status_assigned() })}</SelectItem>
                <SelectItem value='Eligible'>{m.role_access_status_filter({ status: m.role_access_status_eligible() })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Table className='min-w-190 text-left'>
            <TableHeader>
              <TableRow className='border-b border-border bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                <TableHead className='px-5 py-3'>{m.role_access_employee()}</TableHead>
                <TableHead className='px-4 py-3'>{m.role_access_department()}</TableHead>
                <TableHead className='px-4 py-3'>{m.role_access_branch()}</TableHead>
                <TableHead className='px-4 py-3'>{m.role_access_status()}</TableHead>
                <TableHead className='px-5 py-3 text-center'>{m.role_access_action()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className='border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/30'
                >
                  <TableCell className='px-5 py-3.5'>
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
                  </TableCell>
                  <TableCell className='px-4 py-3.5'>{user.department}</TableCell>
                  <TableCell className='px-4 py-3.5 text-muted-foreground'>{user.branch}</TableCell>
                  <TableCell className='px-4 py-3.5'>
                    <Badge variant='secondary' className={getStatusClass(user.status)}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className='px-5 py-3.5 text-center'>
                    {user.status === 'Assigned' ? (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        disabled={removeUserMutation.isPending}
                        onClick={() => void handleRemove(user.id, user.name)}
                      >
                        {m.role_access_remove()}
                      </Button>
                    ) : (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => setAssignmentDialog({ initialUserIds: [user.id] })}
                      >
                        {m.role_access_assign_users()}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='px-5 py-14 text-center text-muted-foreground'>
                    {m.role_access_no_users()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='border-t border-blue-100 bg-blue-50 px-5 py-3 text-xs font-medium text-blue-700 dark:border-blue-950 dark:bg-blue-950/30 dark:text-blue-400'>
          {m.role_access_assignment_audit_note()}
        </div>
      </section>

      {assignmentDialog && (
        <AssignUsersDialog
          roleName={role?.name ?? ''}
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
