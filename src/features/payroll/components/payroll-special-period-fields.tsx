import dayjs from 'dayjs'
import { IconInfoCircle } from '@tabler/icons-react'
import { useId } from 'react'

import { Alert, AlertDescription, AlertIcon } from '@/shared/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import type { PayrollSpecialPeriodConfig } from '@/features/payroll/types'
import { m } from '@/i18n/paraglide/messages'

interface PayrollSpecialPeriodFieldsProps {
  kind: 'thr' | 'uuck'
  value: PayrollSpecialPeriodConfig
  onChange: (value: PayrollSpecialPeriodConfig) => void
  invalid?: boolean
}

export function PayrollSpecialPeriodFields({
  kind,
  value,
  onChange,
  invalid,
}: PayrollSpecialPeriodFieldsProps) {
  const id = useId()
  const isThr = kind === 'thr'
  const update = (key: keyof PayrollSpecialPeriodConfig, next: string | boolean) =>
    onChange({ ...value, [key]: next })
  const dateFields = [
    ...(isThr ? [{ key: 'holidayDate' as const, label: m.payroll_revision_holiday_date() }] : []),
    { key: 'startDate' as const, label: m.payroll_revision_reference_start() },
    { key: 'endDate' as const, label: m.payroll_revision_reference_end() },
    { key: 'paymentDate' as const, label: m.payroll_wizard_payment_date() },
  ]
  return (
    <Card>
      <CardHeader className='flex-row items-start justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <CardTitle>
            <FieldLabel htmlFor={`${id}-enabled`}>
              {isThr ? m.payroll_revision_thr_period() : m.payroll_revision_uuck_period()}
            </FieldLabel>
          </CardTitle>
          <CardDescription>
            {isThr ? m.payroll_revision_thr_hint() : m.payroll_revision_uuck_hint()}
          </CardDescription>
        </div>
        <Switch
          id={`${id}-enabled`}
          checked={value.enabled}
          onCheckedChange={(enabled) => update('enabled', enabled)}
        />
      </CardHeader>
      {value.enabled && (
        <CardContent className='flex flex-col gap-4'>
          <FieldGroup className='grid gap-4 sm:grid-cols-2'>
            {isThr && (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={`${id}-holiday`}>{m.payroll_revision_holiday()}</FieldLabel>
                <Input
                  id={`${id}-holiday`}
                  value={value.holidayName ?? ''}
                  onChange={(event) => update('holidayName', event.target.value)}
                  aria-invalid={invalid}
                />
              </Field>
            )}
            {dateFields.map(({ key, label }) => (
              <Field key={key} data-invalid={invalid}>
                <FieldLabel htmlFor={`${id}-${key}`}>{label}</FieldLabel>
                <DatePicker
                  id={`${id}-${key}`}
                  className='w-full'
                  mode='single'
                  placeholder={label}
                  selected={value[key] ? dayjs(value[key]).toDate() : undefined}
                  aria-invalid={invalid}
                  onSelect={(date) => {
                    const next = date ? dayjs(date).format('YYYY-MM-DD') : ''
                    if (key === 'holidayDate' && next) {
                      const reference = dayjs(next).subtract(7, 'day').format('YYYY-MM-DD')
                      onChange({
                        ...value,
                        holidayDate: next,
                        startDate: value.startDate || reference,
                        endDate: value.endDate || reference,
                      })
                    } else update(key, next)
                  }}
                />
              </Field>
            ))}
            {!isThr && (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={`${id}-time`}>{m.payroll_revision_transfer_time()}</FieldLabel>
                <Input
                  id={`${id}-time`}
                  type='time'
                  value={value.paymentTime ?? ''}
                  onChange={(event) => update('paymentTime', event.target.value)}
                  aria-invalid={invalid}
                />
              </Field>
            )}
          </FieldGroup>
          <FieldError>{invalid ? m.payroll_revision_period_invalid() : undefined}</FieldError>
          <Alert variant='info' className='items-start'>
            <AlertIcon><IconInfoCircle /></AlertIcon>
            <AlertDescription className='min-w-0 flex-1'>{m.payroll_revision_special_pending()}</AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  )
}
