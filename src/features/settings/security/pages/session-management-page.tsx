import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconClock,
  IconCopy,
  IconDeviceDesktop,
  IconLogout,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle } from '@/shared/components/ui/empty'
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
import { Skeleton } from '@/shared/components/ui/skeleton'
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
import { SessionTimeoutSettingsDialog } from '@/features/settings/security/components/session-timeout-settings-dialog'
import {
  useGetSessionManagement,
  useLogoutAllSessions,
  useTerminateSession,
} from '@/features/settings/security/hooks'
import type {
  ActiveSession,
  SessionManagementFilterParams,
  SessionState,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

interface SessionStatCardProps {
  icon: typeof IconUsers
  label: string
  value: string
  detail: string
  variant: 'emerald' | 'blue' | 'amber' | 'violet'
}

function SessionStatCard({
  icon: Icon,
  label,
  value,
  detail,
  variant,
}: Readonly<SessionStatCardProps>) {
  return (
    <Card size='sm'>
      <CardContent className='flex items-center gap-3'>
        <Badge variant={variant} className='size-11 shrink-0 rounded-xl p-0'>
          <Icon />
        </Badge>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <CardDescription className='truncate'>{label}</CardDescription>
          <CardTitle>{value}</CardTitle>
          <Badge variant={variant}>{detail}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function getStateLabel(state: SessionState) {
  const labels = {
    Current: m.security_session_state_current(),
    Active: m.security_session_state_active(),
    Idle: m.security_session_state_idle(),
  }
  return labels[state]
}

function getStateVariant(state: SessionState) {
  const variants = {
    Current: 'blue',
    Active: 'green',
    Idle: 'amber',
  } as const
  return variants[state]
}

export function SessionManagementPage() {
  const [filters, setFilters] = useState<SessionManagementFilterParams>({})
  const [sessionToTerminate, setSessionToTerminate] = useState<ActiveSession | null>(null)
  const [logoutAllOpen, setLogoutAllOpen] = useState(false)
  const [timeoutSettingsOpen, setTimeoutSettingsOpen] = useState(false)
  const sessionQuery = useGetSessionManagement(filters)
  const terminateMutation = useTerminateSession()
  const logoutAllMutation = useLogoutAllSessions()
  const filterSchema = useSchema((z) => ({
    search: z.string().trim().max(100, { message: m.security_session_filter_search_invalid() }),
    roleId: z.string(),
    branchId: z.string(),
  }))
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: '',
      roleId: 'All',
      branchId: 'All',
    },
  })

  if (sessionQuery.isPending || sessionQuery.error || !sessionQuery.data) {
    return (
      <AppMain
        pending={sessionQuery.isPending}
        error={sessionQuery.error}
        retry={() => void sessionQuery.refetch()}
        notFound={!sessionQuery.data}
      />
    )
  }

  const sessionData = sessionQuery.data
  const isTableLoading = sessionQuery.isFetching
  const isSensitiveActionPending = terminateMutation.isPending || logoutAllMutation.isPending

  const handleFilter = (values: z.infer<typeof filterSchema>) => {
    setFilters({
      search: values.search || undefined,
      roleId: values.roleId === 'All' ? undefined : values.roleId,
      branchId: values.branchId === 'All' ? undefined : values.branchId,
    })
  }

  const handleTerminateSession = () => {
    if (!sessionToTerminate) return

    terminateMutation.mutate(sessionToTerminate.id, {
      onSuccess: () => {
        snackbar.success(m.security_session_terminate_success())
        setSessionToTerminate(null)
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  const handleLogoutAllSessions = () => {
    logoutAllMutation.mutate(
      { excludeCurrentSession: true },
      {
        onSuccess: (response) => {
          snackbar.success(
            m.security_session_logout_all_success({
              count: response.data.terminatedSessions,
            }),
          )
          setLogoutAllOpen(false)
        },
        onError: (error) => snackbar.exception(error),
      },
    )
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/security', label: m.app_layout_nav_security() },
        { label: m.security_session_title() },
      ]}
      backTo='/settings/security'
      title={m.security_session_title()}
      subtitle={m.security_session_subtitle()}
      actions={
        <Button type='button' onClick={() => setTimeoutSettingsOpen(true)}>
          <IconSettings data-icon='inline-start' />
          {m.security_session_timeout_button()}
        </Button>
      }
    >
      <div className='flex min-w-0 flex-col gap-4'>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <SessionStatCard
            icon={IconUsers}
            label={m.security_session_stat_active_users()}
            value={sessionData.stats.activeUsers.toLocaleString()}
            detail={m.security_session_stat_current_users()}
            variant='emerald'
          />
          <SessionStatCard
            icon={IconDeviceDesktop}
            label={m.security_session_stat_active_sessions()}
            value={sessionData.stats.activeSessions.toLocaleString()}
            detail={m.security_session_stat_across_devices()}
            variant='blue'
          />
          <SessionStatCard
            icon={IconClock}
            label={m.security_session_stat_idle({
              minutes: sessionData.timeoutSettings.idleTimeoutMinutes,
            })}
            value={sessionData.stats.idleSessions.toLocaleString()}
            detail={m.security_session_stat_near_timeout()}
            variant='amber'
          />
          <SessionStatCard
            icon={IconCopy}
            label={m.security_session_stat_concurrent()}
            value={m.security_session_timeout_sessions({
              count: sessionData.stats.maxConcurrentSessions,
            })}
            detail={m.security_session_stat_policy_limit()}
            variant='violet'
          />
        </div>

        <Card className='min-w-0 gap-0 py-0'>
          <CardHeader className='border-b p-5'>
            <CardTitle>{m.security_session_directory_title()}</CardTitle>
            <CardDescription>{m.security_session_directory_description()}</CardDescription>
            <form onSubmit={handleSubmit(handleFilter)} noValidate>
              <FieldGroup className='grid gap-2 pt-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_220px_auto]'>
                <Field data-invalid={!!errors.search} className='gap-1'>
                  <FieldLabel htmlFor='session-search' className='sr-only'>
                    {m.security_session_filter_search_label()}
                  </FieldLabel>
                  <div className='relative'>
                    <IconSearch
                      size={16}
                      className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                    />
                    <Input
                      id='session-search'
                      className='pl-9'
                      placeholder={m.security_session_filter_search_placeholder()}
                      aria-invalid={!!errors.search}
                      {...register('search')}
                    />
                  </div>
                  <FieldError errors={errors.search ? [errors.search] : undefined} />
                </Field>

                <Controller
                  name='roleId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.roleId} className='gap-1'>
                      <FieldLabel htmlFor='session-role' className='sr-only'>
                        {m.security_session_filter_role_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id='session-role'
                          className='w-full'
                          aria-invalid={!!errors.roleId}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='All'>
                              {m.security_session_filter_all_roles()}
                            </SelectItem>
                            {sessionData.filterOptions.roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError errors={errors.roleId ? [errors.roleId] : undefined} />
                    </Field>
                  )}
                />

                <Controller
                  name='branchId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.branchId} className='gap-1'>
                      <FieldLabel htmlFor='session-branch' className='sr-only'>
                        {m.security_session_filter_branch_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id='session-branch'
                          className='w-full'
                          aria-invalid={!!errors.branchId}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='All'>
                              {m.security_session_filter_all_branches()}
                            </SelectItem>
                            {sessionData.filterOptions.branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError errors={errors.branchId ? [errors.branchId] : undefined} />
                    </Field>
                  )}
                />

                <Field className='justify-end'>
                  <Button
                    type='submit'
                    variant='outline'
                    className='w-full xl:w-auto'
                    disabled={isTableLoading}
                  >
                    {isTableLoading && <Spinner data-icon='inline-start' />}
                    {m.security_session_filter_button()}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardHeader>

          <CardContent className='min-w-0 p-2 sm:p-4'>
            <div className='min-w-0 rounded-lg border border-border'>
              <Table className='w-full table-fixed text-left' aria-busy={isTableLoading}>
                <TableHeader className='border-b border-border/60 bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  <TableRow>
                    <TableHead className='w-[26%] px-2 py-3 sm:w-[24%] sm:px-4 md:w-[22%] lg:w-[20%] xl:w-[16%]'>
                      {m.security_session_table_user()}
                    </TableHead>
                    <TableHead className='hidden w-[18%] px-4 py-3 md:table-cell lg:w-[15%] xl:w-[12%]'>
                      {m.security_session_table_role()}
                    </TableHead>
                    <TableHead className='w-[34%] px-2 py-3 sm:w-[38%] sm:px-4 md:w-[28%] lg:w-[24%] xl:w-[18%]'>
                      {m.security_session_table_device()}
                    </TableHead>
                    <TableHead className='hidden w-[10%] px-4 py-3 xl:table-cell'>
                      {m.security_session_table_started()}
                    </TableHead>
                    <TableHead className='hidden w-[17%] px-4 py-3 lg:table-cell xl:w-[12%]'>
                      {m.security_session_table_last_activity()}
                    </TableHead>
                    <TableHead className='hidden w-[12%] px-4 py-3 xl:table-cell'>
                      {m.security_session_table_location()}
                    </TableHead>
                    <TableHead className='w-[24%] px-2 py-3 sm:w-[22%] sm:px-4 md:w-[18%] lg:w-[14%] xl:w-[10%]'>
                      {m.security_session_table_state()}
                    </TableHead>
                    <TableHead className='w-[16%] px-2 py-3 text-center sm:w-[16%] sm:px-4 md:w-[14%] lg:w-[10%] xl:w-[10%]'>
                      {m.security_session_table_action()}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTableLoading &&
                    Array.from({ length: 5 }, (_, rowIndex) => (
                      <TableRow key={`session-skeleton-${rowIndex}`}>
                        <TableCell className='px-2 py-4 sm:px-4'>
                          <Skeleton className='h-4 w-full max-w-24' />
                        </TableCell>
                        <TableCell className='hidden px-4 py-4 md:table-cell'>
                          <Skeleton className='h-4 w-full max-w-20' />
                        </TableCell>
                        <TableCell className='px-2 py-4 sm:px-4'>
                          <div className='flex flex-col gap-1'>
                            <Skeleton className='h-4 w-full max-w-24' />
                            <Skeleton className='h-3 w-full max-w-20' />
                          </div>
                        </TableCell>
                        <TableCell className='hidden px-4 py-4 xl:table-cell'>
                          <Skeleton className='h-4 w-full max-w-16' />
                        </TableCell>
                        <TableCell className='hidden px-4 py-4 lg:table-cell'>
                          <Skeleton className='h-4 w-full max-w-20' />
                        </TableCell>
                        <TableCell className='hidden px-4 py-4 xl:table-cell'>
                          <Skeleton className='h-4 w-full max-w-20' />
                        </TableCell>
                        <TableCell className='px-2 py-4 sm:px-4'>
                          <Skeleton className='h-6 w-full max-w-20 rounded-full' />
                        </TableCell>
                        <TableCell className='px-2 py-4 sm:px-4'>
                          <Skeleton className='mx-auto size-7 rounded-md' />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isTableLoading && sessionData.sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Empty className='border-0 p-8'>
                          <EmptyHeader>
                            <EmptyTitle>{m.security_session_empty()}</EmptyTitle>
                          </EmptyHeader>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isTableLoading &&
                    sessionData.sessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className='border-t border-border/80 text-sm text-foreground transition-colors hover:bg-muted/30'
                      >
                        <TableCell className='min-w-0 px-2 py-3 sm:px-4'>
                          <div className='flex min-w-0 flex-col gap-1'>
                            <span className='truncate font-semibold' title={session.userName}>
                              {session.userName}
                            </span>
                            <span className='truncate text-xs text-muted-foreground'>
                              {session.employeeNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='hidden min-w-0 px-4 py-3 md:table-cell'>
                          <span className='block truncate' title={session.roleName}>
                            {session.roleName}
                          </span>
                        </TableCell>
                        <TableCell className='min-w-0 px-2 py-3 sm:px-4'>
                          <div className='flex min-w-0 flex-col gap-1'>
                            <span className='truncate font-medium' title={session.deviceName}>
                              {session.deviceName}
                            </span>
                            <span
                              className='truncate text-xs text-muted-foreground'
                              title={`${session.operatingSystem} · ${session.ipAddress}`}
                            >
                              {session.operatingSystem} · {session.ipAddress}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className='hidden px-4 py-3 text-muted-foreground xl:table-cell'
                          title={dayjs(session.startedAt).format('DD MMM YYYY, HH:mm')}
                        >
                          {dayjs(session.startedAt).format('HH:mm')}
                        </TableCell>
                        <TableCell
                          className='hidden px-4 py-3 text-muted-foreground lg:table-cell'
                          title={dayjs(session.lastActivityAt).format('DD MMM YYYY, HH:mm')}
                        >
                          {dayjs(session.lastActivityAt).format('HH:mm')}
                        </TableCell>
                        <TableCell className='hidden min-w-0 px-4 py-3 xl:table-cell'>
                          <span className='block truncate' title={session.branchName}>
                            {session.branchName}
                          </span>
                        </TableCell>
                        <TableCell className='px-2 py-3 sm:px-4'>
                          <Badge
                            variant={getStateVariant(session.state)}
                            className='max-w-full truncate'
                          >
                            {getStateLabel(session.state)}
                          </Badge>
                        </TableCell>
                        <TableCell className='px-2 py-3 text-center sm:px-4'>
                          {session.state === 'Current' ? (
                            <span className='text-muted-foreground'>—</span>
                          ) : (
                            <>
                              <Button
                                type='button'
                                variant='destructive'
                                size='icon-xs'
                                className='sm:hidden'
                                aria-label={m.security_session_terminate_label({
                                  name: session.userName,
                                })}
                                disabled={isSensitiveActionPending}
                                onClick={() => setSessionToTerminate(session)}
                              >
                                <IconLogout data-icon='inline-start' />
                              </Button>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='hidden sm:inline-flex'
                                disabled={isSensitiveActionPending}
                                onClick={() => setSessionToTerminate(session)}
                              >
                                {m.security_session_terminate_button()}
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          <CardFooter className='flex-col items-stretch justify-between gap-3 border-t p-5 sm:flex-row sm:items-center'>
            <CardDescription>{m.security_session_sensitive_notice()}</CardDescription>
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              disabled={isSensitiveActionPending || sessionData.stats.activeSessions <= 1}
              onClick={() => setLogoutAllOpen(true)}
            >
              <IconLogout data-icon='inline-start' />
              {m.security_session_logout_all_button()}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <SessionTimeoutSettingsDialog
        open={timeoutSettingsOpen}
        settings={sessionData.timeoutSettings}
        onOpenChange={setTimeoutSettingsOpen}
      />

      <AlertDialog
        open={sessionToTerminate !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !terminateMutation.isPending) setSessionToTerminate(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.security_session_terminate_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.security_session_terminate_description({
                name: sessionToTerminate?.userName ?? '',
                device: sessionToTerminate?.deviceName ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={terminateMutation.isPending}>
              {m.security_session_terminate_cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={terminateMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                handleTerminateSession()
              }}
            >
              {terminateMutation.isPending && <Spinner data-icon='inline-start' />}
              {m.security_session_terminate_confirm()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={logoutAllOpen}
        onOpenChange={(nextOpen) => {
          if (!logoutAllMutation.isPending) setLogoutAllOpen(nextOpen)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.security_session_logout_all_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.security_session_logout_all_description()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={logoutAllMutation.isPending}>
              {m.security_session_logout_all_cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={logoutAllMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                handleLogoutAllSessions()
              }}
            >
              {logoutAllMutation.isPending && <Spinner data-icon='inline-start' />}
              {m.security_session_logout_all_confirm()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppMain>
  )
}
