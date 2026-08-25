import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconArchive,
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCalendarEvent,
  IconCheck,
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconFileAnalytics,
  IconFileUpload,
  IconFilter,
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconStatusChange,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Cell, Pie, PieChart } from 'recharts'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Empty, EmptyDescription } from '@/shared/components/ui/empty'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination'
import {
  Select,
  SelectContent,
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
  useArchiveEmployeeInformation,
  useDownloadEmployeeProfile,
  useExportEmployeeInformation,
  useGetEmployeeInformation,
  useGetEmployeeInformationOverview,
  useImportEmployeeInformation,
  useUpdateEmployeeInformationStatus,
} from '@/features/company/employee-information/hooks'
import type {
  DepartmentDistributionItem,
  EmployeeInformationEmploymentType,
  EmployeeInformationFilterParams,
  EmployeeInformationItem,
  EmployeeInformationStats,
  EmployeeInformationStatus,
} from '@/features/company/employee-information/types'
import { m } from '@/i18n/paraglide/messages'

const ALL = 'All' as const

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
}

function getStatusLabel(status: EmployeeInformationStatus) {
  return {
    Active: m.employee_information_status_active(),
    OnLeave: m.employee_information_status_on_leave(),
    Probation: m.employee_information_status_probation(),
    Resigned: m.employee_information_status_resigned(),
    Inactive: m.employee_information_status_inactive(),
  }[status]
}

function getStatusVariant(status: EmployeeInformationStatus) {
  return {
    Active: 'green',
    OnLeave: 'blue',
    Probation: 'amber',
    Resigned: 'slate',
    Inactive: 'red',
  }[status] as 'green' | 'blue' | 'amber' | 'slate' | 'red'
}

