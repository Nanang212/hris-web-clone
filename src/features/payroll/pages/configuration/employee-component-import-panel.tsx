import { IconAlertTriangle, IconDownload, IconUpload } from '@tabler/icons-react'
import { useRef, useState } from 'react'

import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ButtonGroup } from '@/shared/components/ui/button-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
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

import { initialPayrollEmployeeInputs } from '../../data/mock-payroll-inputs'
import {
  downloadEmployeeComponentTemplate,
  employeeComponentExcelColumns,
  readEmployeeComponentWorkbook,
} from '../../lib/employee-component-excel'
import { employeeComponentKinds, usePayrollComponentStore } from '../../store/payroll-component-store'
import { resolveComponentParameters, validateComponentParameters } from '../../lib/payroll-component-parameters'
import type { EmployeePayrollComponent, PayrollComponentKind } from '../../types'

const permittedKinds = [
  ...employeeComponentKinds.allowance,
  ...employeeComponentKinds.deduction,
] as const
const periodPattern = /^\d{4}-(0[1-9]|1[0-2])$/

interface PendingImport {
  fileName: string
  rows: EmployeePayrollComponent[]
  errors: string[]
}

function overlaps(first: EmployeePayrollComponent, second: EmployeePayrollComponent): boolean {
  const firstEnd =
    first.frequency === 'one_time' ? first.startPeriod : (first.endPeriod ?? '9999-12')
  const secondEnd =
    second.frequency === 'one_time' ? second.startPeriod : (second.endPeriod ?? '9999-12')
  return first.startPeriod <= secondEnd && second.startPeriod <= firstEnd
}

