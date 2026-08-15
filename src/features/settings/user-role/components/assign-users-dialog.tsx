import { zodResolver } from '@hookform/resolvers/zod'
import { IconSearch, IconUserPlus } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { useSchema } from '@/shared/lib/schema'
import { cn } from '@/shared/lib/utils'
import type { RoleAssignmentUser } from '@/features/settings/user-role/data/types'

type AssignUsersDialogProps = Readonly<{
  roleName: string
  users: RoleAssignmentUser[]
  initialUserIds?: string[]
  isPending?: boolean
  onClose: () => void
  onAssign: (userIds: string[], effectiveDate: string, notifyUsers: boolean) => Promise<void>
}>

export function AssignUsersDialog({
  roleName,
  users,
  initialUserIds = [],
  isPending = false,
  onClose,
  onAssign,
}: AssignUsersDialogProps) {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [branch, setBranch] = useState('All')

  const formSchema = useSchema((z) => ({
    userIds: z.array(z.string().min(1)).min(1, { message: 'Select at least one user.' }),
    effectiveDate: z.string().min(1, { message: 'Effective date is required.' }),
    notifyUsers: z.boolean(),
  }))

  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: initialUserIds,
      effectiveDate: new Date().toISOString().slice(0, 10),
      notifyUsers: true,
    },
  })

  const userIds = useWatch({ control, name: 'userIds' })
  const notifyUsers = useWatch({ control, name: 'notifyUsers' })
  const selectedIds = useMemo(() => new Set(userIds), [userIds])

  const departments = useMemo(
    () => ['All', ...new Set(users.map((user) => user.department))],
    [users],
  )
  const branches = useMemo(() => ['All', ...new Set(users.map((user) => user.branch))], [users])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.employeeId.toLowerCase().includes(normalizedSearch) ||
        user.department.toLowerCase().includes(normalizedSearch)
      const matchesDepartment = department === 'All' || user.department === department
      const matchesBranch = branch === 'All' || user.branch === branch

      return matchesSearch && matchesDepartment && matchesBranch
    })
  }, [branch, department, search, users])

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => selectedIds.has(user.id))

  const toggleUser = (userId: string) => {
    const next = new Set(selectedIds)
    if (next.has(userId)) next.delete(userId)
    else next.add(userId)
    setValue('userIds', [...next], { shouldDirty: true, shouldValidate: true })
  }

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedIds)
    filteredUsers.forEach((user) => {
      if (checked) next.add(user.id)
      else next.delete(user.id)
    })
    setValue('userIds', [...next], { shouldDirty: true, shouldValidate: true })
  }

  const submitAssignment = handleSubmit((values) =>
    onAssign(values.userIds, values.effectiveDate, values.notifyUsers),
  )

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <div className='mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <IconUserPlus size={20} />
          </div>
          <DialogTitle>Assign Users to {roleName}</DialogTitle>
          <DialogDescription>
            Select eligible employees and define when their access becomes effective.
          </DialogDescription>
        </DialogHeader>

        <form className='space-y-3' onSubmit={submitAssignment} noValidate>
          <div className='relative'>
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

          <div className='grid gap-2 sm:grid-cols-2'>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className='h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary'
              aria-label='Filter department'
            >
              {departments.map((value) => (
                <option key={value} value={value}>
                  Department: {value}
                </option>
              ))}
            </select>
            <select
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              className='h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary'
              aria-label='Filter branch'
            >
              {branches.map((value) => (
                <option key={value} value={value}>
                  Branch: {value}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center justify-between border-y border-border py-2.5'>
            <label className='flex cursor-pointer items-center gap-2 text-sm font-medium'>
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
              Select all eligible users
            </label>
            <span className='text-xs font-medium text-primary'>
              {filteredUsers.length} eligible
            </span>
          </div>

          <div className='max-h-72 space-y-2 overflow-y-auto pr-1'>
            {filteredUsers.map((user) => (
              <label
                key={user.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40',
                  selectedIds.has(user.id) && 'border-primary/50 bg-primary/5',
                )}
              >
                <Checkbox
                  checked={selectedIds.has(user.id)}
                  onCheckedChange={() => toggleUser(user.id)}
                />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold'>{user.name}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {user.employeeId} · {user.department} · {user.branch}
                  </p>
                </div>
                <span className='hidden rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex'>
                  {user.position}
                </span>
              </label>
            ))}
            {filteredUsers.length === 0 && (
              <p className='py-8 text-center text-sm text-muted-foreground'>
                No eligible users match the filters.
              </p>
            )}
          </div>

          <p className='text-xs font-semibold text-primary'>{selectedIds.size} users selected</p>
          {errors.userIds?.message && (
            <p role='alert' className='text-xs font-medium text-destructive'>
              {errors.userIds.message}
            </p>
          )}

          <div className='grid items-end gap-3 sm:grid-cols-[1fr_1.4fr]'>
            <label className='block'>
              <span className='mb-2 block text-xs font-medium'>Effective date</span>
              <Input
                type='date'
                aria-invalid={!!errors.effectiveDate}
                {...register('effectiveDate')}
                className='h-10 rounded-lg border-input bg-background'
              />
              {errors.effectiveDate?.message && (
                <span role='alert' className='mt-1 block text-xs text-destructive'>
                  {errors.effectiveDate.message}
                </span>
              )}
            </label>
            <label className='flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium'>
              <Checkbox
                checked={notifyUsers}
                onCheckedChange={(checked) =>
                  setValue('notifyUsers', checked === true, { shouldDirty: true })
                }
              />
              Notify users about this role change
            </label>
          </div>

          <p className='rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'>
            Daftar ini hanya menampilkan user dari department dan branch yang eligible untuk role.
          </p>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending || isSubmitting}>
              {isPending
                ? 'Assigning...'
                : `Assign ${selectedIds.size} ${selectedIds.size === 1 ? 'User' : 'Users'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
