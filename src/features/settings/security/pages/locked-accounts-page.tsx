import { zodResolver } from '@hookform/resolvers/zod'
import { IconCircleCheck, IconLock } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
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
import { Spinner } from '@/shared/components/ui/spinner'
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
  useGetLockedAccountOptions,
  useGetLockedAccounts,
  useGetLockedAccountsStats,
  useUnlockLockedAccount,
} from '@/features/settings/security/hooks'
import type {
  LockedAccount,
  LockedAccountFilterParams,
  LockedAccountReason,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

interface LockedAccountStatCardProps {
  icon: typeof IconLock
  label: string
  value: number
  detail: string
  variant: 'amber' | 'emerald'
}

function LockedAccountStatCard({
  icon: Icon,
  label,
  value,
  detail,
  variant,
}: Readonly<LockedAccountStatCardProps>) {
  return (
    <Card size='sm'>
      <CardContent className='flex items-center gap-3'>
        <Badge variant={variant} className='size-11 rounded-xl p-0'>
          <Icon />
        </Badge>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <CardDescription>{label}</CardDescription>
          <CardTitle>{value.toLocaleString()}</CardTitle>
          <Badge variant={variant}>{detail}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function getReasonLabel(reason: LockedAccountReason) {
  const labels: Record<LockedAccountReason, string> = {
    FailedAttempts: m.security_locked_reason_failed_attempts(),
    SuspiciousActivity: m.security_locked_reason_suspicious_activity(),
    ManualLock: m.security_locked_reason_manual_lock(),
  }
  return labels[reason]
}

function getReasonBadgeVariant(reason: LockedAccountReason) {
  switch (reason) {
    case 'FailedAttempts':
      return 'amber'
    case 'SuspiciousActivity':
      return 'red'
    case 'ManualLock':
      return 'slate'
  }
}

export function LockedAccountsPage() {
  const [filters, setFilters] = useState<LockedAccountFilterParams>({})
  const [accountToUnlock, setAccountToUnlock] = useState<LockedAccount | null>(null)
  const statsQuery = useGetLockedAccountsStats()
  const optionsQuery = useGetLockedAccountOptions()
  const accountsQuery = useGetLockedAccounts(filters)
  const unlockMutation = useUnlockLockedAccount()
  const filterSchema = useSchema((z) => ({
    employeeName: z
      .string()
      .trim()
      .max(100, { message: m.security_locked_employee_name_invalid() }),
    departmentId: z.string(),
    reason: z.enum(['All', 'FailedAttempts', 'SuspiciousActivity', 'ManualLock']),
  }))
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      employeeName: '',
      departmentId: 'All',
      reason: 'All',
    },
  })

  if (
    statsQuery.isPending ||
    optionsQuery.isPending ||
    accountsQuery.isPending ||
    statsQuery.error ||
    optionsQuery.error ||
    accountsQuery.error ||
    !statsQuery.data ||
    !optionsQuery.data ||
    !accountsQuery.data
  ) {
    return (
      <AppMain
        pending={statsQuery.isPending || optionsQuery.isPending || accountsQuery.isPending}
        error={statsQuery.error ?? optionsQuery.error ?? accountsQuery.error}
        retry={() => {
          void statsQuery.refetch()
          void optionsQuery.refetch()
          void accountsQuery.refetch()
        }}
        notFound={!statsQuery.data || !optionsQuery.data || !accountsQuery.data}
      />
    )
  }

  const stats = statsQuery.data
  const accounts = accountsQuery.data.accounts

  const handleFilter = (values: z.infer<typeof filterSchema>) => {
    setFilters({
      employeeName: values.employeeName || undefined,
      departmentId: values.departmentId === 'All' ? undefined : values.departmentId,
      reason: values.reason === 'All' ? undefined : values.reason,
    })
  }

  const handleUnlockAccount = () => {
    if (!accountToUnlock) {
      return
    }

    unlockMutation.mutate(accountToUnlock.id, {
      onSuccess: () => {
        snackbar.success(m.security_locked_unlock_success())
        setAccountToUnlock(null)
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/security', label: m.app_layout_nav_security() },
        { to: '/settings/security/password', label: m.security_password_title() },
        { label: m.security_locked_title() },
      ]}
      backTo='/settings/security/password'
      title={m.security_locked_title()}
      subtitle={m.security_locked_subtitle()}
    >
      <div className='grid gap-3 sm:grid-cols-2'>
        <LockedAccountStatCard
          icon={IconLock}
          label={m.security_locked_stat_locked_now()}
          value={stats.lockedNow}
          detail={m.security_locked_stat_current_lockouts()}
          variant='amber'
        />
        <LockedAccountStatCard
          icon={IconCircleCheck}
          label={m.security_locked_stat_unlocked_today()}
          value={stats.unlockedToday}
          detail={m.security_locked_stat_successful_unlocks()}
          variant='emerald'
        />
      </div>

      <Card className='gap-0 py-0'>
        <CardHeader className='border-b py-5'>
          <form onSubmit={handleSubmit(handleFilter)} noValidate>
            <FieldGroup className='grid gap-3 lg:grid-cols-[minmax(240px,1.4fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]'>
              <Field data-invalid={!!errors.employeeName}>
                <FieldLabel htmlFor='locked-account-employee-name'>
                  {m.security_locked_employee_name_label()}
                </FieldLabel>
                <Input
                  id='locked-account-employee-name'
                  placeholder={m.security_locked_employee_name_placeholder()}
                  aria-invalid={!!errors.employeeName}
                  {...register('employeeName')}
                />
                <FieldError errors={errors.employeeName ? [errors.employeeName] : undefined} />
              </Field>

              <Controller
                name='departmentId'
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='locked-account-department'>
                      {m.security_locked_department_label()}
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='locked-account-department' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='All'>{m.security_locked_all_departments()}</SelectItem>
                          {optionsQuery.data.departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                name='reason'
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='locked-account-reason'>
                      {m.security_locked_reason_label()}
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='locked-account-reason' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='All'>{m.security_locked_all_reasons()}</SelectItem>
                          {optionsQuery.data.reasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {getReasonLabel(reason.value)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Field className='justify-end'>
                <Button type='submit' variant='outline' disabled={accountsQuery.isFetching}>
                  {accountsQuery.isFetching && <Spinner data-icon='inline-start' />}
                  {m.security_locked_filter_button()}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardHeader>
        <CardContent className='p-0'>
          <Table className='min-w-240'>
            <TableHeader>
              <TableRow>
                <TableHead>{m.security_locked_table_name()}</TableHead>
                <TableHead>{m.security_locked_table_employee_number()}</TableHead>
                <TableHead>{m.security_locked_table_department()}</TableHead>
                <TableHead>{m.security_locked_table_failed()}</TableHead>
                <TableHead>{m.security_locked_table_locked_since()}</TableHead>
                <TableHead>{m.security_locked_table_last_ip()}</TableHead>
                <TableHead>{m.security_locked_reason_label()}</TableHead>
                <TableHead>{m.security_locked_table_action()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.employeeName}</TableCell>
                  <TableCell>{account.employeeNumber}</TableCell>
                  <TableCell>{account.departmentName}</TableCell>
                  <TableCell>{account.failedAttempts}</TableCell>
                  <TableCell>{dayjs(account.lockedSince).format('DD MMM YYYY, HH:mm')}</TableCell>
                  <TableCell>{account.lastIpAddress}</TableCell>
                  <TableCell>
                    <Badge variant={getReasonBadgeVariant(account.reason)}>
                      {getReasonLabel(account.reason)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setAccountToUnlock(account)}
                    >
                      {m.security_locked_unlock_button()}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className='h-32 text-center text-muted-foreground'>
                    {m.security_locked_no_accounts()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={accountToUnlock !== null}
        onOpenChange={(open) => {
          if (!open && !unlockMutation.isPending) {
            setAccountToUnlock(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.security_locked_unlock_confirm_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.security_locked_unlock_confirm_description({
                name: accountToUnlock?.employeeName ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlockMutation.isPending}>
              {m.security_locked_cancel_button()}
            </AlertDialogCancel>
            <AlertDialogAction disabled={unlockMutation.isPending} onClick={handleUnlockAccount}>
              {unlockMutation.isPending && <Spinner data-icon='inline-start' />}
              {m.security_locked_confirm_button()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppMain>
  )
}