export function EmployeeComponentImportPanel() {
  const components = usePayrollComponentStore((state) => state.employeeComponents)
  const addImportedComponents = usePayrollComponentStore((state) => state.addImportedEmployeeComponents)
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<PendingImport | null>(null)
  const [isReading, setIsReading] = useState(false)

  const rowSchema = useSchema((z, messages) => ({
    employeeCode: z.string().trim().min(1, messages.payroll_employee_components_import_invalid_row()),
    name: z.string().trim().min(1, messages.payroll_employee_components_import_invalid_row()),
    code: z.string().trim().min(1, messages.payroll_employee_components_import_invalid_row()),
    type: z.enum(['allowance', 'deduction']),
    componentKind: z.enum(permittedKinds),
    amount: z.coerce.number().positive(),
    frequency: z.enum(['one_time', 'recurring', 'installment']),
    startPeriod: z.string().regex(periodPattern),
    endPeriod: z.string(),
    originalAmount: z.coerce.number().min(0),
    remainingBalance: z.coerce.number().min(0),
    notes: z.string(),
    thpEffect: z.union([z.enum(['add', 'subtract', 'none']), z.literal('')]),
    taxGrossEffect: z.union([z.enum(['add', 'subtract', 'none']), z.literal('')]),
    taxTreatment: z.union([z.enum(['regular', 'final', 'non_taxable']), z.literal('')]),
  }))

  const closeDialog = () => {
    setOpen(false)
    setPending(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!/\.xlsx?$/i.test(file.name) || file.size > 5 * 1024 * 1024) {
      snackbar.error(m.payroll_employee_components_import_invalid_file())
      return
    }

    setPending(null)
    setIsReading(true)
    try {
      const rawRows = await readEmployeeComponentWorkbook(file)
      if (rawRows.length === 0) {
        snackbar.error(m.payroll_employee_components_import_empty_file())
        return
      }
      if (rawRows.length > 1000) {
        snackbar.error(m.payroll_employee_components_import_too_many_rows())
        return
      }

      const rows: EmployeePayrollComponent[] = []
      const errors: string[] = []
      for (const [index, rawRow] of rawRows.entries()) {
        const normalized = Object.fromEntries(
          employeeComponentExcelColumns.map((column) => [column, String(rawRow[column] ?? '').trim()]),
        )
        normalized.type = normalized.type.toLowerCase()
        normalized.componentKind = normalized.componentKind.toLowerCase()
        normalized.frequency = normalized.frequency.toLowerCase()
        const parsed = rowSchema.safeParse(normalized)
        const rowNumber = Number(rawRow.__rowNumber ?? index + 2)
        const addError = (reason: string) => {
          errors.push(m.payroll_employee_components_import_row_error({ row: rowNumber, reason }))
        }
        if (!parsed.success) {
          addError(m.payroll_employee_components_import_invalid_row())
          continue
        }
        const data = parsed.data
        const employee = initialPayrollEmployeeInputs.find(
          (item) => item.nopeg.toLowerCase() === data.employeeCode.toLowerCase(),
        )
        if (!employee) {
          addError(m.payroll_employee_components_import_unknown_employee())
          continue
        }
        if (!(employeeComponentKinds[data.type] as readonly PayrollComponentKind[]).includes(data.componentKind)) {
          addError(m.payroll_employee_components_import_invalid_treatment())
          continue
        }
        if (
          (data.endPeriod && (!periodPattern.test(data.endPeriod) || data.endPeriod < data.startPeriod)) ||
          (data.frequency === 'one_time' && data.endPeriod)
        ) {
          addError(m.payroll_employee_components_import_invalid_period())
          continue
        }
        if (
          data.frequency === 'installment' &&
          (data.originalAmount <= 0 || data.remainingBalance <= 0 || data.remainingBalance > data.originalAmount)
        ) {
          addError(m.payroll_employee_components_import_invalid_installment())
          continue
        }
        const component: EmployeePayrollComponent = {
          id: crypto.randomUUID(),
          employeeId: employee.employeeId,
          employeeName: employee.name,
          employeeCode: employee.nopeg,
          name: data.name,
          code: data.code.toUpperCase().replace(/\s+/g, '_'),
          type: data.type,
          componentKind: data.componentKind,
          amount: data.amount,
          frequency: data.frequency,
          startPeriod: data.startPeriod,
          endPeriod: data.endPeriod || undefined,
          originalAmount: data.frequency === 'installment' ? data.originalAmount : undefined,
          remainingBalance: data.frequency === 'installment' ? data.remainingBalance : undefined,
          status: 'active',
          notes: data.notes || undefined,
        }
        const defaults = resolveComponentParameters({ type: component.type, componentKind: component.componentKind, isTaxable: component.type === 'allowance' && component.componentKind !== 'non_taxable_payment', cashImpact: component.componentKind !== 'taxable_benefit' })
        component.parameters = {
          thpEffect: data.thpEffect || defaults.thpEffect,
          taxGrossEffect: data.taxGrossEffect || defaults.taxGrossEffect,
          taxTreatment: data.taxTreatment || defaults.taxTreatment,
        }
        if (!validateComponentParameters(component.parameters)) {
          addError(m.payroll_revision_invalid_parameters())
          continue
        }
        const conflict = [...components, ...rows].some(
          (item) =>
            item.employeeId === component.employeeId &&
            item.code.toUpperCase() === component.code &&
            overlaps(item, component),
        )
        if (conflict) {
          addError(m.payroll_employee_components_import_duplicate())
          continue
        }
        rows.push(component)
      }
      setPending({ fileName: file.name, rows, errors })
      setOpen(true)
    } catch {
      snackbar.error(m.payroll_employee_components_import_read_error())
    } finally {
      setIsReading(false)
    }
  }

  const confirmImport = () => {
    if (!pending || pending.errors.length > 0 || pending.rows.length === 0) return
    addImportedComponents(pending.rows)
    snackbar.success(m.payroll_employee_components_import_saved({ count: pending.rows.length }))
    closeDialog()
  }

  const handleDownloadTemplate = async () => {
    try {
      await downloadEmployeeComponentTemplate()
    } catch {
      snackbar.error(m.payroll_employee_components_import_template_error())
    }
  }

  return (
    <>
      <ButtonGroup>
        <Button type='button' size='sm' variant='outline' onClick={handleDownloadTemplate}>
          <IconDownload data-icon='inline-start' />
          {m.payroll_employee_components_import_template()}
        </Button>
        <Button type='button' size='sm' variant='outline' disabled={isReading} onClick={() => fileRef.current?.click()}>
          {isReading ? <Spinner data-icon='inline-start' /> : <IconUpload data-icon='inline-start' />}
          {m.payroll_employee_components_import_button()}
        </Button>
      </ButtonGroup>
      <Input
        ref={fileRef}
        type='file'
        accept='.xlsx,.xls'
        className='sr-only'
        aria-label={m.payroll_employee_components_import_choose_file()}
        onChange={handleFileChange}
      />
      <Dialog open={open} onOpenChange={(nextOpen) => nextOpen ? setOpen(true) : closeDialog()}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>{m.payroll_employee_components_import_title()}</DialogTitle>
            <DialogDescription>{m.payroll_employee_components_import_description()}</DialogDescription>
          </DialogHeader>

          {pending && (
            <div className='flex min-w-0 flex-col gap-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge variant={pending.errors.length > 0 ? 'red' : 'green'}>
                  {m.payroll_employee_components_import_preview_count({ count: pending.rows.length })}
                </Badge>
                <span className='min-w-0 truncate text-sm text-muted-foreground'>{pending.fileName}</span>
              </div>
              {pending.errors.length > 0 && (
                <Alert variant='destructive' className='items-start'>
                  <AlertIcon><IconAlertTriangle /></AlertIcon>
                  <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  <AlertTitle>{m.payroll_employee_components_import_errors_title({ count: pending.errors.length })}</AlertTitle>
                  <AlertDescription className='flex flex-col gap-1'>
                    {pending.errors.slice(0, 10).map((error) => <p key={error}>{error}</p>)}
                  </AlertDescription>
                  </div>
                </Alert>
              )}
              <div className='max-h-72 min-w-0 overflow-auto rounded-md border'>
                <Table className='min-w-[36rem]'>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{m.payroll_employee_components_employee_column()}</TableHead>
                      <TableHead>{m.payroll_employee_components_component_column()}</TableHead>
                      <TableHead>{m.payroll_employee_components_period_column()}</TableHead>
                      <TableHead className='text-right'>{m.payroll_employee_components_amount_column()}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.employeeCode} · {row.employeeName}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.startPeriod}{row.endPeriod ? ` – ${row.endPeriod}` : ''}</TableCell>
                        <TableCell className='text-right'>{row.amount.toLocaleString(getLocale())}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type='button' variant='outline' onClick={closeDialog}>
              {m.payroll_employee_components_cancel_button()}
            </Button>
            <Button
              type='button'
              disabled={!pending || isReading || pending.errors.length > 0 || pending.rows.length === 0}
              onClick={confirmImport}
            >
              {m.payroll_employee_components_import_save()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
