import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconChecklist,
  IconDatabaseEdit,
  IconDownload,
  IconEye,
  IconListDetails,
  IconSearch,
} from '@tabler/icons-react'
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
import { AuditEventDetailDialog } from '@/features/settings/security/components/audit-event-detail-dialog'
import {
  AuditMoreFiltersDialog,
  type AuditTrailMoreFilterValues,
} from '@/features/settings/security/components/audit-more-filters-dialog'
import { useExportAuditTrail, useGetAuditTrail } from '@/features/settings/security/hooks'
import type {
  AuditTrailDateRange,
  AuditTrailFilterParams,
  AuditTrailResult,
  AuditTrailSource,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

const EMPTY_MORE_FILTERS: AuditTrailMoreFilterValues = {
  roleId: 'All',
  branchId: 'All',
  entityType: 'All',
  result: 'All',
  source: 'All',
  device: '',
  correlationId: '',
}

interface AuditStatCardProps {
  icon: typeof IconListDetails
  label: string
  value: string
  detail: string
  variant: 'blue' | 'violet' | 'emerald' | 'red'
}

function AuditStatCard({
  icon: Icon,
  label,
  value,
  detail,
  variant,
}: Readonly<AuditStatCardProps>) {
  return (
    <Card size='sm'>
      <CardContent className='flex items-center gap-3'>
        <Badge variant={variant} className='size-11 shrink-0 rounded-xl p-0'>
          <Icon />
        </Badge>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <CardDescription className='truncate'>{label}</CardDescription>
          <CardTitle>{value}</CardTitle>
          <Badge variant={variant} className='max-w-full truncate'>
            {detail}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function getActionVariant(action: string) {
  const normalizedAction = action.toUpperCase()
  if (normalizedAction === 'DELETE' || normalizedAction === 'REJECT') return 'red'
  if (normalizedAction === 'APPROVE') return 'green'
  if (normalizedAction === 'CREATE') return 'blue'
  if (normalizedAction === 'EXPORT') return 'amber'
  return 'violet'
}

function getResultLabel(result: AuditTrailResult) {
  return result === 'Success' ? m.security_audit_result_success() : m.security_audit_result_failed()
}

function getMainFilterParams(values: {
  search: string
  dateRange: string
  module: string
  action: string
}): AuditTrailFilterParams {
  return {
    search: values.search || undefined,
    dateRange: values.dateRange as AuditTrailDateRange,
    module: values.module === 'All' ? undefined : values.module,
    action: values.action === 'All' ? undefined : values.action,
  }
}

function getMoreFilterParams(values: AuditTrailMoreFilterValues): AuditTrailFilterParams {
  return {
    roleId: values.roleId === 'All' ? undefined : values.roleId,
    branchId: values.branchId === 'All' ? undefined : values.branchId,
    entityType: values.entityType === 'All' ? undefined : values.entityType,
    result: values.result === 'All' ? undefined : (values.result as AuditTrailResult),
    source: values.source === 'All' ? undefined : (values.source as AuditTrailSource),
    device: values.device || undefined,
    correlationId: values.correlationId || undefined,
  }
}

function countActiveMoreFilters(values: AuditTrailMoreFilterValues) {
  return Object.entries(values).filter(([, value]) => value !== '' && value !== 'All').length
}

export function AuditTrailPage() {
  const [filters, setFilters] = useState<AuditTrailFilterParams>({ dateRange: 'Today' })
  const [moreFilters, setMoreFilters] = useState<AuditTrailMoreFilterValues>(EMPTY_MORE_FILTERS)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>()
  const auditQuery = useGetAuditTrail(filters)
  const exportMutation = useExportAuditTrail()
  const filterSchema = useSchema((z) => ({
    search: z.string().trim().max(100, { message: m.security_audit_search_invalid() }),
    dateRange: z.string(),
    module: z.string(),
    action: z.string(),
  }))
  const {
    register,
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: '',
      dateRange: 'Today',
      module: 'All',
      action: 'All',
    },
  })

  if (auditQuery.isPending || auditQuery.error || !auditQuery.data) {
    return (
      <AppMain
        pending={auditQuery.isPending}
        error={auditQuery.error}
        retry={() => void auditQuery.refetch()}
        notFound={!auditQuery.data}
      />
    )
  }

  const auditData = auditQuery.data
  const activeMoreFilterCount = countActiveMoreFilters(moreFilters)

  const handleFilter = (values: z.infer<typeof filterSchema>) => {
    setFilters({ ...getMainFilterParams(values), ...getMoreFilterParams(moreFilters) })
  }

  const handleApplyMoreFilters = (values: AuditTrailMoreFilterValues) => {
    setMoreFilters(values)
    setFilters({ ...getMainFilterParams(getValues()), ...getMoreFilterParams(values) })
    setMoreFiltersOpen(false)
  }

  const handleClearMoreFilters = () => {
    setMoreFilters(EMPTY_MORE_FILTERS)
    setFilters(getMainFilterParams(getValues()))
    setMoreFiltersOpen(false)
  }

  const handleExport = () => {
    exportMutation.mutate(filters, {
      onSuccess: (blob) => {
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `audit-trail-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(downloadUrl)
        snackbar.success(m.security_audit_export_success())
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/security', label: m.app_layout_nav_security() },
        { label: m.security_audit_title() },
      ]}
      backTo='/settings/security'
      title={m.security_audit_title()}
      subtitle={m.security_audit_subtitle()}
      actions={
        <Button type='button' disabled={exportMutation.isPending} onClick={handleExport}>
          {exportMutation.isPending ? (
            <Spinner data-icon='inline-start' />
          ) : (
            <IconDownload data-icon='inline-start' />
          )}
          {m.security_audit_export_button()}
        </Button>
      }
    >
      <div className='flex min-w-0 flex-col gap-4'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {auditQuery.isFetching && <Spinner />}
          {m.security_audit_last_updated({
            time: dayjs(auditData.updatedAt).format('DD MMM YYYY, HH:mm'),
          })}
        </div>

        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <AuditStatCard
            icon={IconListDetails}
            label={m.security_audit_stat_events()}
            value={auditData.stats.eventsToday.toLocaleString()}
            detail={m.security_audit_stat_events_detail()}
            variant='blue'
          />
          <AuditStatCard
            icon={IconDatabaseEdit}
            label={m.security_audit_stat_changes()}
            value={auditData.stats.dataChanges.toLocaleString()}
            detail={m.security_audit_stat_changes_detail()}
            variant='violet'
          />
          <AuditStatCard
            icon={IconChecklist}
            label={m.security_audit_stat_approvals()}
            value={auditData.stats.approvals.toLocaleString()}
            detail={m.security_audit_stat_approvals_detail()}
            variant='emerald'
          />
          <AuditStatCard
            icon={IconAlertCircle}
            label={m.security_audit_stat_failed()}
            value={auditData.stats.failedActions.toLocaleString()}
            detail={m.security_audit_stat_failed_detail()}
            variant='red'
          />
        </div>

        <Card className='min-w-0 overflow-hidden'>
          <CardHeader>
            <CardTitle>{m.security_audit_directory_title()}</CardTitle>
            <CardDescription>{m.security_audit_directory_description()}</CardDescription>
          </CardHeader>
          <CardContent className='flex min-w-0 flex-col gap-5'>
            <form onSubmit={handleSubmit(handleFilter)} noValidate>
              <FieldGroup className='grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,2fr)_minmax(9rem,1fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_auto_auto]'>
                <Field data-invalid={!!errors.search}>
                  <FieldLabel htmlFor='audit-search'>{m.security_audit_search_label()}</FieldLabel>
                  <div className='relative'>
                    <IconSearch
                      size={16}
                      className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                    />
                    <Input
                      id='audit-search'
                      className='pl-9'
                      placeholder={m.security_audit_search_placeholder()}
                      aria-invalid={!!errors.search}
                      {...register('search')}
                    />
                  </div>
                  <FieldError errors={errors.search ? [errors.search] : undefined} />
                </Field>
                <Controller
                  name='dateRange'
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor='audit-date-range'>
                        {m.security_audit_date_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id='audit-date-range' className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='Today'>{m.security_audit_date_today()}</SelectItem>
                            <SelectItem value='Last7Days'>
                              {m.security_audit_date_last_7_days()}
                            </SelectItem>
                            <SelectItem value='Last30Days'>
                              {m.security_audit_date_last_30_days()}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  name='module'
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor='audit-module'>
                        {m.security_audit_module_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id='audit-module' className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='All'>{m.security_audit_all_modules()}</SelectItem>
                            {auditData.filterOptions.modules.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  name='action'
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor='audit-action'>
                        {m.security_audit_action_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id='audit-action' className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='All'>{m.security_audit_all_actions()}</SelectItem>
                            {auditData.filterOptions.actions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Field className='self-end'>
                  <FieldLabel className='sr-only'>{m.security_audit_filter_button()}</FieldLabel>
                  <Button type='submit' className='w-full xl:w-auto'>
                    {m.security_audit_filter_button()}
                  </Button>
                </Field>
                <Field className='self-end'>
                  <FieldLabel className='sr-only'>
                    {m.security_audit_more_filters_button()}
                  </FieldLabel>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full xl:w-auto'
                    onClick={() => setMoreFiltersOpen(true)}
                  >
                    <IconAdjustmentsHorizontal data-icon='inline-start' />
                    {m.security_audit_more_filters_button()}
                    {activeMoreFilterCount > 0 && (
                      <Badge variant='blue'>{activeMoreFilterCount}</Badge>
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            {activeMoreFilterCount > 0 && (
              <Badge variant='blue' className='w-fit'>
                {m.security_audit_more_filters_active({ count: activeMoreFilterCount })}
              </Badge>
            )}

            <div className='min-w-0 overflow-hidden rounded-xl border'>
              <Table className='table-fixed'>
                <TableHeader>
                  <TableRow>
                    <TableHead className='hidden w-[12%] px-4 lg:table-cell'>
                      {m.security_audit_table_time()}
                    </TableHead>
                    <TableHead className='w-[30%] px-3 md:w-[23%] lg:w-[18%] lg:px-4'>
                      {m.security_audit_table_actor()}
                    </TableHead>
                    <TableHead className='hidden px-4 md:table-cell md:w-[15%] lg:w-[12%]'>
                      {m.security_audit_table_module()}
                    </TableHead>
                    <TableHead className='w-[32%] px-3 md:w-[26%] lg:w-[22%] lg:px-4'>
                      {m.security_audit_table_activity()}
                    </TableHead>
                    <TableHead className='w-[22%] px-3 md:w-[20%] lg:w-[12%] lg:px-4'>
                      {m.security_audit_table_result()}
                    </TableHead>
                    <TableHead className='hidden w-[14%] px-4 lg:table-cell'>
                      {m.security_audit_table_source()}
                    </TableHead>
                    <TableHead className='w-[16%] px-2 text-center md:w-[16%] lg:w-[10%] lg:px-4'>
                      {m.security_audit_table_detail()}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditQuery.isFetching
                    ? Array.from({ length: 6 }, (_, index) => (
                        <TableRow key={`audit-skeleton-${index}`}>
                          <TableCell className='hidden px-4 py-3 lg:table-cell'>
                            <Skeleton className='h-4 w-14' />
                          </TableCell>
                          <TableCell className='px-3 py-3 lg:px-4'>
                            <Skeleton className='h-4 w-full' />
                          </TableCell>
                          <TableCell className='hidden px-4 py-3 md:table-cell'>
                            <Skeleton className='h-4 w-full' />
                          </TableCell>
                          <TableCell className='px-3 py-3 lg:px-4'>
                            <Skeleton className='h-8 w-full' />
                          </TableCell>
                          <TableCell className='px-3 py-3 lg:px-4'>
                            <Skeleton className='h-5 w-full' />
                          </TableCell>
                          <TableCell className='hidden px-4 py-3 lg:table-cell'>
                            <Skeleton className='h-8 w-full' />
                          </TableCell>
                          <TableCell className='px-2 py-3 lg:px-4'>
                            <Skeleton className='mx-auto size-7 rounded-md sm:h-8 sm:w-full' />
                          </TableCell>
                        </TableRow>
                      ))
                    : auditData.events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell
                            className='hidden px-4 py-3 text-muted-foreground lg:table-cell'
                            title={dayjs(event.occurredAt).format('DD MMM YYYY, HH:mm:ss')}
                          >
                            {dayjs(event.occurredAt).format('HH:mm')}
                          </TableCell>
                          <TableCell className='min-w-0 px-3 py-3 lg:px-4'>
                            <div className='flex min-w-0 flex-col gap-1'>
                              <span className='truncate font-medium' title={event.actorName}>
                                {event.actorName}
                              </span>
                              <span className='truncate text-xs text-muted-foreground'>
                                {event.actorRole}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='hidden min-w-0 px-4 py-3 md:table-cell'>
                            <span className='block truncate' title={event.module}>
                              {event.module}
                            </span>
                          </TableCell>
                          <TableCell className='min-w-0 px-3 py-3 lg:px-4'>
                            <div className='flex min-w-0 flex-col items-start gap-1'>
                              <Badge variant={getActionVariant(event.action)}>{event.action}</Badge>
                              <span
                                className='block max-w-full truncate text-xs text-muted-foreground'
                                title={`${event.entityName} · ${event.recordId}`}
                              >
                                {event.entityName} · {event.recordId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='px-3 py-3 lg:px-4'>
                            <Badge variant={event.result === 'Success' ? 'green' : 'red'}>
                              {getResultLabel(event.result)}
                            </Badge>
                          </TableCell>
                          <TableCell className='hidden min-w-0 px-4 py-3 lg:table-cell'>
                            <div className='flex min-w-0 flex-col gap-1'>
                              <span className='truncate font-medium'>{event.source}</span>
                              <span className='truncate text-xs text-muted-foreground'>
                                {event.ipAddress}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='px-2 py-3 text-center lg:px-4'>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon-xs'
                              className='sm:hidden'
                              aria-label={m.security_audit_detail_button_label({ id: event.id })}
                              onClick={() => setSelectedEventId(event.id)}
                            >
                              <IconEye data-icon='inline-start' />
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='xs'
                              className='hidden sm:inline-flex'
                              onClick={() => setSelectedEventId(event.id)}
                            >
                              {m.security_audit_detail_button()}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  {!auditQuery.isFetching && auditData.events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className='whitespace-normal'>
                        <Empty className='border-0 py-10'>
                          <EmptyHeader>
                            <EmptyTitle>{m.security_audit_empty()}</EmptyTitle>
                          </EmptyHeader>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <CardDescription>{m.security_audit_filter_summary()}</CardDescription>
          </CardFooter>
        </Card>
      </div>

      {moreFiltersOpen && (
        <AuditMoreFiltersDialog
          values={moreFilters}
          options={auditData.filterOptions}
          onApply={handleApplyMoreFilters}
          onClear={handleClearMoreFilters}
          onOpenChange={setMoreFiltersOpen}
        />
      )}
      {selectedEventId && (
        <AuditEventDetailDialog
          eventId={selectedEventId}
          onOpenChange={(open) => {
            if (!open) setSelectedEventId(undefined)
          }}
        />
      )}
    </AppMain>
  )
}
