import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { useSchema } from '@/shared/lib/schema'
import { PayrollComponentParametersFields } from '@/features/payroll/components/payroll-component-parameters-fields'
import {
  resolveComponentParameters,
  validateComponentParameters,
} from '@/features/payroll/lib/payroll-component-parameters'
import type { SalaryComponent } from '@/features/payroll/types'
import { m } from '@/i18n/paraglide/messages'

interface SalaryComponentEditModalProps {
  component: SalaryComponent | null
  components: SalaryComponent[]
  onClose: () => void
  onSave: (component: SalaryComponent) => void
}

export function SalaryComponentEditModal({
  component,
  components,
  onClose,
  onSave,
}: SalaryComponentEditModalProps) {
  const schema = useSchema(() => ({
    name: z.string().trim().min(1, m.payroll_employee_components_name_required()),
    code: z
      .string()
      .trim()
      .min(1, m.payroll_employee_components_code_required())
      .refine(
        (value) =>
          !components.some(
            (item) =>
              item.id !== component?.id &&
              item.code.toUpperCase() === value.toUpperCase().replace(/\s+/g, '_'),
          ),
        m.payroll_employee_components_import_duplicate(),
      ),
    type: z.enum(['allowance', 'deduction']),
    category: z.enum(['fixed', 'variable', 'tax', 'statutory']),
    calculationType: z.enum(['fixed_amount', 'percentage', 'formula', 'attendance_based']),
    defaultAmount: z.number().finite().min(0, m.payroll_revision_numeric_invalid()),
    description: z.string(),
    isBpjsBase: z.boolean(),
    status: z.enum(['active', 'inactive']),
    parameters: z
      .object({
        thpEffect: z.enum(['add', 'subtract', 'none']),
        taxGrossEffect: z.enum(['add', 'subtract', 'none']),
        taxTreatment: z.enum(['regular', 'final', 'non_taxable']),
      })
      .refine(validateComponentParameters, m.payroll_revision_invalid_parameters()),
  }))
  type Values = z.infer<typeof schema>
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      type: 'allowance',
      category: 'fixed',
      calculationType: 'fixed_amount',
      defaultAmount: 0,
      description: '',
      isBpjsBase: false,
      status: 'active',
      ...component,
      parameters:
        component?.parameters ??
        resolveComponentParameters(component ?? { type: 'allowance', isTaxable: true }),
    },
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>
            {component ? m.payroll_salary_edit_title() : m.payroll_salary_add_title()}
          </DialogTitle>
          <DialogDescription>{m.payroll_salary_form_description()}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) =>
            onSave({
              ...component,
              ...values,
              code: values.code.toUpperCase().replace(/\s+/g, '_'),
              id: component?.id ?? crypto.randomUUID(),
              isTaxable:
                values.parameters.taxTreatment === 'regular' &&
                values.parameters.taxGrossEffect === 'add',
            }),
          )}
          noValidate
        >
          <FieldGroup>
            <FieldGroup className='grid gap-4 sm:grid-cols-2'>
              {(['name', 'code', 'defaultAmount', 'description'] as const).map((name) => (
                <Field key={name} data-invalid={Boolean(errors[name])}>
                  <FieldLabel htmlFor={`salary-component-${name}`}>
                    {
                      {
                        name: m.payroll_salary_name_required_label(),
                        code: m.payroll_salary_code_required_label(),
                        defaultAmount: m.payroll_salary_default_amount_label(),
                        description: m.payroll_salary_description_label(),
                      }[name]
                    }
                  </FieldLabel>
                  <Input
                    id={`salary-component-${name}`}
                    type={name === 'defaultAmount' ? 'number' : 'text'}
                    {...register(name, name === 'defaultAmount' ? { valueAsNumber: true } : {})}
                    aria-invalid={Boolean(errors[name])}
                  />
                  <FieldError errors={[errors[name]]} />
                </Field>
              ))}
              <Field>
                <FieldLabel htmlFor='salary-component-type'>
                  {m.payroll_employee_components_kind_field_label()}
                </FieldLabel>
                <Controller
                  control={control}
                  name='type'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='salary-component-type' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='allowance'>
                            {m.payroll_employee_components_type_allowance()}
                          </SelectItem>
                          <SelectItem value='deduction'>
                            {m.payroll_employee_components_type_deduction()}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor='salary-component-calculation'>
                  {m.payroll_salary_calculation_type_label()}
                </FieldLabel>
                <Controller
                  control={control}
                  name='calculationType'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='salary-component-calculation' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='fixed_amount'>
                            {m.payroll_salary_calculation_fixed()}
                          </SelectItem>
                          <SelectItem value='attendance_based'>
                            {m.payroll_salary_calculation_attendance()}
                          </SelectItem>
                          <SelectItem value='formula'>
                            {m.payroll_salary_calculation_formula()}
                          </SelectItem>
                          <SelectItem value='percentage'>
                            {m.payroll_salary_calculation_percentage()}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </FieldGroup>
            <Controller
              control={control}
              name='parameters'
              render={({ field }) => (
                <PayrollComponentParametersFields
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.parameters?.message}
                />
              )}
            />
            <Field orientation='horizontal'>
              <Controller
                control={control}
                name='isBpjsBase'
                render={({ field }) => (
                  <Checkbox
                    id='salary-component-bpjs'
                    checked={field.value}
                    onCheckedChange={(value) => field.onChange(value === true)}
                  />
                )}
              />
              <FieldLabel htmlFor='salary-component-bpjs'>
                {m.payroll_salary_bpjs_wage_base()}
              </FieldLabel>
            </Field>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                {m.payroll_wizard_cancel()}
              </Button>
              <Button type='submit'>{m.payroll_employee_components_save_button()}</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
