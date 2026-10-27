import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconAdjustments,
  IconCalculator,
  IconCoins,
  IconPlus,
  IconReceipt,
  IconShieldCheck,
  IconTrash,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
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
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { PayrollComponentParametersFields } from '@/features/payroll/components/payroll-component-parameters-fields'
import { formatIDR } from '@/features/payroll/data/mock-payroll-data'
import {
  resolveComponentParameters,
  validateComponentParameters,
} from '@/features/payroll/lib/payroll-component-parameters'
import { isValidPtkpStatus } from '@/features/payroll/lib/pph21-calc'
import type {
  EmployeePayrollDetail,
  PayrollEmployeeInput,
  PayrollEmployeeOverride,
  PayrollStatutoryAmounts,
} from '@/features/payroll/types'
import { m } from '@/i18n/paraglide/messages'

interface EmployeePayrollEditModalProps {
  source: PayrollEmployeeInput
  sourceDetail: EmployeePayrollDetail
  currentDetail: EmployeePayrollDetail
  override?: PayrollEmployeeOverride
  periodMonth: number
  onClose: () => void
  onSave: (override: PayrollEmployeeOverride | null) => void
}

export function EmployeePayrollEditModal({
  source,
  sourceDetail,
  currentDetail,
  override,
  periodMonth,
  onClose,
  onSave,
}: EmployeePayrollEditModalProps) {
  const schema = useSchema(() => {
    const amount = z.number().finite().min(0, m.payroll_revision_numeric_invalid())
    const parameters = z
      .object({
        thpEffect: z.enum(['add', 'subtract', 'none']),
        taxGrossEffect: z.enum(['add', 'subtract', 'none']),
        taxTreatment: z.enum(['regular', 'final', 'non_taxable']),
      })
      .refine(validateComponentParameters, m.payroll_revision_invalid_parameters())
    return {
      baseSalary: amount,
      ptkpStatus: z.string().refine(isValidPtkpStatus, m.payroll_wizard_invalid_ptkp({ count: 1 })),
      components: z.array(
        z.object({
          code: z.string().min(1),
          name: z.string().trim().min(1, m.payroll_employee_components_name_required()),
          type: z.enum(['allowance', 'deduction']),
          source: z.enum(['fixed', 'variable', 'attendance']),
          amount,
          isTaxable: z.boolean(),
          cashImpact: z.boolean().optional(),
          componentKind: z
            .enum([
              'fixed_allowance',
              'variable_allowance',
              'overtime',
              'thr_bonus',
              'arrears',
              'tax_allowance',
              'other_taxable_income',
              'non_taxable_payment',
              'taxable_benefit',
              'attendance_reduction',
              'qualified_pension',
              'qualified_zakat',
              'loan',
              'cash_advance',
              'other_deduction',
            ])
            .optional(),
          parameters,
        }),
      ),
      statutoryAmounts: z.object({
        bpjsKesEmployee: amount,
        bpjsKesEmployer: amount,
        bpjsTkJhtEmployee: amount,
        bpjsTkJpEmployee: amount,
        bpjsTkJkk: amount,
        bpjsTkJkm: amount,
      }),
      thrTaxInstallmentAmount: amount.max(
        source.thrTaxInstallment?.remainingBalance ?? 0,
        m.payroll_run_detail_remaining_balance({
          amount: formatIDR(source.thrTaxInstallment?.remainingBalance ?? 0),
        }),
      ),
      taxYearToDate: z.object({
        priorTaxableGross: amount,
        priorEmployeePensionContributions: amount,
        priorQualifiedZakat: amount,
        priorPph21Paid: amount,
        monthsWorked: z.number().int().min(1).max(periodMonth),
        verified: z.boolean(),
        isFinalTaxPeriod: z.boolean(),
      }),
      note: z.string(),
    }
  })
  type Values = z.infer<typeof schema>
  const sourceStatutory: PayrollStatutoryAmounts = {
    bpjsKesEmployee: sourceDetail.bpjsKesEmployee,
    bpjsKesEmployer: sourceDetail.bpjsKesEmployer,
    bpjsTkJhtEmployee: sourceDetail.bpjsTkJhtEmployee ?? 0,
    bpjsTkJpEmployee: sourceDetail.bpjsTkJpEmployee ?? 0,
    bpjsTkJkk: sourceDetail.bpjsTkJkk ?? 0,
    bpjsTkJkm: sourceDetail.bpjsTkJkm ?? 0,
  }
  const lines = override
    ? [
        ...override.fixedComponents.map((line) => ({ ...line, source: 'fixed' as const })),
        ...override.variableComponents.map((line) => ({ ...line, source: 'variable' as const })),
      ]
    : (sourceDetail.lines?.filter((line) => !line.calculated) ?? [])
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      baseSalary: override?.baseSalary ?? source.baseSalary,
      ptkpStatus: override?.ptkpStatus ?? source.ptkpStatus,
      components: lines.map((line) => ({ ...line, parameters: resolveComponentParameters(line) })),
      statutoryAmounts: {
        bpjsKesEmployee: currentDetail.bpjsKesEmployee,
        bpjsKesEmployer: currentDetail.bpjsKesEmployer,
        bpjsTkJhtEmployee: currentDetail.bpjsTkJhtEmployee ?? 0,
        bpjsTkJpEmployee: currentDetail.bpjsTkJpEmployee ?? 0,
        bpjsTkJkk: currentDetail.bpjsTkJkk ?? 0,
        bpjsTkJkm: currentDetail.bpjsTkJkm ?? 0,
        ...override?.statutoryAmounts,
      },
      thrTaxInstallmentAmount:
        override?.thrTaxInstallmentAmount ?? sourceDetail.thrTaxInstallment ?? 0,
      taxYearToDate: {
        priorTaxableGross: 0,
        priorEmployeePensionContributions: 0,
        priorQualifiedZakat: 0,
        priorPph21Paid: 0,
        verified: false,
        isFinalTaxPeriod: false,
        ...source.taxYearToDate,
        ...override?.taxYearToDate,
        monthsWorked: Math.min(
          periodMonth,
          override?.taxYearToDate?.monthsWorked ??
            source.taxYearToDate?.monthsWorked ??
            periodMonth,
        ),
      },
      note: override?.note ?? '',
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'components' })
  const statutoryLabels: Record<keyof PayrollStatutoryAmounts, string> = {
    bpjsKesEmployee: m.payroll_breakdown_health_employee(),
    bpjsKesEmployer: m.payroll_revision_health_employer(),
    bpjsTkJhtEmployee: m.payroll_bpjs_tk_jht(),
    bpjsTkJpEmployee: m.payroll_bpjs_tk_jp(),
    bpjsTkJkk: m.payroll_bpjs_tk_jkk(),
    bpjsTkJkm: m.payroll_bpjs_tk_jkm(),
  }
  const ytdLabels = {
    priorTaxableGross: m.payroll_tax_ytd_prior_gross(),
    priorEmployeePensionContributions: m.payroll_tax_ytd_prior_pension(),
    priorQualifiedZakat: m.payroll_tax_ytd_prior_zakat(),
    priorPph21Paid: m.payroll_tax_ytd_prior_tax(),
    monthsWorked: m.payroll_tax_ytd_months_worked(),
  }
  const save = (values: Values) => {
    const statutoryAmounts: Partial<PayrollStatutoryAmounts> = { ...override?.statutoryAmounts }
    for (const key of Object.keys(sourceStatutory) as (keyof PayrollStatutoryAmounts)[]) {
      if (dirtyFields.statutoryAmounts?.[key]) statutoryAmounts[key] = values.statutoryAmounts[key]
    }
    onSave({
      ...values,
      statutoryAmounts,
      fixedComponents: values.components.filter((line) => line.source === 'fixed'),
      variableComponents: values.components.filter((line) => line.source !== 'fixed'),
      updatedAt: dayjs().toISOString(),
    })
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className='flex max-h-[90dvh] w-[calc(100%-2rem)] flex-col overflow-hidden sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base font-bold'>
            <IconAdjustments className='size-5 shrink-0 text-primary' />
            {m.payroll_run_detail_dialog_title()}
          </DialogTitle>
          <DialogDescription className='text-xs'>
            <span className='font-semibold text-foreground'>{source.name}</span> (
            {currentDetail.employeeCode}). {m.payroll_revision_inputs_description()}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(save)}
          noValidate
          className='flex min-h-0 min-w-0 flex-1 flex-col gap-4'
        >
          <div className='flex min-h-0 flex-col gap-5 overflow-y-auto py-2 pr-2 text-xs'>
            <FieldGroup className='rounded-xl border border-primary/20 bg-primary/5 p-3.5'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h3 className='flex items-center gap-2 font-bold'>
                  <IconCoins className='size-4 shrink-0 text-primary' />
                  {m.payroll_run_detail_thr_installment()}
                </h3>
                {source.thrTaxInstallment && (
                  <Badge variant='outline'>
                    {m.payroll_run_detail_month_of({
                      current: currentDetail.thrTaxInstallmentInfo?.currentInstallmentMonth ?? 1,
                      total: source.thrTaxInstallment.tenorMonths,
                    })}
                  </Badge>
                )}
              </div>
              <Field data-invalid={Boolean(errors.thrTaxInstallmentAmount)}>
                <FieldLabel htmlFor='payroll-thr-installment'>
                  {m.payroll_run_detail_thr_amount()}
                </FieldLabel>
                <Input
                  id='payroll-thr-installment'
                  type='number'
                  min={0}
                  step={25000}
                  className='h-9 rounded-xl bg-background text-xs'
                  {...register('thrTaxInstallmentAmount', { valueAsNumber: true })}
                  aria-invalid={Boolean(errors.thrTaxInstallmentAmount)}
                />
                <FieldError errors={[errors.thrTaxInstallmentAmount]} />
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <FieldDescription className='text-[10px]'>
                    {m.payroll_run_detail_remaining_balance({
                      amount: formatIDR(source.thrTaxInstallment?.remainingBalance ?? 0),
                    })}
                  </FieldDescription>
                  <Button
                    type='button'
                    variant='link'
                    size='sm'
                    className='h-auto p-0 text-xs'
                    onClick={() =>
                      setValue('thrTaxInstallmentAmount', 0, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    {m.payroll_run_detail_pause_installment()}
                  </Button>
                </div>
              </Field>
            </FieldGroup>
            <FieldGroup className='rounded-xl border border-border/80 bg-muted/20 p-3.5'>
              <h3 className='flex items-center gap-2 font-bold'>
                <IconAdjustments className='size-4 shrink-0 text-muted-foreground' />
                {m.payroll_revision_inputs_title()}
              </h3>
              <FieldGroup className='grid gap-3 sm:grid-cols-2'>
                <Field data-invalid={Boolean(errors.baseSalary)}>
                  <FieldLabel htmlFor='payroll-override-base'>
                    {m.payroll_run_detail_col_base_salary()}
                  </FieldLabel>
                  <Input
                    id='payroll-override-base'
                    type='number'
                    min={0}
                    className='h-9 rounded-xl bg-background text-xs'
                    {...register('baseSalary', { valueAsNumber: true })}
                    aria-invalid={Boolean(errors.baseSalary)}
                  />
                  <FieldDescription>
                    {m.payroll_revision_source({ amount: formatIDR(source.baseSalary) })}
                  </FieldDescription>
                  <FieldError errors={[errors.baseSalary]} />
                </Field>
                <Field data-invalid={Boolean(errors.ptkpStatus)}>
                  <FieldLabel htmlFor='payroll-override-ptkp'>
                    {m.payroll_payslip_detail_ptkp()}
                  </FieldLabel>
                  <Input
                    id='payroll-override-ptkp'
                    className='h-9 rounded-xl bg-background text-xs'
                    {...register('ptkpStatus')}
                    aria-invalid={Boolean(errors.ptkpStatus)}
                  />
                  <FieldError errors={[errors.ptkpStatus]} />
                </Field>
              </FieldGroup>
              <FieldGroup className='gap-3'>
                {fields.map((line, index) => (
                  <FieldGroup key={line.id} className='min-w-0 rounded-xl border bg-background p-3'>
                    <FieldGroup className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)_auto]'>
                      <Field data-invalid={Boolean(errors.components?.[index]?.name)}>
                        <FieldLabel htmlFor={`payroll-line-${index}`}>
                          {m.payroll_revision_name()}
                        </FieldLabel>
                        <Input
                          id={`payroll-line-${index}`}
                          className='h-9 rounded-xl text-xs'
                          {...register(`components.${index}.name`)}
                          aria-invalid={Boolean(errors.components?.[index]?.name)}
                        />
                        <FieldDescription>
                          {line.source === 'fixed'
                            ? m.payroll_revision_fixed()
                            : m.payroll_revision_variable()}
                        </FieldDescription>
                        <FieldError errors={[errors.components?.[index]?.name]} />
                      </Field>
                      <Field
                        className='col-start-1 row-start-2 sm:col-start-2 sm:row-start-1'
                        data-invalid={Boolean(errors.components?.[index]?.amount)}
                      >
                        <FieldLabel htmlFor={`payroll-amount-${index}`}>
                          {m.payroll_revision_amount()}
                        </FieldLabel>
                        <Input
                          id={`payroll-amount-${index}`}
                          type='number'
                          min={0}
                          className='h-9 rounded-xl text-xs'
                          {...register(`components.${index}.amount`, { valueAsNumber: true })}
                          aria-invalid={Boolean(errors.components?.[index]?.amount)}
                        />
                        <FieldError errors={[errors.components?.[index]?.amount]} />
                        <FieldDescription>
                          {m.payroll_revision_source({
                            amount: formatIDR(
                              sourceDetail.lines?.find((item) => item.code === line.code)?.amount ??
                                0,
                            ),
                          })}
                        </FieldDescription>
                      </Field>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='col-start-2 row-start-1 self-center sm:col-start-3'
                        aria-label={m.payroll_revision_remove_line()}
                        onClick={() => remove(index)}
                      >
                        <IconTrash data-icon='inline-start' />
                      </Button>
                    </FieldGroup>
                    <Controller
                      control={control}
                      name={`components.${index}.parameters`}
                      render={({ field }) => (
                        <PayrollComponentParametersFields
                          compact
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.components?.[index]?.parameters?.message}
                        />
                      )}
                    />
                  </FieldGroup>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='self-start'
                  onClick={() =>
                    append({
                      code: `MANUAL_${crypto.randomUUID()}`,
                      name: '',
                      type: 'allowance',
                      source: 'variable',
                      amount: 0,
                      isTaxable: true,
                      parameters: {
                        thpEffect: 'add',
                        taxGrossEffect: 'add',
                        taxTreatment: 'regular',
                      },
                    })
                  }
                >
                  <IconPlus data-icon='inline-start' />
                  {m.payroll_revision_add_line()}
                </Button>
              </FieldGroup>
            </FieldGroup>
            <FieldGroup className='rounded-xl border border-border/80 bg-muted/20 p-3.5'>
              <h3 className='flex items-center gap-2 font-bold'>
                <IconShieldCheck className='size-4 shrink-0 text-muted-foreground' />
                {m.payroll_revision_statutory()}
              </h3>
              <FieldGroup className='grid gap-3 sm:grid-cols-2'>
                {(Object.keys(sourceStatutory) as (keyof PayrollStatutoryAmounts)[]).map((name) => (
                  <Field key={name} data-invalid={Boolean(errors.statutoryAmounts?.[name])}>
                    <FieldLabel htmlFor={`payroll-${name}`}>{statutoryLabels[name]}</FieldLabel>
                    <Input
                      id={`payroll-${name}`}
                      type='number'
                      min={0}
                      className='h-9 rounded-xl bg-background text-xs'
                      {...register(`statutoryAmounts.${name}`, { valueAsNumber: true })}
                      aria-invalid={Boolean(errors.statutoryAmounts?.[name])}
                    />
                    <FieldDescription>
                      {m.payroll_revision_source({ amount: formatIDR(sourceStatutory[name]) })}
                    </FieldDescription>
                    <FieldError errors={[errors.statutoryAmounts?.[name]]} />
                  </Field>
                ))}
              </FieldGroup>
            </FieldGroup>
            <FieldGroup className='rounded-xl border border-border/80 bg-muted/20 p-3.5'>
              <h3 className='flex items-center gap-2 font-bold'>
                <IconReceipt className='size-4 shrink-0 text-muted-foreground' />
                {m.payroll_revision_ytd()}
              </h3>
              <Alert variant='info' className='items-start'>
                <AlertIcon><IconReceipt /></AlertIcon>
                <AlertDescription className='min-w-0 flex-1'>{m.payroll_revision_ytd_hint()}</AlertDescription>
              </Alert>
              <FieldGroup className='grid gap-4 sm:grid-cols-2'>
                {(Object.keys(ytdLabels) as (keyof typeof ytdLabels)[]).map((name) => (
                  <Field key={name} data-invalid={Boolean(errors.taxYearToDate?.[name])}>
                    <FieldLabel htmlFor={`payroll-${name}`}>{ytdLabels[name]}</FieldLabel>
                    <Input
                      id={`payroll-${name}`}
                      type='number'
                      min={0}
                      {...register(`taxYearToDate.${name}`, { valueAsNumber: true })}
                      className='h-9 rounded-xl bg-background text-xs'
                      aria-invalid={Boolean(errors.taxYearToDate?.[name])}
                    />
                    <FieldError errors={[errors.taxYearToDate?.[name]]} />
                  </Field>
                ))}
                {(['verified', 'isFinalTaxPeriod'] as const).map((name) => (
                  <Field key={name} orientation='horizontal'>
                    <Controller
                      control={control}
                      name={`taxYearToDate.${name}`}
                      render={({ field }) => (
                        <Checkbox
                          id={`payroll-${name}`}
                          checked={field.value}
                          onCheckedChange={(value) => field.onChange(value === true)}
                        />
                      )}
                    />
                    <FieldLabel htmlFor={`payroll-${name}`}>
                      {name === 'verified'
                        ? m.payroll_revision_verified()
                        : m.payroll_revision_final_period()}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldGroup>
            <Field>
              <FieldLabel htmlFor='payroll-override-note'>{m.payroll_revision_reason()}</FieldLabel>
              <Textarea id='payroll-override-note' {...register('note')} />
            </Field>
            <Alert variant='info' className='items-start'>
              <AlertIcon><IconCalculator /></AlertIcon>
              <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                <AlertTitle>{m.payroll_run_detail_net_pay()}</AlertTitle>
                  <span className='font-semibold'>{formatIDR(currentDetail.netTakeHomePay)}</span>
                </div>
                <AlertDescription>{m.payroll_revision_inputs_description()}</AlertDescription>
              </div>
            </Alert>
          </div>
          <DialogFooter className='shrink-0 flex-wrap gap-2 pt-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 rounded-xl text-xs sm:mr-auto'
              onClick={() => onSave(null)}
            >
              {m.payroll_revision_reset()}
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 rounded-xl text-xs'
              onClick={onClose}
            >
              {m.payroll_wizard_cancel()}
            </Button>
            <Button type='submit' size='sm' className='h-9 rounded-xl text-xs'>
              {m.payroll_run_detail_apply_adjustment()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