function getEmploymentTypeLabel(type: EmployeeInformationEmploymentType) {
  return {
    Permanent: m.employee_information_type_permanent(),
    Contract: m.employee_information_type_contract(),
    Internship: m.employee_information_type_internship(),
    Freelance: m.employee_information_type_freelance(),
  }[type]
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  change: number
  icon: typeof IconUsers
  tone: string
}) {
  const increased = change >= 0
  const ChangeIcon = increased ? IconArrowUp : IconArrowDown
  return (
    <Card size='sm'>
      <CardContent className='flex items-center gap-3'>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className='size-5' />
        </div>
        <div className='min-w-0'>
          <p className='truncate text-xs text-muted-foreground'>{label}</p>
          <p className='mt-0.5 text-2xl font-semibold tracking-tight'>{value.toLocaleString()}</p>
          <p
            className={
              increased
                ? 'flex items-center text-[11px] text-emerald-600'
                : 'flex items-center text-[11px] text-red-600'
            }
          >
            <ChangeIcon className='me-0.5 size-3' />
            {m.employee_information_change({ value: Math.abs(change).toFixed(1) })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatsGrid({ stats }: { stats: EmployeeInformationStats }) {
  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      <StatCard
        label={m.employee_information_stats_total()}
        value={stats.totalEmployees}
        change={stats.totalChangePercent}
        icon={IconUsers}
        tone='bg-blue-500/10 text-blue-600'
      />
      <StatCard
        label={m.employee_information_stats_active()}
        value={stats.activeEmployees}
        change={stats.activeChangePercent}
        icon={IconUserCheck}
        tone='bg-emerald-500/10 text-emerald-600'
      />
      <StatCard
        label={m.employee_information_stats_on_leave()}
        value={stats.onLeaveEmployees}
        change={stats.onLeaveChangePercent}
        icon={IconCalendarEvent}
        tone='bg-amber-500/10 text-amber-600'
      />
      <StatCard
        label={m.employee_information_stats_resigned()}
        value={stats.resignedThisMonth}
        change={stats.resignedChangePercent}
        icon={IconArchive}
        tone='bg-rose-500/10 text-rose-600'
      />
    </div>
  )
}

function DepartmentDistribution({
  data,
  total,
}: {
  data: DepartmentDistributionItem[]
  total: number
}) {
  const config = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        data.map((item) => [item.departmentId, { label: item.departmentName, color: item.color }]),
      ),
    [data],
  )
  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle>{m.employee_information_distribution_title()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='relative mx-auto size-36'>
          <ChartContainer config={config} className='aspect-square size-36'>
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey='departmentName' />} />
              <Pie
                data={data}
                dataKey='employeeCount'
                nameKey='departmentName'
                innerRadius={43}
                outerRadius={62}
                paddingAngle={2}
              >
                {data.map((item) => (
                  <Cell key={item.departmentId} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-lg font-semibold'>{total.toLocaleString()}</span>
            <span className='text-[10px] text-muted-foreground'>
              {m.employee_information_distribution_total()}
            </span>
          </div>
        </div>
        <div className='mt-3 space-y-2'>
          {data.map((item) => (
            <div
              key={item.departmentId}
              className='grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs'
            >
              <span className='size-2 rounded-full' style={{ backgroundColor: item.color }} />
              <span className='truncate'>{item.departmentName}</span>
              <span className='text-muted-foreground'>
                {item.employeeCount.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions({ onImport, onExport }: { onImport: () => void; onExport: () => void }) {
  const actions = [
    {
      label: m.employee_information_quick_add(),
      description: m.employee_information_quick_add_description(),
      icon: IconPlus,
      action: 'add',
    },
    {
      label: m.employee_information_quick_import(),
      description: m.employee_information_quick_import_description(),
      icon: IconFileUpload,
      action: 'import',
    },
    {
      label: m.employee_information_quick_report(),
      description: m.employee_information_quick_report_description(),
      icon: IconFileAnalytics,
      action: 'export',
    },
  ] as const
  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle>{m.employee_information_quick_title()}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-1'>
        {actions.map(({ label, description, icon: Icon, action }) => {
          const content = (
            <>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <Icon className='size-4' />
              </span>
              <span className='min-w-0 flex-1 text-start'>
                <span className='block text-xs font-medium'>{label}</span>
                <span className='block truncate text-[10px] text-muted-foreground'>
                  {description}
                </span>
              </span>
              <IconArrowRight className='size-4 text-muted-foreground' />
            </>
          )
          if (action === 'add')
            return (
              <Button
                key={action}
                variant='ghost'
                className='h-auto w-full justify-start px-2 py-2'
                asChild
              >
                <Link to='/company/employee/new'>{content}</Link>
              </Button>
            )
          return (
            <Button
              key={action}
              variant='ghost'
              className='h-auto w-full justify-start px-2 py-2'
              onClick={action === 'import' ? onImport : onExport}
            >
              {content}
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return Array.from({ length: 8 }, (_, index) => (
    <TableRow key={`employee-information-skeleton-${index}`}>
      <TableCell className='px-2 py-3 sm:px-3'>
        <Skeleton className='size-4' />
      </TableCell>
      <TableCell className='px-3 py-3'>
        <Skeleton className='h-4 max-w-full sm:w-20 lg:w-24' />
      </TableCell>
      <TableCell className='min-w-0 px-2 py-3 sm:px-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <Skeleton className='size-8 shrink-0 rounded-full' />
          <div className='min-w-0 flex-1 space-y-1'>
            <Skeleton className='h-4 w-2/3 max-w-full' />
            <Skeleton className='h-3 w-full max-w-full' />
          </div>
        </div>
      </TableCell>
      <TableCell className='px-3 py-3'>
        <Skeleton className='h-4 w-24' />
      </TableCell>
      <TableCell className='px-3 py-3'>
        <Skeleton className='h-4 w-24' />
      </TableCell>
      <TableCell className='px-2 py-3 sm:px-3'>
        <Skeleton className='h-5 w-full max-w-16 rounded-full' />
      </TableCell>
      <TableCell className='px-3 py-3'>
        <Skeleton className='h-4 w-20' />
      </TableCell>
      <TableCell className='px-3 py-3'>
        <Skeleton className='h-4 w-20' />
      </TableCell>
      <TableCell className='sticky right-0 bg-card px-3 py-3'>
        <Skeleton className='ms-auto size-8 rounded-md' />
      </TableCell>
    </TableRow>
  ))
}

function RowActions({
  employee,
  onStatus,
  onArchive,
  onPrint,
}: {
  employee: EmployeeInformationItem
  onStatus: (employee: EmployeeInformationItem) => void
  onArchive: (employee: EmployeeInformationItem) => void
  onPrint: (employee: EmployeeInformationItem) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label={m.employee_information_action_open({ name: employee.fullName })}
        >
          <IconDotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem asChild>
          <Link to='/company/employee/$id' params={{ id: employee.id }}>
            <IconEye />
            {m.employee_information_action_view()}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to='/company/employee/update' search={{ id: employee.id }}>
            <IconPencil />
            {m.employee_information_action_edit()}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onStatus(employee)}>
          <IconStatusChange />
          {m.employee_information_action_status()}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onPrint(employee)}>
          <IconPrinter />
          {m.employee_information_action_print()}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onSelect={() => onArchive(employee)}>
          <IconArchive />
          {m.employee_information_action_archive()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EmployeeTable({
  items,
  loading,
  error,
  onRetry,
  selectedIds,
  onSelectAll,
  onSelect,
  onStatus,
  onArchive,
  onPrint,
}: {
  items: EmployeeInformationItem[]
  loading: boolean
  error: Error | null
  onRetry: () => void
  selectedIds: Set<string>
  onSelectAll: (checked: boolean) => void
  onSelect: (id: string, checked: boolean) => void
  onStatus: (employee: EmployeeInformationItem) => void
  onArchive: (employee: EmployeeInformationItem) => void
  onPrint: (employee: EmployeeInformationItem) => void
}) {
  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id))
  const partiallySelected = items.some((item) => selectedIds.has(item.id)) && !allSelected
  return (
    <div className='min-h-0 min-w-0 flex-1 overflow-auto rounded-lg border [&>[data-slot=table-container]]:overflow-visible'>
      <Table className='min-w-[82rem] table-fixed' aria-busy={loading}>
        <TableHeader className='sticky top-0 z-10 bg-muted'>
          <TableRow>
            <TableHead className='w-[4%] px-3'>
              <Checkbox
                checked={partiallySelected ? 'indeterminate' : allSelected}
                onCheckedChange={(value) => onSelectAll(value === true)}
                aria-label={m.employee_information_select_all()}
              />
            </TableHead>
            <TableHead className='w-[11%] px-3'>{m.employee_information_table_number()}</TableHead>
            <TableHead className='w-[19%] px-3'>
              {m.employee_information_table_employee()}
            </TableHead>
            <TableHead className='w-[12%] px-3'>
              {m.employee_information_table_department()}
            </TableHead>
            <TableHead className='w-[14%] px-3'>
              {m.employee_information_table_position()}
            </TableHead>
            <TableHead className='w-[9%] px-3'>{m.employee_information_table_status()}</TableHead>
            <TableHead className='w-[12%] px-3'>{m.employee_information_table_type()}</TableHead>
            <TableHead className='w-[12%] px-3'>
              {m.employee_information_table_join_date()}
            </TableHead>
            <TableHead className='sticky right-0 z-20 w-[7%] bg-muted px-3 text-end'>
              {m.employee_information_table_action()}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && <TableSkeleton />}
          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={9}>
                <Empty className='border-0 py-10'>
                  <EmptyDescription>
                    {error ? m.employee_information_list_error() : m.employee_information_empty()}
                  </EmptyDescription>
                  {error && (
                    <Button variant='outline' size='sm' onClick={onRetry}>
                      <IconRefresh data-icon='inline-start' />
                      {m.employee_information_retry()}
                    </Button>
                  )}
                </Empty>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            items.map((employee) => (
              <TableRow key={employee.id} className='group/row'>
                <TableCell className='px-2 py-3 sm:px-3'>
                  <Checkbox
                    checked={selectedIds.has(employee.id)}
                    onCheckedChange={(value) => onSelect(employee.id, value === true)}
                    aria-label={m.employee_information_select_employee({ name: employee.fullName })}
                  />
                </TableCell>
                <TableCell
                  className='truncate px-3 py-3 text-xs text-muted-foreground'
                  title={employee.employeeNumber}
                >
                  {employee.employeeNumber}
                </TableCell>
                <TableCell className='min-w-0 px-2 py-3 sm:px-3'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <Avatar className='size-8 shrink-0'>
                      <AvatarImage src={employee.avatarUrl ?? undefined} alt={employee.fullName} />
                      <AvatarFallback className='bg-primary/10 text-[10px] text-primary'>
                        {getInitials(employee.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <p className='truncate text-xs font-semibold sm:text-sm'>
                        {employee.fullName}
                      </p>
                      <p className='truncate text-[10px] text-muted-foreground sm:text-xs'>
                        {employee.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className='truncate px-3 py-3 text-xs text-muted-foreground'
                  title={employee.departmentName}
                >
                  {employee.departmentName}
                </TableCell>
                <TableCell
                  className='truncate px-3 py-3 text-xs text-muted-foreground'
                  title={employee.positionName}
                >
                  {employee.positionName}
                </TableCell>
                <TableCell className='px-2 py-3 sm:px-3'>
                  <Badge variant={getStatusVariant(employee.status)}>
                    {getStatusLabel(employee.status)}
                  </Badge>
                </TableCell>
                <TableCell className='truncate px-3 py-3 text-xs whitespace-nowrap text-muted-foreground'>
                  {getEmploymentTypeLabel(employee.employmentType)}
                </TableCell>
                <TableCell className='px-3 py-3 text-xs whitespace-nowrap text-muted-foreground'>
                  {dayjs(employee.joinDate).format('DD MMM YYYY')}
                </TableCell>
                <TableCell className='sticky right-0 bg-card px-3 py-3 text-end group-hover/row:bg-muted'>
                  <RowActions
                    employee={employee}
                    onStatus={onStatus}
                    onArchive={onArchive}
                    onPrint={onPrint}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function EmployeeInformationPage() {
  const navigate = useNavigate()
  const sidebarRef = useRef<HTMLElement>(null)
  const [sidebarHeight, setSidebarHeight] = useState<number>()
  const [filters, setFilters] = useState<EmployeeInformationFilterParams>({ page: 1, limit: 10 })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [importOpen, setImportOpen] = useState(false)
  const [statusEmployee, setStatusEmployee] = useState<EmployeeInformationItem | null>(null)
  const [archiveEmployee, setArchiveEmployee] = useState<EmployeeInformationItem | null>(null)
  const overviewQuery = useGetEmployeeInformationOverview()
  const listQuery = useGetEmployeeInformation(filters)
  const importMutation = useImportEmployeeInformation()
  const exportMutation = useExportEmployeeInformation()
  const statusMutation = useUpdateEmployeeInformationStatus()
  const printMutation = useDownloadEmployeeProfile()
  const archiveMutation = useArchiveEmployeeInformation()
  const filterSchema = useSchema((z) => ({
    search: z.string().trim().max(100, { message: m.employee_information_search_invalid() }),
    departmentId: z.string(),
    status: z.enum([ALL, 'Active', 'OnLeave', 'Probation', 'Resigned', 'Inactive']),
    employmentType: z.enum([ALL, 'Permanent', 'Contract', 'Internship', 'Freelance']),
  }))
  const importSchema = useSchema((z) => ({
    file: z.custom<File>((value) => value instanceof File, {
      message: m.employee_information_import_required(),
    }),
  }))
  const statusSchema = useSchema((z) => ({
    status: z.enum(['Active', 'OnLeave', 'Probation', 'Resigned', 'Inactive']),
  }))
  const filterForm = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: '', departmentId: ALL, status: ALL, employmentType: ALL },
  })
  const importForm = useForm<z.infer<typeof importSchema>>({ resolver: zodResolver(importSchema) })
  const statusForm = useForm<z.infer<typeof statusSchema>>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: 'Active' },
  })

  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return

    const observer = new ResizeObserver(([entry]) => {
      setSidebarHeight(Math.ceil(entry.contentRect.height))
    })

    observer.observe(sidebar)
    return () => observer.disconnect()
  }, [])

  if (overviewQuery.isPending || overviewQuery.error || !overviewQuery.data) {
    return (
      <AppMain
        pending={overviewQuery.isPending}
        error={overviewQuery.error}
        retry={() => void overviewQuery.refetch()}
        notFound={!overviewQuery.data}
      />
    )
  }

  const overview = overviewQuery.data
  const result = listQuery.data
  const employees = result?.items ?? []
  const pagination = result?.pagination

  const handleFilter = (values: z.infer<typeof filterSchema>) => {
    setSelectedIds(new Set())
    setFilters({
      search: values.search || undefined,
      departmentId: values.departmentId === ALL ? undefined : values.departmentId,
      status: values.status === ALL ? undefined : values.status,
      employmentType: values.employmentType === ALL ? undefined : values.employmentType,
      page: 1,
      limit: filters.limit,
    })
  }
  const handleReset = () => {
    filterForm.reset({ search: '', departmentId: ALL, status: ALL, employmentType: ALL })
    setSelectedIds(new Set())
    setFilters({ page: 1, limit: filters.limit })
  }
  const exportData = (params: EmployeeInformationFilterParams) =>
    exportMutation.mutate(params, {
      onSuccess: (blob) => {
        saveBlob(blob, `employee-information-${dayjs().format('YYYY-MM-DD')}.xlsx`)
        snackbar.success(m.employee_information_export_success())
      },
      onError: (error) => snackbar.exception(error),
    })
  const handleExport = () => exportData(filters)
  const handleExportSelected = () =>
    exportData({ ...filters, employeeIds: Array.from(selectedIds) })
  const handleImport = importForm.handleSubmit(({ file }) =>
    importMutation.mutate(file, {
      onSuccess: (response) => {
        snackbar.success(m.employee_information_import_success({ count: response.data.imported }))
        setImportOpen(false)
        importForm.reset()
      },
      onError: (error) => snackbar.exception(error),
    }),
  )
  const handleStatus = statusForm.handleSubmit(({ status }) => {
    if (!statusEmployee) return
    statusMutation.mutate(
      { id: statusEmployee.id, payload: { status } },
      {
        onSuccess: () => {
          snackbar.success(m.employee_information_status_success())
          setStatusEmployee(null)
        },
        onError: (error) => snackbar.exception(error),
      },
    )
  })
  const handlePrint = (employee: EmployeeInformationItem) =>
    printMutation.mutate(employee.id, {
      onSuccess: (blob) => {
        saveBlob(blob, `${employee.employeeNumber}-${employee.fullName}.pdf`)
        snackbar.success(m.employee_information_print_success())
      },
      onError: (error) => snackbar.exception(error),
    })
  const handleArchive = () => {
    if (!archiveEmployee) return
    archiveMutation.mutate(archiveEmployee.id, {
      onSuccess: () => {
        snackbar.success(m.employee_information_archive_success())
        setArchiveEmployee(null)
        setSelectedIds((current) => {
          const next = new Set(current)
          next.delete(archiveEmployee.id)
          return next
        })
      },
      onError: (error) => snackbar.exception(error),
    })
  }
  const setPage = (page: number) => {
    setSelectedIds(new Set())
    setFilters((current) => ({ ...current, page }))
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_company() },
        { to: '.', label: m.employee_information_title() },
      ]}
      title={m.employee_information_title()}
      subtitle={m.employee_information_subtitle()}
      actions={
        <div className='flex flex-wrap justify-end gap-2'>
          <Button variant='outline' size='sm' onClick={() => setImportOpen(true)}>
            <IconFileUpload data-icon='inline-start' />
            {m.employee_information_import()}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? <Spinner /> : <IconDownload data-icon='inline-start' />}
            {m.employee_information_export()}
          </Button>
          <Button size='sm' asChild>
            <Link to='/company/employee/new'>
              <IconPlus data-icon='inline-start' />
              {m.employee_information_add()}
            </Link>
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        <StatsGrid stats={overview.stats} />
        <div className='grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]'>
          <Card
            className='min-w-0 self-start overflow-hidden xl:max-h-[var(--employee-directory-max-height)]'
            style={
              sidebarHeight
                ? ({ '--employee-directory-max-height': `${sidebarHeight}px` } as CSSProperties)
                : undefined
            }
          >
            <CardHeader className='shrink-0 border-b'>
              <form
                onSubmit={filterForm.handleSubmit(handleFilter)}
                className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-[minmax(12rem,1.4fr)_1fr_1fr_1fr_auto_auto] 2xl:items-end'
              >
                <Field data-invalid={Boolean(filterForm.formState.errors.search)}>
                  <FieldLabel htmlFor='employee-information-search'>
                    {m.employee_information_search_label()}
                  </FieldLabel>
                  <div className='relative'>
                    <IconUsers className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      id='employee-information-search'
                      className='pl-9'
                      placeholder={m.employee_information_search_placeholder()}
                      {...filterForm.register('search')}
                    />
                  </div>
                  <FieldError errors={[filterForm.formState.errors.search]} />
                </Field>
                <Field>
                  <FieldLabel>{m.employee_information_department_label()}</FieldLabel>
                  <Controller
                    control={filterForm.control}
                    name='departmentId'
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL}>
                            {m.employee_information_all_departments()}
                          </SelectItem>
                          {overview.filterOptions.departments.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel>{m.employee_information_status_label()}</FieldLabel>
                  <Controller
                    control={filterForm.control}
                    name='status'
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL}>
                            {m.employee_information_all_statuses()}
                          </SelectItem>
                          {overview.filterOptions.statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {getStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel>{m.employee_information_type_label()}</FieldLabel>
                  <Controller
                    control={filterForm.control}
                    name='employmentType'
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL}>{m.employee_information_all_types()}</SelectItem>
                          {overview.filterOptions.employmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {getEmploymentTypeLabel(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Button type='submit' size='sm'>
                  <IconFilter data-icon='inline-start' />
                  {m.employee_information_filter()}
                </Button>
                <Button type='button' variant='ghost' size='sm' onClick={handleReset}>
                  <IconRefresh data-icon='inline-start' />
                  {m.employee_information_reset()}
                </Button>
              </form>
            </CardHeader>
            <CardContent className='flex min-h-0 min-w-0 flex-1 flex-col'>
              {selectedIds.size > 0 && (
                <div className='mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary/5 px-3 py-2'>
                  <span className='text-xs font-medium text-primary'>
                    {m.employee_information_selected({ count: selectedIds.size })}
                  </span>
                  <div className='flex items-center gap-2'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size='sm' variant='outline'>
                          {m.employee_information_bulk_actions()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onSelect={handleExportSelected}>
                          <IconDownload />
                          {m.employee_information_export_selected()}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size='sm' variant='ghost' onClick={() => setSelectedIds(new Set())}>
                      {m.employee_information_clear_selection()}
                    </Button>
                  </div>
                </div>
              )}
              <EmployeeTable
                items={employees}
                loading={listQuery.isFetching}
                error={listQuery.error}
                onRetry={() => void listQuery.refetch()}
                selectedIds={selectedIds}
                onSelectAll={(checked) =>
                  setSelectedIds(checked ? new Set(employees.map((item) => item.id)) : new Set())
                }
                onSelect={(id, checked) =>
                  setSelectedIds((current) => {
                    const next = new Set(current)
                    if (checked) next.add(id)
                    else next.delete(id)
                    return next
                  })
                }
                onStatus={(employee) => {
                  statusForm.setValue('status', employee.status)
                  setStatusEmployee(employee)
                }}
                onArchive={setArchiveEmployee}
                onPrint={handlePrint}
              />
            </CardContent>
            {pagination && (
              <CardFooter className='shrink-0 flex-col justify-between gap-3 border-t sm:flex-row'>
                <p className='text-xs text-muted-foreground'>
                  {m.employee_information_pagination_summary({
                    from:
                      pagination.totalItems === 0
                        ? 0
                        : (pagination.page - 1) * pagination.limit + 1,
                    to: Math.min(pagination.page * pagination.limit, pagination.totalItems),
                    total: pagination.totalItems,
                  })}
                </p>
                <div className='flex items-center gap-2'>
                  <Select
                    value={String(pagination.limit)}
                    onValueChange={(value) => {
                      setSelectedIds(new Set())
                      setFilters((current) => ({ ...current, page: 1, limit: Number(value) }))
                    }}
                  >
                    <SelectTrigger className='w-24' aria-label={m.employee_information_page_size()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50].map((limit) => (
                        <SelectItem key={limit} value={String(limit)}>
                          {m.employee_information_per_page({ count: limit })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Pagination className='w-auto'>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href='#'
                          text={m.employee_information_previous()}
                          aria-disabled={pagination.page <= 1}
                          className={
                            pagination.page <= 1 ? 'pointer-events-none opacity-50' : undefined
                          }
                          onClick={(event) => {
                            event.preventDefault()
                            if (pagination.page > 1) setPage(pagination.page - 1)
                          }}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href='#'
                          isActive
                          onClick={(event) => event.preventDefault()}
                        >
                          {pagination.page}
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href='#'
                          text={m.employee_information_next()}
                          aria-disabled={pagination.page >= pagination.totalPages}
                          className={
                            pagination.page >= pagination.totalPages
                              ? 'pointer-events-none opacity-50'
                              : undefined
                          }
                          onClick={(event) => {
                            event.preventDefault()
                            if (pagination.page < pagination.totalPages)
                              setPage(pagination.page + 1)
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardFooter>
            )}
          </Card>
          <aside ref={sidebarRef} className='space-y-4'>
            <DepartmentDistribution
              data={overview.departmentDistribution}
              total={overview.stats.totalEmployees}
            />
            <QuickActions onImport={() => setImportOpen(true)} onExport={handleExport} />
            <Card size='sm'>
              <CardHeader>
                <div className='flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600'>
                  <IconInfoCircle className='size-5' />
                </div>
                <CardTitle>{m.employee_information_tip_title()}</CardTitle>
                <CardDescription>{m.employee_information_tip_description()}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant='link'
                  className='h-auto px-0'
                  onClick={() => void navigate({ to: '/company/employee/new' })}
                >
                  {m.employee_information_tip_action()}
                  <IconArrowRight data-icon='inline-end' />
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.employee_information_import_title()}</DialogTitle>
            <DialogDescription>{m.employee_information_import_description()}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImport}>
            <FieldGroup>
              <Field data-invalid={Boolean(importForm.formState.errors.file)}>
                <FieldLabel htmlFor='employee-information-file'>
                  {m.employee_information_import_file()}
                </FieldLabel>
                <Input
                  id='employee-information-file'
                  type='file'
                  accept='.csv,.xlsx'
                  onChange={(event) =>
                    importForm.setValue('file', event.target.files?.[0] as File, {
                      shouldValidate: true,
                    })
                  }
                />
                <FieldError errors={[importForm.formState.errors.file]} />
              </Field>
            </FieldGroup>
            <DialogFooter className='mt-6'>
              <Button type='button' variant='outline' onClick={() => setImportOpen(false)}>
                {m.employee_information_cancel()}
              </Button>
              <Button type='submit' disabled={importMutation.isPending}>
                {importMutation.isPending ? (
                  <Spinner />
                ) : (
                  <IconFileUpload data-icon='inline-start' />
                )}
                {m.employee_information_import_submit()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(statusEmployee)}
        onOpenChange={(open) => !open && setStatusEmployee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.employee_information_status_title()}</DialogTitle>
            <DialogDescription>
              {m.employee_information_status_description({ name: statusEmployee?.fullName ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStatus}>
            <Field>
              <FieldLabel>{m.employee_information_status_label()}</FieldLabel>
              <Controller
                control={statusForm.control}
                name='status'
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {overview.filterOptions.statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <DialogFooter className='mt-6'>
              <Button type='button' variant='outline' onClick={() => setStatusEmployee(null)}>
                {m.employee_information_cancel()}
              </Button>
              <Button type='submit' disabled={statusMutation.isPending}>
                {statusMutation.isPending ? <Spinner /> : <IconCheck data-icon='inline-start' />}
                {m.employee_information_status_submit()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(archiveEmployee)}
        onOpenChange={(open) => !open && setArchiveEmployee(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.employee_information_archive_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.employee_information_archive_description({
                name: archiveEmployee?.fullName ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.employee_information_cancel()}</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending ? <Spinner /> : <IconArchive data-icon='inline-start' />}
              {m.employee_information_archive_confirm()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppMain>
  )
}
