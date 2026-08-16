import { zodResolver } from '@hookform/resolvers/zod'
import { IconSearch, IconUserPlus } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { DatePicker } from '@/shared/components/ui/date-picker'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { useSchema } from '@/shared/lib/schema'
import { cn } from '@/shared/lib/utils'
import type { RoleAssignmentUser } from '@/features/settings/role-access/types'
import { m } from '@/i18n/paraglide/messages'

type AssignUsersDialogProps = Readonly<{
  roleName: string
  users: RoleAssignmentUser[]
  initialUserIds?: string[]
  isPending?: boolean
  onClose: () => void
  onAssign: (userIds: string[], effectiveDate: string, notifyUsers: boolean) => void
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

  const formSchema = useSchema(() => ({
    userIds: z.array(z.string().min(1)).min(1, { message: m.role_access_validation_user() }),
    effectiveDate: z.string().min(1, { message: m.role_access_validation_effective_date() }),
    notifyUsers: z.boolean(),
  }))

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: initialUserIds,
      effectiveDate: dayjs().format('YYYY-MM-DD'),
      notifyUsers: true,
    },
  })

  const userIds = useWatch({ control, name: 'userIds' })
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

  const toggleUser = (userId: string, currentIds: string[], onChange: (ids: string[]) => void) => {
    const next = new Set(currentIds)
    if (next.has(userId)) next.delete(userId)
    else next.add(userId)
    onChange([...next])
  }

  const toggleAll = (checked: boolean, currentIds: string[], onChange: (ids: string[]) => void) => {
    const next = new Set(currentIds)
    filteredUsers.forEach((user) => {
      if (checked) next.add(user.id)
      else next.delete(user.id)
    })
    onChange([...next])
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
          <DialogTitle>{m.role_access_assign_dialog_title({ roleName })}</DialogTitle>
          <DialogDescription>{m.role_access_assign_dialog_description()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submitAssignment} noValidate>
          <FieldGroup className='gap-3'>
            <div className='relative'>
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

            <div className='grid gap-2 sm:grid-cols-2'>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger
                  aria-label={m.role_access_filter_department()}
                  className='h-9 w-full rounded-lg border-input bg-background text-xs'
                >
                  <SelectValue
                    placeholder={m.role_access_department_filter({ value: m.role_access_all() })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((value) => (
                    <SelectItem key={value} value={value}>
                      {m.role_access_department_filter({
                        value: value === 'All' ? m.role_access_all() : value,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger
                  aria-label={m.role_access_filter_branch()}
                  className='h-9 w-full rounded-lg border-input bg-background text-xs'
                >
                  <SelectValue
                    placeholder={m.role_access_branch_filter({ value: m.role_access_all() })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((value) => (
                    <SelectItem key={value} value={value}>
                      {m.role_access_branch_filter({
                        value: value === 'All' ? m.role_access_all() : value,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Controller
              name='userIds'
              control={control}
              render={({ field }) => {
                const fieldSelectedIds = new Set(field.value)
                const allFilteredSelected =
                  filteredUsers.length > 0 &&
                  filteredUsers.every((user) => fieldSelectedIds.has(user.id))

                return (
                  <Field data-invalid={!!errors.userIds}>
                    <div className='flex items-center justify-between border-y border-border py-2.5'>
                      <FieldLabel htmlFor='assign-select-all' className='cursor-pointer'>
                        <Checkbox
                          id='assign-select-all'
                          checked={allFilteredSelected}
                          onCheckedChange={(checked) =>
                            toggleAll(checked === true, field.value, field.onChange)
                          }
                        />
                        {m.role_access_select_all_eligible()}
                      </FieldLabel>
                      <span className='text-xs font-medium text-primary'>
                        {m.role_access_eligible_count({ count: filteredUsers.length })}
                      </span>
                    </div>

                    <div className='max-h-72 space-y-2 overflow-y-auto pr-1'>
                      {filteredUsers.map((user) => (
                        <FieldLabel
                          htmlFor={`assign-user-${user.id}`}
                          key={user.id}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40',
                            fieldSelectedIds.has(user.id) && 'border-primary/50 bg-primary/5',
                          )}
                        >
                          <Checkbox
                            id={`assign-user-${user.id}`}
                            checked={fieldSelectedIds.has(user.id)}
                            onCheckedChange={() => toggleUser(user.id, field.value, field.onChange)}
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
                        </FieldLabel>
                      ))}
                      {filteredUsers.length === 0 && (
                        <p className='py-8 text-center text-sm text-muted-foreground'>
                          {m.role_access_no_eligible_users()}
                        </p>
                      )}
                    </div>

                    <p className='text-xs font-semibold text-primary'>
                      {m.role_access_selected_users_count({ count: fieldSelectedIds.size })}
                    </p>
                    <FieldError errors={errors.userIds ? [errors.userIds] : undefined} />
                  </Field>
                )
              }}
            />

            <div className='grid items-end gap-3 sm:grid-cols-[1fr_1.4fr]'>
              <Controller
                name='effectiveDate'
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!errors.effectiveDate} className='gap-2'>
                    <FieldLabel htmlFor='assign-effective-date' className='text-xs'>
                      {m.role_access_effective_date()}
                    </FieldLabel>
                    <DatePicker
                      id='assign-effective-date'
                      mode='single'
                      placeholder={m.role_access_effective_date()}
                      selected={field.value ? dayjs(field.value).toDate() : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                      }
                      aria-invalid={!!errors.effectiveDate}
                      className='h-10 w-full rounded-lg border-input bg-background'
                    />
                    <FieldError
                      errors={errors.effectiveDate ? [errors.effectiveDate] : undefined}
                    />
                  </Field>
                )}
              />
              <Controller
                name='notifyUsers'
                control={control}
                render={({ field }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel
                      htmlFor='assign-notify-users'
                      className='flex h-10 cursor-pointer rounded-lg border border-border px-3 text-xs'
                    >
                      <Checkbox
                        id='assign-notify-users'
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                      {m.role_access_notify_users()}
                    </FieldLabel>
                  </Field>
                )}
              />
            </div>

            <p className='rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'>
              {m.role_access_eligible_info()}
            </p>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
                {m.role_access_cancel()}
              </Button>
              <Button type='submit' disabled={isPending || isSubmitting}>
                {(isPending || isSubmitting) && <Spinner />}
                {isPending
                  ? m.role_access_assigning()
                  : m.role_access_assign_count({ count: selectedIds.size })}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
