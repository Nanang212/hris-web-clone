import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceMobilePlus, IconEye, IconRefresh, IconShieldX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Empty, EmptyDescription } from '@/shared/components/ui/empty'
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
  useBlockRegisteredDevice,
  useGetRegisteredDevices,
  useResetRegisteredDeviceBinding,
} from '@/features/settings/security/hooks'
import type {
  RegisteredDevice,
  RegisteredDeviceFilterParams,
  RegisteredDeviceStatus,
  RegisteredDeviceTrustLevel,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

function getStatusLabel(status: RegisteredDeviceStatus) {
  const labels = {
    Active: m.security_registered_status_active(),
    Review: m.security_registered_status_review(),
    Blocked: m.security_registered_status_blocked(),
  }
  return labels[status]
}

function getStatusVariant(status: RegisteredDeviceStatus) {
  const variants = {
    Active: 'green',
    Review: 'amber',
    Blocked: 'red',
  } as const
  return variants[status]
}

function getTrustLabel(trustLevel: RegisteredDeviceTrustLevel) {
  const labels = {
    High: m.security_registered_trust_high(),
    Medium: m.security_registered_trust_medium(),
    Low: m.security_registered_trust_low(),
  }
  return labels[trustLevel]
}

function getTrustVariant(trustLevel: RegisteredDeviceTrustLevel) {
  const variants = {
    High: 'green',
    Medium: 'amber',
    Low: 'red',
  } as const
  return variants[trustLevel]
}

export function RegisteredDevicesPage() {
  const [filters, setFilters] = useState<RegisteredDeviceFilterParams>({})
  const [selectedDevice, setSelectedDevice] = useState<RegisteredDevice | null>(null)
  const devicesQuery = useGetRegisteredDevices(filters)
  const resetBindingMutation = useResetRegisteredDeviceBinding()
  const blockDeviceMutation = useBlockRegisteredDevice()
  const filterSchema = useSchema((z) => ({
    search: z.string().trim().max(100, { message: m.security_registered_search_invalid() }),
    status: z.enum(['All', 'Active', 'Review', 'Blocked']),
    trustLevel: z.enum(['All', 'High', 'Medium', 'Low']),
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
      trustLevel: 'All',
    },
  })

  if (devicesQuery.isPending || devicesQuery.error || !devicesQuery.data) {
    return (
      <AppMain
        pending={devicesQuery.isPending}
        error={devicesQuery.error}
        retry={() => void devicesQuery.refetch()}
        notFound={!devicesQuery.data}
      />
    )
  }

  const devices = devicesQuery.data.devices
  const isTableLoading = devicesQuery.isFetching
  const isActionPending = resetBindingMutation.isPending || blockDeviceMutation.isPending

  const handleFilter = (values: z.infer<typeof filterSchema>) => {
    setFilters({
      search: values.search || undefined,
      status: values.status === 'All' ? undefined : values.status,
      trustLevel: values.trustLevel === 'All' ? undefined : values.trustLevel,
    })
  }

  const handleResetBinding = () => {
    if (!selectedDevice) return

    resetBindingMutation.mutate(selectedDevice.id, {
      onSuccess: () => {
        snackbar.success(m.security_registered_reset_success())
        setSelectedDevice(null)
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  const handleBlockDevice = () => {
    if (!selectedDevice) return

    blockDeviceMutation.mutate(selectedDevice.id, {
      onSuccess: () => {
        snackbar.success(m.security_registered_block_success())
        setSelectedDevice(null)
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
        { label: m.security_registered_title() },
      ]}
      backTo='/settings/security/device'
      title={m.security_registered_title()}
      subtitle={m.security_registered_subtitle()}
      actions={
        <Button asChild>
          <Link to='/settings/security/device/register'>
            <IconDeviceMobilePlus data-icon='inline-start' />
            {m.security_registered_register_button()}
          </Link>
        </Button>
      }
    >
      <Card className='min-w-0 gap-0 py-0'>
        <CardHeader className='border-b py-5'>
          <CardTitle>{m.security_registered_directory_title()}</CardTitle>
          <CardDescription>{m.security_registered_directory_description()}</CardDescription>
          <form onSubmit={handleSubmit(handleFilter)} noValidate>
            <FieldGroup className='grid gap-3 pt-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]'>
              <Field data-invalid={!!errors.search}>
                <FieldLabel htmlFor='registered-device-search'>
                  {m.security_registered_search_label()}
                </FieldLabel>
                <Input
                  id='registered-device-search'
                  placeholder={m.security_registered_search_placeholder()}
                  aria-invalid={!!errors.search}
                  {...register('search')}
                />
                <FieldError errors={errors.search ? [errors.search] : undefined} />
              </Field>

              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='registered-device-status'>
                      {m.security_registered_status_label()}
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='registered-device-status' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='All'>
                            {m.security_registered_all_statuses()}
                          </SelectItem>
                          {(['Active', 'Review', 'Blocked'] as const).map((status) => (
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
                name='trustLevel'
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='registered-device-trust'>
                      {m.security_registered_trust_label()}
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='registered-device-trust' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='All'>
                            {m.security_registered_all_trust_levels()}
                          </SelectItem>
                          {(['High', 'Medium', 'Low'] as const).map((trustLevel) => (
                            <SelectItem key={trustLevel} value={trustLevel}>
                              {getTrustLabel(trustLevel)}
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
                  {m.security_registered_filter_button()}
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
                  <TableHead className='w-[30%] px-2 py-3 sm:w-[24%] sm:px-4 lg:w-[20%] xl:w-[18%]'>
                    {m.security_registered_table_employee()}
                  </TableHead>
                  <TableHead className='w-[32%] px-2 py-3 whitespace-normal sm:w-[38%] sm:px-4 md:w-[30%] lg:w-[24%]'>
                    {m.security_registered_table_device()}
                  </TableHead>
                  <TableHead className='hidden w-[14%] px-4 py-3 xl:table-cell'>
                    {m.security_registered_table_registered()}
                  </TableHead>
                  <TableHead className='hidden w-[18%] px-4 py-3 lg:table-cell xl:w-[14%]'>
                    {m.security_registered_table_last_active()}
                  </TableHead>
                  <TableHead className='hidden w-[16%] px-4 py-3 md:table-cell lg:w-[14%] xl:w-[12%]'>
                    {m.security_registered_table_trust()}
                  </TableHead>
                  <TableHead className='w-[24%] px-2 py-3 sm:w-[22%] sm:px-4 md:w-[16%] lg:w-[14%] xl:w-[10%]'>
                    {m.security_registered_table_status()}
                  </TableHead>
                  <TableHead className='w-[14%] px-2 py-3 text-center sm:w-[16%] sm:px-4 md:w-[14%] lg:w-[10%] xl:w-[8%]'>
                    {m.security_registered_table_action()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTableLoading &&
                  Array.from({ length: 5 }, (_, rowIndex) => (
                    <TableRow key={`registered-device-skeleton-${rowIndex}`}>
                      <TableCell className='px-2 py-4 sm:px-4'>
                        <Skeleton className='h-4 w-full max-w-24' />
                      </TableCell>
                      <TableCell className='px-2 py-4 sm:px-4'>
                        <div className='flex flex-col gap-1'>
                          <Skeleton className='h-4 w-full max-w-28' />
                          <Skeleton className='h-3 w-full max-w-24' />
                        </div>
                      </TableCell>
                      <TableCell className='hidden px-4 py-4 xl:table-cell'>
                        <Skeleton className='h-4 w-full max-w-24' />
                      </TableCell>
                      <TableCell className='hidden px-4 py-4 lg:table-cell'>
                        <Skeleton className='h-4 w-full max-w-24' />
                      </TableCell>
                      <TableCell className='hidden px-4 py-4 md:table-cell'>
                        <Skeleton className='h-6 w-full max-w-20 rounded-full' />
                      </TableCell>
                      <TableCell className='px-2 py-4 sm:px-4'>
                        <Skeleton className='h-6 w-full max-w-20 rounded-full' />
                      </TableCell>
                      <TableCell className='px-2 py-4 sm:px-4'>
                        <Skeleton className='mx-auto size-7 rounded-md' />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isTableLoading && devices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Empty className='border-0 py-8'>
                        <EmptyDescription>{m.security_registered_empty()}</EmptyDescription>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
                {!isTableLoading &&
                  devices.map((device) => (
                    <TableRow
                      key={device.id}
                      className='border-t border-border/80 text-sm text-foreground transition-colors hover:bg-muted/30'
                    >
                      <TableCell className='min-w-0 px-2 py-3 sm:px-4'>
                        <div className='flex min-w-0 flex-col gap-1'>
                          <span className='truncate font-semibold' title={device.employeeName}>
                            {device.employeeName}
                          </span>
                          <span className='truncate text-xs text-muted-foreground'>
                            {device.employeeNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='min-w-0 px-2 py-3 sm:px-4'>
                        <div className='flex min-w-0 flex-col gap-1'>
                          <span className='truncate font-medium' title={device.deviceName}>
                            {device.deviceName}
                          </span>
                          <span
                            className='truncate text-xs text-muted-foreground'
                            title={`${device.deviceId} · ${device.operatingSystem}`}
                          >
                            {device.deviceId} · {device.operatingSystem}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='hidden px-4 py-3 xl:table-cell'>
                        {dayjs(device.registeredAt).format('DD MMM YYYY')}
                      </TableCell>
                      <TableCell className='hidden px-4 py-3 text-muted-foreground lg:table-cell'>
                        {dayjs(device.lastActiveAt).format('DD MMM YYYY, HH:mm')}
                      </TableCell>
                      <TableCell className='hidden px-4 py-3 md:table-cell'>
                        <Badge
                          variant={getTrustVariant(device.trustLevel)}
                          className='max-w-full truncate'
                        >
                          {getTrustLabel(device.trustLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell className='px-2 py-3 sm:px-4'>
                        <Badge
                          variant={getStatusVariant(device.status)}
                          className='max-w-full truncate'
                        >
                          {getStatusLabel(device.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className='px-2 py-3 text-center sm:px-4'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon-xs'
                          className='sm:hidden'
                          aria-label={`${m.security_registered_view_button()}: ${device.employeeName}`}
                          onClick={() => setSelectedDevice(device)}
                        >
                          <IconEye data-icon='inline-start' />
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='hidden sm:inline-flex'
                          onClick={() => setSelectedDevice(device)}
                        >
                          {m.security_registered_view_button()}
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
        open={selectedDevice !== null}
        onOpenChange={(open) => {
          if (!open && !isActionPending) setSelectedDevice(null)
        }}
      >
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{m.security_registered_detail_title()}</DialogTitle>
            <DialogDescription>{m.security_registered_detail_description()}</DialogDescription>
          </DialogHeader>

          {selectedDevice && (
            <Card size='sm'>
              <CardHeader>
                <CardTitle>{selectedDevice.employeeName}</CardTitle>
                <CardDescription>
                  {selectedDevice.deviceName} · {selectedDevice.deviceId}
                </CardDescription>
              </CardHeader>
              <CardContent className='grid gap-4 sm:grid-cols-2'>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>
                    {m.security_registered_detail_employee_number()}
                  </span>
                  <span className='font-medium'>{selectedDevice.employeeNumber}</span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>
                    {m.security_registered_detail_binding()}
                  </span>
                  <Badge variant={selectedDevice.bindingActive ? 'green' : 'gray'}>
                    {selectedDevice.bindingActive
                      ? m.security_registered_detail_binding_active()
                      : m.security_registered_detail_binding_inactive()}
                  </Badge>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>
                    {m.security_registered_detail_security_check()}
                  </span>
                  <Badge variant={selectedDevice.jailbreakDetected ? 'red' : 'green'}>
                    {selectedDevice.jailbreakDetected
                      ? m.security_registered_detail_jailbreak_detected()
                      : m.security_registered_detail_jailbreak_clear()}
                  </Badge>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>
                    {m.security_registered_table_trust()}
                  </span>
                  <Badge variant={getTrustVariant(selectedDevice.trustLevel)}>
                    {getTrustLabel(selectedDevice.trustLevel)}
                  </Badge>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>
                    {m.security_registered_detail_registration_source()}
                  </span>
                  <span className='font-medium'>{selectedDevice.registrationSource}</span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>
                    {m.security_registered_detail_approved_by()}
                  </span>
                  <span className='font-medium'>{selectedDevice.approvedBy}</span>
                </div>
                <div className='flex flex-col gap-1 sm:col-span-2'>
                  <span className='text-xs text-muted-foreground'>
                    {m.security_registered_detail_office()}
                  </span>
                  <span className='font-medium'>{selectedDevice.officeLocation}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={isActionPending}
              onClick={handleResetBinding}
            >
              {resetBindingMutation.isPending ? (
                <Spinner data-icon='inline-start' />
              ) : (
                <IconRefresh data-icon='inline-start' />
              )}
              {m.security_registered_reset_binding_button()}
            </Button>
            <Button
              type='button'
              variant='destructive'
              disabled={isActionPending || selectedDevice?.status === 'Blocked'}
              onClick={handleBlockDevice}
            >
              {blockDeviceMutation.isPending ? (
                <Spinner data-icon='inline-start' />
              ) : (
                <IconShieldX data-icon='inline-start' />
              )}
              {m.security_registered_block_button()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
