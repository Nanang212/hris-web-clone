import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCoins,
  IconEdit,
  IconMinus,
  IconPlus,
  IconStack2,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'

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
  SelectGroup,
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
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { m } from '@/i18n/paraglide/messages'

import { formatIDR } from '../../data/mock-payroll-data'
import { initialPayrollEmployeeInputs } from '../../data/mock-payroll-inputs'
import {
  employeeComponentKinds,
  employeeComponentToInputLine,
  getEmployeeComponentKind,
  isAutomaticPayrollComponent,
  isEmployeeComponentInPeriod,
  usePayrollComponentStore,
} from '../../store/payroll-component-store'
import type { EmployeePayrollComponent, PayrollComponentKind } from '../../types'
import { EmployeeComponentImportPanel } from './employee-component-import-panel'

const componentTypes = ['allowance', 'deduction'] as const

const periodMonths = [
  m.payroll_month_january,
  m.payroll_month_february,
  m.payroll_month_march,
  m.payroll_month_april,
  m.payroll_month_may,
  m.payroll_month_june,
  m.payroll_month_july,
  m.payroll_month_august,
  m.payroll_month_september,
  m.payroll_month_october,
  m.payroll_month_november,
  m.payroll_month_december,
]
const periodYears = Array.from({ length: 101 }, (_, index) => String(2100 - index))

const componentTypeLabels = {
  allowance: m.payroll_employee_components_type_allowance,
  deduction: m.payroll_employee_components_type_deduction,
}

const componentKindOptions = [
  ...employeeComponentKinds.allowance,
  ...employeeComponentKinds.deduction,
] as const

const componentKindLabels: Record<PayrollComponentKind, () => string> = {
  fixed_allowance: m.payroll_employee_components_treatment_fixed_allowance,
  variable_allowance: m.payroll_employee_components_treatment_variable_allowance,
  overtime: m.payroll_employee_components_treatment_overtime,
  thr_bonus: m.payroll_employee_components_treatment_thr_bonus,
  arrears: m.payroll_employee_components_treatment_arrears,
  tax_allowance: m.payroll_employee_components_treatment_tax_allowance,
  other_taxable_income: m.payroll_employee_components_treatment_other_taxable_income,
  non_taxable_payment: m.payroll_employee_components_treatment_non_taxable_payment,
  taxable_benefit: m.payroll_employee_components_treatment_taxable_benefit,
  attendance_reduction: m.payroll_employee_components_treatment_attendance_reduction,
  qualified_pension: m.payroll_employee_components_treatment_qualified_pension,
  qualified_zakat: m.payroll_employee_components_treatment_qualified_zakat,
  loan: m.payroll_employee_components_treatment_loan,
  cash_advance: m.payroll_employee_components_treatment_cash_advance,
  other_deduction: m.payroll_employee_components_treatment_other_deduction,
}

const frequencyLabels = {
  one_time: m.payroll_employee_components_frequency_one_time,
  recurring: m.payroll_employee_components_frequency_recurring,
  installment: m.payroll_employee_components_frequency_installment,
}

const statusLabels = {
  active: m.payroll_employee_components_status_active,
  paused: m.payroll_employee_components_status_paused,
  completed: m.payroll_employee_components_status_completed,
}

interface EmployeeComponentTableProps {
  type: EmployeePayrollComponent['type']
  components: EmployeePayrollComponent[]
  onToggle: (id: string) => void
  onEdit: (component: EmployeePayrollComponent) => void
  onDelete: (component: EmployeePayrollComponent) => void
}

