import { useId } from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { cn } from '@/shared/lib/utils'
import type { PayrollComponentParameters } from '@/features/payroll/types'
import { m } from '@/i18n/paraglide/messages'

interface PayrollComponentParametersFieldsProps {
  value: PayrollComponentParameters
  onChange: (value: PayrollComponentParameters) => void
  error?: string
  compact?: boolean
}

export function PayrollComponentParametersFields({
  value,
  onChange,
  error,
  compact = false,
}: PayrollComponentParametersFieldsProps) {
  const id = useId()
  const effects = [
    { value: 'add', label: m.payroll_revision_effect_add() },
    { value: 'subtract', label: m.payroll_revision_effect_subtract() },
    { value: 'none', label: m.payroll_revision_effect_none() },
  ] as const
  return (
    <FieldGroup className={cn('grid gap-4', !compact && 'lg:grid-cols-3')}>
      {(['thpEffect', 'taxGrossEffect'] as const).map((name) => (
        <Field key={name} data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={`${id}-${name}`}>
            {name === 'thpEffect'
              ? m.payroll_revision_cash_effect()
              : m.payroll_revision_tax_effect()}
          </FieldLabel>
          <ToggleGroup
            id={`${id}-${name}`}
            type='single'
            variant='outline'
            value={value[name]}
            onValueChange={(effect) => {
              if (effects.some((item) => item.value === effect))
                onChange({ ...value, [name]: effect })
            }}
            aria-invalid={Boolean(error)}
            className='w-full flex-wrap'
          >
            {effects.map((effect) => (
              <ToggleGroupItem key={effect.value} value={effect.value}>
                {effect.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      ))}
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={`${id}-tax`}>{m.payroll_revision_tax_treatment()}</FieldLabel>
        <Select
          value={value.taxTreatment}
          onValueChange={(taxTreatment: PayrollComponentParameters['taxTreatment']) =>
            onChange({ ...value, taxTreatment })
          }
        >
          <SelectTrigger id={`${id}-tax`} className='w-full' aria-invalid={Boolean(error)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='regular'>{m.payroll_revision_tax_regular()}</SelectItem>
              <SelectItem value='final'>{m.payroll_revision_tax_final()}</SelectItem>
              <SelectItem value='non_taxable'>{m.payroll_revision_tax_non_taxable()}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError>{error}</FieldError>
      </Field>
      <FieldDescription className={cn(!compact && 'lg:col-span-3')}>
        {m.payroll_revision_parameters_hint()}
      </FieldDescription>
    </FieldGroup>
  )
}
