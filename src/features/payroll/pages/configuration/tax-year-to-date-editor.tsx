import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { z } from 'zod'

import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'

import { initialPayrollEmployeeInputs } from '../../data/mock-payroll-inputs'
import { usePayrollTaxInputStore } from '../../store/payroll-tax-input-store'
import type { TaxYearToDateInput } from '../../types'

const emptyTaxInput: TaxYearToDateInput = {
  priorTaxableGross: 0,
  priorEmployeePensionContributions: 0,
  priorQualifiedZakat: 0,
  priorPph21Paid: 0,
  monthsWorked: 1,
  isFinalTaxPeriod: false,
  verified: false,
}

function initialTaxInput(
  employeeId: string,
  year: number,
  overrides: Record<string, TaxYearToDateInput>,
): TaxYearToDateInput {
  const saved = overrides[`${year}:${employeeId}`]
  if (saved) return saved
  if (year !== 2026) return emptyTaxInput
  const demoInput = initialPayrollEmployeeInputs.find(
    (employee) => employee.employeeId === employeeId,
  )?.taxYearToDate
  return demoInput ? { ...demoInput, verified: true } : emptyTaxInput
}

export function TaxYearToDateEditor() {
  const [employeeId, setEmployeeId] = useState(initialPayrollEmployeeInputs[0]?.employeeId ?? '')
  const [year, setYear] = useState('2026')
  const overrides = usePayrollTaxInputStore((state) => state.taxYearToDateOverrides)
  const setTaxYearToDate = usePayrollTaxInputStore((state) => state.setTaxYearToDate)
  const formSchema = useSchema((schema, messages) => ({
    priorTaxableGross: schema.coerce.number().min(0, messages.payroll_tax_ytd_amount_invalid()),
    priorEmployeePensionContributions: schema.coerce.number().min(0, messages.payroll_tax_ytd_amount_invalid()),
    priorQualifiedZakat: schema.coerce.number().min(0, messages.payroll_tax_ytd_amount_invalid()),
    priorPph21Paid: schema.coerce.number().min(0, messages.payroll_tax_ytd_amount_invalid()),
    monthsWorked: schema.coerce.number().int().min(1, messages.payroll_tax_ytd_months_invalid()).max(12, messages.payroll_tax_ytd_months_invalid()),
    isFinalTaxPeriod: schema.boolean(),
    verified: schema.boolean().refine(Boolean, messages.payroll_tax_ytd_verification_required()),
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
    defaultValues: initialTaxInput(employeeId, 2026, overrides),
  })

  useEffect(() => {
    reset(initialTaxInput(employeeId, Number(year), overrides))
  }, [employeeId, year, overrides, reset])

  const numericFields = [
    { name: 'priorTaxableGross', label: m.payroll_tax_ytd_prior_gross() },
    { name: 'priorEmployeePensionContributions', label: m.payroll_tax_ytd_prior_pension() },
    { name: 'priorQualifiedZakat', label: m.payroll_tax_ytd_prior_zakat() },
    { name: 'priorPph21Paid', label: m.payroll_tax_ytd_prior_tax() },
    { name: 'monthsWorked', label: m.payroll_tax_ytd_months_worked() },
  ] as const

  const onSubmit = (values: FormValues) => {
    const taxYear = Number(year)
    if (!employeeId || !Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) {
      snackbar.error(m.payroll_tax_ytd_year_invalid())
      return
    }
    setTaxYearToDate(taxYear, employeeId, values)
    snackbar.success(m.payroll_tax_ytd_saved())
  }

  return (
    <Card className='rounded-2xl'>
      <CardHeader>
        <CardTitle className='text-sm font-bold'>{m.payroll_tax_ytd_title()}</CardTitle>
        <CardDescription className='text-xs'>{m.payroll_tax_ytd_description()}</CardDescription>
      </CardHeader>
      <form id='payroll-tax-year-to-date-form' onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className='flex flex-col gap-5'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor='payroll-tax-ytd-employee'>{m.payroll_tax_ytd_employee()}</FieldLabel>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id='payroll-tax-ytd-employee' className='h-10 text-xs'>
                  <SelectValue />
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
            </Field>
            <Field>
              <FieldLabel htmlFor='payroll-tax-ytd-year'>{m.payroll_tax_ytd_year()}</FieldLabel>
              <Input
                id='payroll-tax-ytd-year'
                type='number'
                min={2000}
                max={2100}
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className='h-10 text-xs'
              />
            </Field>
            {numericFields.map(({ name, label }) => (
              <Field key={name} data-invalid={!!errors[name]}>
                <FieldLabel htmlFor={`payroll-tax-ytd-${name}`}>{label}</FieldLabel>
                <Input
                  id={`payroll-tax-ytd-${name}`}
                  type='number'
                  min={name === 'monthsWorked' ? 1 : 0}
                  max={name === 'monthsWorked' ? 12 : undefined}
                  className='h-10 text-xs'
                  aria-invalid={!!errors[name]}
                  {...register(name)}
                />
                <FieldError errors={errors[name] ? [errors[name]] : undefined} />
              </Field>
            ))}
            <Field className='sm:col-span-2' data-invalid={!!errors.isFinalTaxPeriod}>
              <Controller
                name='isFinalTaxPeriod'
                control={control}
                render={({ field }) => (
                  <FieldLabel className='flex items-center gap-2 text-xs'>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    {m.payroll_tax_ytd_final_period()}
                  </FieldLabel>
                )}
              />
            </Field>
            <Field className='sm:col-span-2' data-invalid={!!errors.verified}>
              <Controller
                name='verified'
                control={control}
                render={({ field }) => (
                  <FieldLabel className='flex items-center gap-2 text-xs'>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={!!errors.verified}
                    />
                    {m.payroll_tax_ytd_verified()}
                  </FieldLabel>
                )}
              />
              <FieldError errors={errors.verified ? [errors.verified] : undefined} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className='mt-5 justify-end'>
          <Button type='submit' size='sm'>{m.payroll_tax_ytd_save()}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
