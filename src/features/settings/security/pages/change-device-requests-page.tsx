import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconCircleCheck,
  IconClock,
  IconEye,
  IconRefresh,
  IconSearch,
  IconX,
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
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
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
import {
  useApproveDeviceChangeRequest,
  useGetDeviceChangeRequests,
  useRejectDeviceChangeRequest,
} from '@/features/settings/security/hooks'
import type {
  DeviceChangeRequest,
  DeviceChangeRequestFilterParams,
  DeviceChangeRequestReason,
  DeviceChangeRequestStatus,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

interface ChangeRequestStatCardProps {
  icon: typeof IconClock
  label: string
  value: string
  detail: string
  variant: 'amber' | 'emerald' | 'red' | 'blue'
}

function ChangeRequestStatCard({
  icon: Icon,
  label,
  value,
  detail,
  variant,
}: Readonly<ChangeRequestStatCardProps>) {
  return (
    <Card size='sm'>
      <CardContent className='flex items-center gap-3'>
        <Badge variant={variant} className='size-11 shrink-0 rounded-xl p-0'>
          <Icon />
        </Badge>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <CardDescription>{label}</CardDescription>
          <CardTitle>{value}</CardTitle>
          <span className='text-xs text-muted-foreground'>{detail}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function getReasonLabel(reason: DeviceChangeRequestReason) {
  const labels: Record<DeviceChangeRequestReason, string> = {
    PhoneReplaced: m.security_device_changes_reason_phone_replaced(),
    DeviceDamaged: m.security_device_changes_reason_device_damaged(),
    NewCompanyPhone: m.security_device_changes_reason_new_company_phone(),
    LostDevice: m.security_device_changes_reason_lost_device(),
    SecurityIssue: m.security_device_changes_reason_security_issue(),
  }
  return labels[reason]
}

function getStatusLabel(status: DeviceChangeRequestStatus) {
  const labels: Record<DeviceChangeRequestStatus, string> = {
    Pending: m.security_device_changes_status_pending(),
    Approved: m.security_device_changes_status_approved(),
    Rejected: m.security_device_changes_status_rejected(),
  }
  return labels[status]
}

function getStatusVariant(status: DeviceChangeRequestStatus) {
  const variants = {
    Pending: 'amber',
    Approved: 'emerald',
    Rejected: 'red',
  } as const
  return variants[status]
}

export function ChangeDeviceRequestsPage() {
  const [filters, setFilters] = useState<DeviceChangeRequestFilterParams>({})
  const [selectedRequest, setSelectedRequest] = useState<DeviceChangeRequest | null>(null)
  const [requestToReject, setRequestToReject] = useState<DeviceChangeRequest | null>(null)
  const requestsQuery = useGetDeviceChangeRequests(filters)
  const approveMutation = useApproveDeviceChangeRequest()
  const rejectMutation = useRejectDeviceChangeRequest()
  const filterSchema = useSchema((z) => ({
    search: z
      .string()
      .trim()
      .max(100, { message: m.security_device_changes_filter_search_invalid() }),
    status: z.enum(['All', 'Pending', 'Approved', 'Rejected']),
    reason: z.enum([
      'All',
      'PhoneReplaced',
      'DeviceDamaged',
      'NewCompanyPhone',
      'LostDevice',
      'SecurityIssue',
    ]),
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
      status: 'All',
      reason: 'All',
    },
  })

  if (requestsQuery.isPending || requestsQuery.error || !requestsQuery.data) {
    return (
      <AppMain
        pending={requestsQuery.isPending}
        error={requestsQuery.error}
        retry={() => void requestsQuery.refetch()}
        notFound={!requestsQuery.data}
      />
    )
  }

  const { stats, requests } = requestsQuery.data
  const isActionPending = approveMutation.isPending || rejectMutation.isPending
  const isTableLoading = requestsQuery.isFetching

  const handleFilter = (values: z.infer<typeof filterSchema>) => {
    setFilters({
      search: values.search || undefined,
      status: values.status === 'All' ? undefined : values.status,
      reason: values.reason === 'All' ? undefined : values.reason,
    })
  }

  const handleApprove = () => {
    if (!selectedRequest) return

    approveMutation.mutate(selectedRequest.id, {
      onSuccess: () => {
        snackbar.success(m.security_device_changes_approve_success())
        setSelectedRequest(null)
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  const handleReject = () => {
    if (!requestToReject) return

    rejectMutation.mutate(requestToReject.id, {
      onSuccess: () => {
        snackbar.success(m.security_device_changes_reject_success())
        setRequestToReject(null)
        setSelectedRequest(null)
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/security', label: m.app_layout_nav_security() },
        { to: '/settings/security/device', label: m.security_device_title() },
        { label: m.security_device_changes_page_title() },
      ]}
      backTo='/settings/security/device'
      title={m.security_device_changes_page_title()}
      subtitle={m.security_device_changes_page_subtitle()}
    >
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <ChangeRequestStatCard
          icon={IconClock}
          label={m.security_device_changes_stat_pending()}
          value={stats.pending.toLocaleString()}
          detail={m.security_device_changes_stat_need_action()}
          variant='amber'
        />
        <ChangeRequestStatCard
          icon={IconCircleCheck}
          label={m.security_device_changes_stat_approved_today()}
          value={stats.approvedToday.toLocaleString()}
          detail={m.security_device_changes_stat_completed()}
          variant='emerald'
        />
        <ChangeRequestStatCard
          icon={IconX}
          label={m.security_device_changes_stat_rejected_today()}
          value={stats.rejectedToday.toLocaleString()}
          detail={m.security_device_changes_stat_policy_mismatch()}
          variant='red'
        />
        <ChangeRequestStatCard
          icon={IconRefresh}
          label={m.security_device_changes_stat_average_review()}
          value={m.security_device_changes_minutes({ minutes: stats.averageReviewMinutes })}
          detail={m.security_device_changes_stat_this_week()}
          variant='blue'
        />
      </div>

      <Card className='min-w-0 gap-0 py-0'>
        <CardHeader className='border-b py-5'>
          <CardTitle>{m.security_device_changes_directory_title()}</CardTitle>
          <CardDescription>{m.security_device_changes_directory_description()}</CardDescription>
          <form onSubmit={handleSubmit(handleFilter)} noValidate>
            <FieldGroup className='grid gap-2 pt-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_220px_auto]'>
              <Field data-invalid={!!errors.search} className='gap-1'>
                <FieldLabel htmlFor='device-change-search' className='sr-only'>
                  {m.security_device_changes_filter_search_label()}
                </FieldLabel>
                <div className='relative'>
                  <IconSearch
                    size={16}
                    className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                  />
                  <Input
                    id='device-change-search'
                    className='pl-9'
                    placeholder={m.security_device_changes_filter_search_placeholder()}
                    aria-invalid={!!errors.search}
                    {...register('search')}
                  />
                </div>
                <FieldError errors={errors.search ? [errors.search] : undefined} />
              </Field>

              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Field className='gap-1'>
                    <FieldLabel htmlFor='device-change-status' className='sr-only'>
                      {m.security_device_changes_filter_status_label()}
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='device-change-status' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='All'>
                            {m.security_device_changes_filter_all_statuses()}
                          </SelectItem>
                          {(['Pending', 'Approved', 'Rejected'] as const).map((status) => (
                            <SelectItem key={status} value={status}>
                              {getStatusLabel(status)}
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
                  <Field className='gap-1'>
                    <FieldLabel htmlFor='device-change-reason' className='sr-only'>
                      {m.security_device_changes_filter_reason_label()}
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='device-change-reason' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='All'>
                            {m.security_device_changes_filter_all_reasons()}
                          </SelectItem>
                          {(
                            [
                              'PhoneReplaced',
                              'DeviceDamaged',
                              'NewCompanyPhone',
                              'LostDevice',
                              'SecurityIssue',
                            ] as const
                          ).map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {getReasonLabel(reason)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                  {m.security_device_changes_filter_button()}
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
                  <TableHead className='w-[30%] px-2 py-3 sm:w-[24%] sm:px-4 lg:w-[20%]'>
                    {m.security_device_changes_table_employee()}
                  </TableHead>
                  <TableHead className='w-[32%] px-2 py-3 whitespace-normal sm:w-[38%] sm:px-4 md:w-[28%] lg:w-[22%]'>
                    {m.security_device_changes_table_device_change()}
                  </TableHead>
                  <TableHead className='hidden w-[18%] px-4 py-3 md:table-cell lg:w-[16%]'>
                    {m.security_device_changes_table_reason()}
                  </TableHead>
                  <TableHead className='hidden w-[16%] px-4 py-3 lg:table-cell'>
                    {m.security_device_changes_table_requested_at()}
                  </TableHead>
                  <TableHead className='w-[24%] px-2 py-3 sm:w-[22%] sm:px-4 md:w-[16%] lg:w-[14%]'>
                    {m.security_device_changes_table_status()}
                  </TableHead>
                  <TableHead className='w-[14%] px-2 py-3 text-center sm:w-[16%] sm:px-4 md:w-[14%] lg:w-[12%]'>
                    {m.security_device_changes_table_action()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTableLoading &&
                  Array.from({ length: 5 }, (_, rowIndex) => (
                    <TableRow key={`device-change-skeleton-${rowIndex}`}>
                      <TableCell className='px-2 py-4 sm:px-4'>
                        <Skeleton className='h-4 w-full max-w-24' />
                      </TableCell>
                      <TableCell className='px-2 py-4 sm:px-4'>
                        <div className='flex flex-col gap-1'>
                          <Skeleton className='h-4 w-full max-w-24' />
                          <Skeleton className='h-3 w-full max-w-20' />
                        </div>
                      </TableCell>
                      <TableCell className='hidden px-4 py-4 md:table-cell'>
                        <Skeleton className='h-4 w-full max-w-24' />
                      </TableCell>
                      <TableCell className='hidden px-4 py-4 lg:table-cell'>
                        <Skeleton className='h-4 w-full max-w-24' />
                      </TableCell>
                      <TableCell className='px-2 py-4 sm:px-4'>
                        <Skeleton className='h-6 w-full max-w-20 rounded-full' />
                      </TableCell>
                      <TableCell className='px-2 py-4 sm:px-4'>
                        <Skeleton className='mx-auto size-7 rounded-md' />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isTableLoading && requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Empty className='border-0 p-8'>
                        <EmptyHeader>
                          <EmptyTitle>{m.security_device_changes_empty()}</EmptyTitle>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
                {!isTableLoading &&
                  requests.map((request) => (
                    <TableRow
                      key={request.id}
                      className='border-t border-border/80 text-sm text-foreground transition-colors hover:bg-muted/30'
                    >
                      <TableCell className='min-w-0 px-2 py-3 font-semibold sm:px-4'>
                        <span className='block truncate' title={request.employeeName}>
                          {request.employeeName}
                        </span>
                      </TableCell>
                      <TableCell className='min-w-0 px-2 py-3 sm:px-4'>
                        <div className='flex min-w-0 flex-col gap-0.5'>
                          <span className='truncate font-medium' title={request.currentDevice.name}>
                            {request.currentDevice.name}
                          </span>
                          <span
                            className='truncate text-xs text-muted-foreground'
                            title={request.requestedDevice.name}
                          >
                            → {request.requestedDevice.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='hidden min-w-0 px-4 py-3 md:table-cell'>
                        <span className='block truncate' title={getReasonLabel(request.reason)}>
                          {getReasonLabel(request.reason)}
                        </span>
                      </TableCell>
                      <TableCell className='hidden px-4 py-3 text-muted-foreground lg:table-cell'>
                        {dayjs(request.requestedAt).format('DD MMM YYYY, HH:mm')}
                      </TableCell>
                      <TableCell className='px-2 py-3 sm:px-4'>
                        <Badge
                          variant={getStatusVariant(request.status)}
                          className='max-w-full truncate'
                        >
                          {getStatusLabel(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className='px-2 py-3 text-center sm:px-4'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon-xs'
                          className='sm:hidden'
                          aria-label={m.security_device_changes_review_title({
                            name: request.employeeName,
                          })}
                          onClick={() => setSelectedRequest(request)}
                        >
                          <IconEye data-icon='inline-start' />
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='hidden sm:inline-flex'
                          onClick={() => setSelectedRequest(request)}
                        >
                          {m.security_device_changes_review_button()}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={selectedRequest !== null}
        onOpenChange={(open) => {
          if (!open && !isActionPending) setSelectedRequest(null)
        }}
      >
        <DialogContent
          className='max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-x-hidden overflow-y-auto sm:max-w-3xl'
          showCloseButton={!isActionPending}
        >
          <DialogHeader>
            <DialogTitle>
              {m.security_device_changes_review_title({
                name: selectedRequest?.employeeName ?? '',
              })}
            </DialogTitle>
            <DialogDescription>{m.security_device_changes_review_description()}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className='grid gap-4 sm:grid-cols-2'>
              <Card size='sm' className='min-w-0'>
                <CardHeader>
                  <CardDescription>
                    {m.security_device_changes_current_device_label()}
                  </CardDescription>
                  <CardTitle>{selectedRequest.currentDevice.name}</CardTitle>
                </CardHeader>
                <CardContent className='flex min-w-0 flex-col gap-2 text-sm text-muted-foreground'>
                  <span className='break-words'>
                    {m.security_device_changes_device_id({
                      id: selectedRequest.currentDevice.deviceId,
                    })}
                  </span>
                  {selectedRequest.currentDevice.lastActiveAt && (
                    <span className='break-words'>
                      {m.security_device_changes_last_active({
                        time: dayjs(selectedRequest.currentDevice.lastActiveAt).format(
                          'DD MMM YYYY, HH:mm',
                        ),
                      })}
                    </span>
                  )}
                </CardContent>
              </Card>

              <Card size='sm' className='min-w-0'>
                <CardHeader>
                  <CardDescription>
                    {m.security_device_changes_requested_device_label()}
                  </CardDescription>
                  <CardTitle>{selectedRequest.requestedDevice.name}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-start gap-2'>
                  <Badge
                    variant={
                      selectedRequest.requestedDevice.verificationCompleted ? 'emerald' : 'amber'
                    }
                  >
                    {selectedRequest.requestedDevice.verificationCompleted
                      ? m.security_device_changes_verification_complete()
                      : m.security_device_changes_verification_pending()}
                  </Badge>
                  <Badge
                    variant={
                      selectedRequest.requestedDevice.securityChecksPassed ? 'emerald' : 'amber'
                    }
                  >
                    {selectedRequest.requestedDevice.securityChecksPassed
                      ? m.security_device_changes_security_checks_passed()
                      : m.security_device_changes_security_checks_pending()}
                  </Badge>
                </CardContent>
              </Card>

              <Card size='sm' className='sm:col-span-2'>
                <CardHeader>
                  <CardTitle>{m.security_device_changes_reason_label()}</CardTitle>
                  <CardDescription>{getReasonLabel(selectedRequest.reason)}</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-3'>
                  <p className='text-sm break-words'>{selectedRequest.reasonNote}</p>
                  <CardDescription>{m.security_device_changes_approval_notice()}</CardDescription>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline' disabled={isActionPending}>
                {m.security_device_changes_cancel_button()}
              </Button>
            </DialogClose>
            {selectedRequest?.status === 'Pending' && (
              <>
                <Button
                  type='button'
                  variant='destructive'
                  disabled={isActionPending}
                  onClick={() => setRequestToReject(selectedRequest)}
                >
                  {m.security_device_changes_reject_button()}
                </Button>
                <Button
                  type='button'
                  disabled={
                    isActionPending ||
                    !selectedRequest.requestedDevice.verificationCompleted ||
                    !selectedRequest.requestedDevice.securityChecksPassed
                  }
                  onClick={handleApprove}
                >
                  {approveMutation.isPending && <Spinner data-icon='inline-start' />}
                  {m.security_device_changes_approve_button()}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={requestToReject !== null}
        onOpenChange={(open) => {
          if (!open && !rejectMutation.isPending) setRequestToReject(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.security_device_changes_reject_confirm_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.security_device_changes_reject_confirm_description({
                name: requestToReject?.employeeName ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>
              {m.security_device_changes_cancel_button()}
            </AlertDialogCancel>
            <AlertDialogAction disabled={rejectMutation.isPending} onClick={handleReject}>
              {rejectMutation.isPending && <Spinner data-icon='inline-start' />}
              {m.security_device_changes_reject_confirm_button()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppMain>
  )
}