function EmployeeComponentTable({
  type,
  components,
  onToggle,
  onEdit,
  onDelete,
}: EmployeeComponentTableProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | EmployeePayrollComponent['status']>('all')
  const [frequency, setFrequency] = useState<'all' | EmployeePayrollComponent['frequency']>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const typedComponents = components.filter((component) => component.type === type)
  const query = search.trim().toLocaleLowerCase()
  const filteredComponents = typedComponents.filter((component) => {
    const matchesSearch =
      !query ||
      [component.employeeName, component.employeeCode, component.name, component.code].some(
        (value) => value.toLocaleLowerCase().includes(query),
      )
    return (
      matchesSearch &&
      (status === 'all' || component.status === status) &&
      (frequency === 'all' || component.frequency === frequency)
    )
  })
  const totalPages = Math.max(1, Math.ceil(filteredComponents.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleComponents = filteredComponents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const isAllowance = type === 'allowance'

  return (
    <Card className='min-w-0 rounded-2xl [--card-spacing:--spacing(5)]'>
      <CardHeader className='flex flex-row flex-wrap items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          {isAllowance ? (
            <IconCoins className='size-4 shrink-0 text-primary' />
          ) : (
            <IconMinus className='size-4 shrink-0 text-destructive' />
          )}
          <CardTitle className='text-xs font-bold tracking-wider uppercase'>
            {isAllowance
              ? m.payroll_employee_components_allowance_table_title()
              : m.payroll_employee_components_deduction_table_title()}
          </CardTitle>
        </div>
        <Badge variant={isAllowance ? 'blue' : 'red'} className='text-[10px]'>
          {m.payroll_employee_components_count({ count: typedComponents.length })}
        </Badge>
      </CardHeader>
      <CardContent className='flex min-w-0 flex-col gap-4'>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_11rem]'>
          <Input
            type='search'
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder={m.payroll_employee_components_search_placeholder()}
            aria-label={m.payroll_employee_components_search_label({
              type: componentTypeLabels[type](),
            })}
            className='h-10 min-w-0 text-xs sm:col-span-2 lg:col-span-1'
          />
          <Select
            value={status}
            onValueChange={(value: typeof status) => {
              setStatus(value)
              setPage(1)
            }}
          >
            <SelectTrigger
              aria-label={m.payroll_employee_components_status_filter_label()}
              className='h-10 w-full text-xs'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>{m.payroll_employee_components_all_statuses()}</SelectItem>
                <SelectItem value='active'>{statusLabels.active()}</SelectItem>
                <SelectItem value='paused'>{statusLabels.paused()}</SelectItem>
                <SelectItem value='completed'>{statusLabels.completed()}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={frequency}
            onValueChange={(value: typeof frequency) => {
              setFrequency(value)
              setPage(1)
            }}
          >
            <SelectTrigger
              aria-label={m.payroll_employee_components_frequency_filter_label()}
              className='h-10 w-full text-xs'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>
                  {m.payroll_employee_components_all_frequencies()}
                </SelectItem>
                <SelectItem value='one_time'>{frequencyLabels.one_time()}</SelectItem>
                <SelectItem value='recurring'>{frequencyLabels.recurring()}</SelectItem>
                <SelectItem value='installment'>{frequencyLabels.installment()}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='min-w-0 rounded-md border'>
          <Table className='text-xs'>
            <TableHeader>
              <TableRow className='bg-muted/10 font-bold text-muted-foreground'>
                <TableHead>{m.payroll_employee_components_employee_column()}</TableHead>
                <TableHead>{m.payroll_employee_components_component_column()}</TableHead>
                <TableHead>{m.payroll_employee_components_frequency_column()}</TableHead>
                <TableHead>{m.payroll_employee_components_period_column()}</TableHead>
                <TableHead className='text-right'>
                  {m.payroll_employee_components_amount_column()}
                </TableHead>
                <TableHead>{m.payroll_employee_components_status_column()}</TableHead>
                <TableHead className='text-right'>
                  {m.payroll_employee_components_action_column()}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='[&_td]:py-3.5'>
              {visibleComponents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                    {m.payroll_employee_components_empty()}
                  </TableCell>
                </TableRow>
              ) : (
                visibleComponents.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell>
                      <p className='font-medium'>{component.employeeName}</p>
                      <p className='text-xs text-muted-foreground'>{component.employeeCode}</p>
                    </TableCell>
                    <TableCell>
                      <p className='font-medium'>{component.name}</p>
                      <p className='text-xs text-muted-foreground'>{component.code}</p>
                      <p className='text-xs text-muted-foreground'>
                        {componentKindLabels[getEmployeeComponentKind(component)]()}
                      </p>
                    </TableCell>
                    <TableCell>{frequencyLabels[component.frequency]()}</TableCell>
                    <TableCell>
                      {component.startPeriod} —{' '}
                      {component.endPeriod ?? m.payroll_employee_components_period_open()}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatIDR(component.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          component.status === 'active'
                            ? 'green'
                            : component.status === 'paused'
                              ? 'amber'
                              : 'gray'
                        }
                      >
                        {statusLabels[component.status]()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-end gap-1'>
                        <Button
                          type='button'
                          size='sm'
                          variant='ghost'
                          className='text-xs'
                          onClick={() => onToggle(component.id)}
                        >
                          {component.status === 'active'
                            ? m.payroll_employee_components_pause_button()
                            : m.payroll_employee_components_activate_button()}
                        </Button>
                        <Button
                          type='button'
                          size='icon-sm'
                          variant='ghost'
                          onClick={() => onEdit(component)}
                          aria-label={m.payroll_employee_components_edit_button()}
                        >
                          <IconEdit />
                        </Button>
                        <Button
                          type='button'
                          size='icon-sm'
                          variant='ghost'
                          onClick={() => onDelete(component)}
                          aria-label={m.payroll_employee_components_delete_button()}
                        >
                          <IconTrash />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className='p-0'>
        <TablePagination
          itemLabel={m.payroll_employee_components_pagination_item_label()}
          totalItems={filteredComponents.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          className='w-full'
        />
      </CardFooter>
    </Card>
  )
}

export function EmployeeComponentsView() {
  const components = usePayrollComponentStore((state) => state.employeeComponents)
  const addComponent = usePayrollComponentStore((state) => state.addEmployeeComponent)
  const updateComponent = usePayrollComponentStore((state) => state.updateEmployeeComponent)
  const removeComponent = usePayrollComponentStore((state) => state.removeEmployeeComponent)
  const toggleComponent = usePayrollComponentStore((state) => state.toggleEmployeeComponent)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<EmployeePayrollComponent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EmployeePayrollComponent | null>(null)
  const [periodKey, setPeriodKey] = useState(() => dayjs().format('YYYY-MM'))
  const [periodYear, periodMonth] = periodKey.split('-')
  const periodComponents = components.filter((component) =>
    isEmployeeComponentInPeriod(component, periodKey),
  )
  const activeComponents = periodComponents.filter(
    (component) => component.status === 'active' && !isAutomaticPayrollComponent(component),
  )
  const totalForType = (type: EmployeePayrollComponent['type']) =>
    activeComponents
      .filter((component) => component.type === type)
      .reduce((total, component) => total + employeeComponentToInputLine(component).amount, 0)
  const stats = [
    {
      label: m.payroll_employee_components_stats_total(),
      value: String(periodComponents.length),
      description: m.payroll_employee_components_stats_total_note(),
      icon: IconStack2,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: m.payroll_employee_components_stats_employees(),
      value: String(new Set(periodComponents.map((item) => item.employeeId)).size),
      description: m.payroll_employee_components_stats_employees_note(),
      icon: IconUsers,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: m.payroll_employee_components_stats_allowances(),
      value: formatIDR(totalForType('allowance')),
      description: m.payroll_employee_components_stats_allowances_note(),
      icon: IconArrowUpRight,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: m.payroll_employee_components_stats_deductions(),
      value: formatIDR(totalForType('deduction')),
      description: m.payroll_employee_components_stats_deductions_note(),
      icon: IconArrowDownRight,
      iconClassName: 'bg-destructive/10 text-destructive',
    },
  ]

  const formSchema = useSchema((z, messages) => ({
    employeeId: z.string().min(1, messages.payroll_employee_components_employee_required()),
    name: z.string().trim().min(1, messages.payroll_employee_components_name_required()),
    code: z.string().trim().min(1, messages.payroll_employee_components_code_required()),
    type: z.enum(componentTypes),
    componentKind: z.enum(componentKindOptions),
    amount: z.coerce.number().positive(messages.payroll_employee_components_amount_required()),
    frequency: z.enum(['one_time', 'recurring', 'installment']),
    startPeriod: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, messages.payroll_employee_components_period_invalid()),
    endPeriod: z.string(),
    originalAmount: z.coerce.number().min(0),
    remainingBalance: z.coerce.number().min(0),
    notes: z.string(),
  }))
  const validatedSchema = useMemo(
    () =>
      formSchema.superRefine((values, context) => {
        if (
          !(employeeComponentKinds[values.type] as readonly PayrollComponentKind[]).includes(
            values.componentKind,
          )
        ) {
          context.addIssue({
            code: 'custom',
            path: ['componentKind'],
            message: m.payroll_employee_components_treatment_invalid(),
          })
        }
        if (
          (values.endPeriod &&
            (!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.endPeriod) ||
              values.endPeriod < values.startPeriod)) ||
          (values.frequency === 'one_time' && values.endPeriod)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['endPeriod'],
            message: m.payroll_employee_components_import_invalid_period(),
          })
        }
        if (
          values.frequency === 'installment' &&
          (values.originalAmount <= 0 ||
            values.remainingBalance <= 0 ||
            values.remainingBalance > values.originalAmount)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['remainingBalance'],
            message: m.payroll_employee_components_import_invalid_installment(),
          })
        }
      }),
    [formSchema],
  )

  type FormValues = z.infer<typeof validatedSchema>

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(validatedSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      code: '',
      type: 'allowance',
      componentKind: 'other_taxable_income',
      amount: 0,
      frequency: 'one_time',
      startPeriod: periodKey,
      endPeriod: '',
      originalAmount: 0,
      remainingBalance: 0,
      notes: '',
    },
  })

  const frequency = useWatch({ control, name: 'frequency' })
  const selectedType = useWatch({ control, name: 'type' })

  const openCreate = () => {
    setEditingComponent(null)
    reset({
      employeeId: '',
      name: '',
      code: '',
      type: 'allowance',
      componentKind: 'other_taxable_income',
      amount: 0,
      frequency: 'one_time',
      startPeriod: periodKey,
      endPeriod: '',
      originalAmount: 0,
      remainingBalance: 0,
      notes: '',
    })
    setDialogOpen(true)
  }

  const openEdit = (component: EmployeePayrollComponent) => {
    setEditingComponent(component)
    const automaticComponent = isAutomaticPayrollComponent(component)
    if (automaticComponent) {
      snackbar.info(m.payroll_employee_components_automatic_kind_edit_hint())
    }
    reset({
      employeeId: component.employeeId,
      name: component.name,
      code: component.code,
      type: component.type,
      componentKind: automaticComponent
        ? component.type === 'allowance'
          ? 'other_taxable_income'
          : 'other_deduction'
        : getEmployeeComponentKind(component),
      amount: component.amount,
      frequency: component.frequency,
      startPeriod: component.startPeriod,
      endPeriod: component.endPeriod ?? '',
      originalAmount: component.originalAmount ?? 0,
      remainingBalance: component.remainingBalance ?? 0,
      notes: component.notes ?? '',
    })
    setDialogOpen(true)
  }

  const onSubmit = (values: FormValues) => {
    const employee = initialPayrollEmployeeInputs.find(
      (item) => item.employeeId === values.employeeId,
    )
    if (!employee) return
    const component: EmployeePayrollComponent = {
      id: editingComponent?.id ?? '',
      employeeId: employee.employeeId,
      employeeName: employee.name,
      employeeCode: employee.nopeg,
      name: values.name,
      code: values.code.toUpperCase().replace(/\s+/g, '_'),
      type: values.type,
      componentKind: values.componentKind,
      amount: values.amount,
      frequency: values.frequency,
      startPeriod: values.startPeriod,
      endPeriod: values.endPeriod || undefined,
      originalAmount: values.frequency === 'installment' ? values.originalAmount : undefined,
      remainingBalance: values.frequency === 'installment' ? values.remainingBalance : undefined,
      notes: values.notes || undefined,
      status: editingComponent?.status ?? 'active',
    }

    if (editingComponent) updateComponent(component)
    else addComponent(component)
    snackbar.success(m.payroll_employee_components_save_success())
    setDialogOpen(false)
  }

  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <div className='flex min-w-0 flex-col gap-1'>
        <h3 className='text-sm font-bold text-foreground'>{m.payroll_employee_components_title()}</h3>
        <p className='max-w-2xl text-xs text-muted-foreground'>
          {m.payroll_employee_components_description()}
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} size='sm' className='min-w-0'>
              <CardHeader className='flex flex-row items-start justify-between gap-3'>
                <CardTitle className='text-sm text-muted-foreground'>{stat.label}</CardTitle>
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    stat.iconClassName,
                  )}
                >
                  <Icon className='size-5' aria-hidden='true' />
                </div>
              </CardHeader>
              <CardContent className='flex flex-col gap-1'>
                <p className='text-2xl font-semibold break-words tabular-nums'>{stat.value}</p>
                <CardDescription>{stat.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
        <Field className='w-full lg:max-w-64'>
          <FieldLabel htmlFor='employee-components-period-month'>
            {m.payroll_employee_components_period_filter()}
          </FieldLabel>
          <div className='flex gap-2'>
            <Select value={periodMonth} onValueChange={(month) => setPeriodKey(`${periodYear}-${month}`)}>
              <SelectTrigger
                id='employee-components-period-month'
                className='min-w-0 flex-1'
                aria-label={m.payroll_employee_components_period_month()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {periodMonths.map((label, index) => {
                    const month = String(index + 1).padStart(2, '0')
                    return (
                      <SelectItem key={month} value={month}>
                        {label()}
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={periodYear} onValueChange={(year) => setPeriodKey(`${year}-${periodMonth}`)}>
              <SelectTrigger
                className='w-24 shrink-0'
                aria-label={m.payroll_employee_components_period_year()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {periodYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Field>
        <div className='flex flex-wrap items-center gap-2 lg:justify-end'>
          <EmployeeComponentImportPanel />
          <Button type='button' size='sm' onClick={openCreate}>
            <IconPlus data-icon='inline-start' />
            {m.payroll_employee_components_add_button()}
          </Button>
        </div>
      </div>

      <EmployeeComponentTable
        type='allowance'
        components={periodComponents}
        onToggle={toggleComponent}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />
      <EmployeeComponentTable
        type='deduction'
        components={periodComponents}
        onToggle={toggleComponent}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl [&_[data-slot=field-label]]:text-xs [&_[data-slot=input]]:h-10 [&_[data-slot=input]]:text-xs [&_[data-slot=select-trigger]]:h-10 [&_[data-slot=select-trigger]]:text-xs'>
          <DialogHeader>
            <DialogTitle className='text-base'>
              {editingComponent
                ? m.payroll_employee_components_edit_title()
                : m.payroll_employee_components_create_title()}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              {m.payroll_employee_components_form_description()}
            </DialogDescription>
          </DialogHeader>
          <form id='employee-payroll-component-form' onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Field data-invalid={!!errors.employeeId}>
                <FieldLabel>{m.payroll_employee_components_employee_field_label()}</FieldLabel>
                <Controller
                  name='employeeId'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.employeeId}>
                        <SelectValue
                          placeholder={m.payroll_employee_components_employee_field_placeholder()}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {initialPayrollEmployeeInputs.map((employee) => (
                            <SelectItem key={employee.employeeId} value={employee.employeeId}>
                              {employee.nopeg} · {employee.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={errors.employeeId ? [errors.employeeId] : undefined} />
              </Field>
              <Field data-invalid={!!errors.type}>
                <FieldLabel>{m.payroll_employee_components_kind_field_label()}</FieldLabel>
                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: FormValues['type']) => {
                        field.onChange(value)
                        setValue(
                          'componentKind',
                          value === 'allowance' ? 'other_taxable_income' : 'other_deduction',
                        )
                      }}
                    >
                      <SelectTrigger aria-invalid={!!errors.type}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {componentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {componentTypeLabels[type]()}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field data-invalid={!!errors.componentKind}>
                <FieldLabel htmlFor='employee-component-treatment'>
                  {m.payroll_employee_components_treatment_field_label()}
                </FieldLabel>
                <Controller
                  name='componentKind'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='employee-component-treatment'
                        aria-invalid={!!errors.componentKind}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {employeeComponentKinds[selectedType].map((kind) => (
                            <SelectItem key={kind} value={kind}>
                              {componentKindLabels[kind]()}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={errors.componentKind ? [errors.componentKind] : undefined} />
              </Field>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor='employee-component-name'>
                  {m.payroll_employee_components_name_field_label()}
                </FieldLabel>
                <Input
                  id='employee-component-name'
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>
              <Field data-invalid={!!errors.code}>
                <FieldLabel htmlFor='employee-component-code'>
                  {m.payroll_employee_components_code_field_label()}
                </FieldLabel>
                <Input
                  id='employee-component-code'
                  aria-invalid={!!errors.code}
                  {...register('code')}
                />
                <FieldError errors={errors.code ? [errors.code] : undefined} />
              </Field>
              <Field data-invalid={!!errors.amount}>
                <FieldLabel htmlFor='employee-component-amount'>
                  {m.payroll_employee_components_amount_field_label()}
                </FieldLabel>
                <Input
                  id='employee-component-amount'
                  type='number'
                  min={1}
                  aria-invalid={!!errors.amount}
                  {...register('amount')}
                />
                <FieldError errors={errors.amount ? [errors.amount] : undefined} />
              </Field>
              <Field data-invalid={!!errors.frequency}>
                <FieldLabel>{m.payroll_employee_components_frequency_field_label()}</FieldLabel>
                <Controller
                  name='frequency'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.frequency}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='one_time'>
                            {m.payroll_employee_components_frequency_one_time()}
                          </SelectItem>
                          <SelectItem value='recurring'>
                            {m.payroll_employee_components_frequency_recurring()}
                          </SelectItem>
                          <SelectItem value='installment'>
                            {m.payroll_employee_components_frequency_installment()}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field data-invalid={!!errors.startPeriod}>
                <FieldLabel htmlFor='employee-component-start'>
                  {m.payroll_employee_components_start_field_label()}
                </FieldLabel>
                <Input
                  id='employee-component-start'
                  type='month'
                  aria-invalid={!!errors.startPeriod}
                  {...register('startPeriod')}
                />
                <FieldError errors={errors.startPeriod ? [errors.startPeriod] : undefined} />
              </Field>
              <Field data-invalid={!!errors.endPeriod}>
                <FieldLabel htmlFor='employee-component-end'>
                  {m.payroll_employee_components_end_field_label()}
                </FieldLabel>
                <Input
                  id='employee-component-end'
                  type='month'
                  aria-invalid={!!errors.endPeriod}
                  {...register('endPeriod')}
                />
                <FieldError errors={errors.endPeriod ? [errors.endPeriod] : undefined} />
              </Field>
              {frequency === 'installment' && (
                <>
                  <Field data-invalid={!!errors.originalAmount}>
                    <FieldLabel htmlFor='employee-component-original'>
                      {m.payroll_employee_components_original_field_label()}
                    </FieldLabel>
                    <Input
                      id='employee-component-original'
                      type='number'
                      min={0}
                      aria-invalid={!!errors.originalAmount}
                      {...register('originalAmount')}
                    />
                  </Field>
                  <Field data-invalid={!!errors.remainingBalance}>
                    <FieldLabel htmlFor='employee-component-balance'>
                      {m.payroll_employee_components_balance_field_label()}
                    </FieldLabel>
                    <Input
                      id='employee-component-balance'
                      type='number'
                      min={0}
                      aria-invalid={!!errors.remainingBalance}
                      {...register('remainingBalance')}
                    />
                    <FieldError
                      errors={errors.remainingBalance ? [errors.remainingBalance] : undefined}
                    />
                  </Field>
                </>
              )}
              <Field className='sm:col-span-2'>
                <FieldLabel htmlFor='employee-component-notes'>
                  {m.payroll_employee_components_notes_field_label()}
                </FieldLabel>
                <Input id='employee-component-notes' {...register('notes')} />
              </Field>
            </FieldGroup>
          </form>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              size='lg'
              className='rounded-xl text-xs font-semibold'
              onClick={() => setDialogOpen(false)}
            >
              {m.payroll_employee_components_cancel_button()}
            </Button>
            <Button
              type='submit'
              size='lg'
              className='rounded-xl text-xs font-semibold'
              form='employee-payroll-component-form'
            >
              {m.payroll_employee_components_save_button()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.payroll_employee_components_delete_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.payroll_employee_components_delete_description({ name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size='lg' className='rounded-xl text-xs font-semibold'>
              {m.payroll_employee_components_cancel_button()}
            </AlertDialogCancel>
            <AlertDialogAction
              size='lg'
              className='rounded-xl text-xs font-semibold'
              onClick={() => {
                if (deleteTarget) removeComponent(deleteTarget.id)
                setDeleteTarget(null)
                snackbar.success(m.payroll_employee_components_delete_success())
              }}
            >
              {m.payroll_employee_components_delete_button()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
