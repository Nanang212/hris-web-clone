import { zodResolver } from '@hookform/resolvers/zod'
import { IconCoins, IconEdit, IconMinus, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
import { m } from '@/i18n/paraglide/messages'

import { formatIDR } from '../../data/mock-payroll-data'
import { initialPayrollEmployeeInputs } from '../../data/mock-payroll-inputs'
import { usePayrollComponentStore } from '../../store/payroll-component-store'
import type { EmployeePayrollComponent } from '../../types'

const componentTypes = ['allowance', 'deduction'] as const

const componentTypeLabels = {
  allowance: m.payroll_employee_components_type_allowance,
  deduction: m.payroll_employee_components_type_deduction,
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
          <CardTitle className='text-xs font-bold uppercase tracking-wider'>
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

  const formSchema = useSchema((z, messages) => ({
    employeeId: z.string().min(1, messages.payroll_employee_components_employee_required()),
    name: z.string().trim().min(1, messages.payroll_employee_components_name_required()),
    code: z.string().trim().min(1, messages.payroll_employee_components_code_required()),
    type: z.enum(componentTypes),
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

  type FormValues = z.infer<typeof formSchema>

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      code: '',
      type: 'allowance',
      amount: 0,
      frequency: 'one_time',
      startPeriod: '2026-07',
      endPeriod: '',
      originalAmount: 0,
      remainingBalance: 0,
      notes: '',
    },
  })

  const frequency = useWatch({ control, name: 'frequency' })

  const openCreate = () => {
    setEditingComponent(null)
    reset({
      employeeId: '',
      name: '',
      code: '',
      type: 'allowance',
      amount: 0,
      frequency: 'one_time',
      startPeriod: '2026-07',
      endPeriod: '',
      originalAmount: 0,
      remainingBalance: 0,
      notes: '',
    })
    setDialogOpen(true)
  }

  const openEdit = (component: EmployeePayrollComponent) => {
    setEditingComponent(component)
    reset({
      employeeId: component.employeeId,
      name: component.name,
      code: component.code,
      type: component.type,
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
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h3 className='text-sm font-bold'>{m.payroll_employee_components_title()}</h3>
          <p className='text-xs text-muted-foreground'>
            {m.payroll_employee_components_description()}
          </p>
        </div>
        <Button
          type='button'
          className='h-9 rounded-xl px-4 text-xs font-semibold'
          onClick={openCreate}
        >
          <IconPlus data-icon='inline-start' />
          {m.payroll_employee_components_add_button()}
        </Button>
      </div>

      <EmployeeComponentTable
        type='allowance'
        components={components}
        onToggle={toggleComponent}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />
      <EmployeeComponentTable
        type='deduction'
        components={components}
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
