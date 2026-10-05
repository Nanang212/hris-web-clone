import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { FieldGroup } from '@/shared/components/ui/field'
import {
  emptyBankAccount,
  emptyBpjs,
  emptyPayrollComponent,
  toSelectOptions,
  type EmployeeCreateFormValues,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import {
  EmployeeBooleanField,
  EmployeeDateField,
  EmployeeFileField,
  EmployeeSelectField,
  EmployeeTextField,
} from '@/features/employment/employee-profile/components/employee-create-form-fields'
import {
  CollectionCard,
  CollectionItem,
} from '@/features/employment/employee-profile/components/employee-create-form-ui'
import type { EmployeeCreationOptionsData } from '@/features/employment/employee-profile/types'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeCreateBankPayrollStepProps {
  options: EmployeeCreationOptionsData
}

export function EmployeeCreateBankPayrollStep({ options }: EmployeeCreateBankPayrollStepProps) {
  const { control } = useFormContext<EmployeeCreateFormValues>()
  const bankAccounts = useFieldArray({ control, name: 'bankAccounts' })
  const bpjs = useFieldArray({ control, name: 'bpjs' })
  const payrollComponents = useFieldArray({ control, name: 'payrollComponents' })
  const bankAccountValues = useWatch({ control, name: 'bankAccounts' })
  const bpjsValues = useWatch({ control, name: 'bpjs' })
  const payrollComponentValues = useWatch({ control, name: 'payrollComponents' })
  const payrollComponentOptions = (options.payrollComponents ?? []).filter(
    (component) => component.calculationMethod !== 'SYSTEM' || component.code === 'BASIC_SALARY',
  )

  return (
    <div className='grid items-start gap-5'>
      <CollectionCard
        title={m.employee_information_create_bank_accounts_title()}
        description={m.employee_information_create_bank_accounts_description()}
        addLabel={m.employee_information_create_add_bank_account()}
        count={bankAccounts.fields.length}
        onAdd={() => bankAccounts.append(emptyBankAccount())}
      >
        {bankAccounts.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={m.employee_information_create_bank_account_item({ number: index + 1 })}
            description={
              bankAccountValues[index]?.accountNumber ||
              m.employee_information_create_not_provided()
            }
            removeLabel={m.employee_information_create_remove_item()}
            onRemove={bankAccounts.fields.length > 1 ? () => bankAccounts.remove(index) : undefined}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2'>
              <EmployeeSelectField
                name={`bankAccounts.${index}.bankId`}
                label={m.employee_information_create_bank_label()}
                options={toSelectOptions(options.banks)}
                required
              />
              <EmployeeTextField
                name={`bankAccounts.${index}.accountNumber`}
                label={m.employee_information_create_bank_account_label()}
                required
              />
              <EmployeeTextField
                name={`bankAccounts.${index}.accountHolderName`}
                label={m.employee_information_create_bank_holder_label()}
                required
              />
              <EmployeeDateField
                name={`bankAccounts.${index}.effectiveStartDate`}
                label={m.employee_information_create_effective_start_label()}
                required
              />
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>

      <CollectionCard
        title={m.employee_information_create_bpjs_title()}
        description={m.employee_information_create_bpjs_description()}
        addLabel={m.employee_information_create_add_bpjs()}
        count={bpjs.fields.length}
        onAdd={() => bpjs.append(emptyBpjs('KESEHATAN'))}
      >
        {bpjs.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={
              bpjsValues[index]?.program === 'KETENAGAKERJAAN'
                ? m.employee_information_create_bpjs_employment_label()
                : m.employee_information_create_bpjs_health_label()
            }
            description={
              bpjsValues[index]?.participantNumber || m.employee_information_create_not_provided()
            }
            removeLabel={m.employee_information_create_remove_item()}
            onRemove={bpjs.fields.length > 1 ? () => bpjs.remove(index) : undefined}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2'>
              <EmployeeSelectField
                name={`bpjs.${index}.program`}
                label={m.employee_information_create_bpjs_program_label()}
                options={[
                  {
                    value: 'KESEHATAN',
                    label: m.employee_information_create_bpjs_health_label(),
                  },
                  {
                    value: 'KETENAGAKERJAAN',
                    label: m.employee_information_create_bpjs_employment_label(),
                  },
                ]}
                required
              />
              <EmployeeTextField
                name={`bpjs.${index}.participantNumber`}
                label={m.employee_information_create_bpjs_participant_number_label()}
                required
              />
              <EmployeeTextField
                name={`bpjs.${index}.facilityName`}
                label={m.employee_information_create_bpjs_facility_label()}
              />
              <EmployeeTextField
                name={`bpjs.${index}.membershipClass`}
                label={m.employee_information_create_bpjs_membership_class_label()}
              />
              <EmployeeDateField
                name={`bpjs.${index}.effectiveStartDate`}
                label={m.employee_information_create_effective_start_label()}
                required
              />
              <EmployeeDateField
                name={`bpjs.${index}.effectiveEndDate`}
                label={m.employee_information_create_effective_end_label()}
              />
              <div className='md:col-span-2'>
                <EmployeeFileField
                  name={`bpjs.${index}.documentFileId`}
                  label={m.employee_information_create_bpjs_document_label()}
                />
              </div>
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>

      <CollectionCard
        title={m.employee_information_create_payroll_components_title()}
        description={m.employee_information_create_payroll_components_description()}
        addLabel={m.employee_information_create_add_payroll_component()}
        count={payrollComponents.fields.length}
        onAdd={() => payrollComponents.append(emptyPayrollComponent())}
      >
        {payrollComponents.fields.map((item, index) => {
          const selectedComponent = options.payrollComponents?.find(
            (component) => component.id === payrollComponentValues[index]?.componentId,
          )
          const calculationMethod = selectedComponent?.calculationMethod
          const showAmount =
            calculationMethod === 'MANUAL' ||
            (calculationMethod === 'SYSTEM' && selectedComponent?.code === 'BASIC_SALARY')

          return (
            <CollectionItem
              key={item.id}
              number={index + 1}
              title={m.employee_information_create_payroll_component_item({ number: index + 1 })}
              description={selectedComponent?.name ?? m.employee_information_create_not_provided()}
              removeLabel={m.employee_information_create_remove_item()}
              onRemove={() => payrollComponents.remove(index)}
            >
              <FieldGroup className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
                <EmployeeSelectField
                  name={`payrollComponents.${index}.componentId`}
                  label={m.employee_information_create_payroll_component_label()}
                  options={toSelectOptions(payrollComponentOptions)}
                  required
                />
                <EmployeeDateField
                  name={`payrollComponents.${index}.effectiveStartDate`}
                  label={m.employee_information_create_effective_start_label()}
                  required
                />
                <EmployeeDateField
                  name={`payrollComponents.${index}.effectiveEndDate`}
                  label={m.employee_information_create_effective_end_label()}
                />
                {showAmount && (
                  <EmployeeTextField
                    name={`payrollComponents.${index}.amount`}
                    label={m.employee_information_create_payroll_amount_label()}
                    type='number'
                  />
                )}
                {calculationMethod === 'PERCENTAGE' && (
                  <EmployeeTextField
                    name={`payrollComponents.${index}.percentage`}
                    label={m.employee_information_create_payroll_percentage_label()}
                    type='number'
                  />
                )}
                {calculationMethod === 'FORMULA' && (
                  <EmployeeTextField
                    name={`payrollComponents.${index}.customFormulaExpression`}
                    label={m.employee_information_create_payroll_formula_label()}
                  />
                )}
                <EmployeeTextField
                  name={`payrollComponents.${index}.notes`}
                  label={m.employee_information_create_notes_label()}
                />
              </FieldGroup>
            </CollectionItem>
          )
        })}
      </CollectionCard>

      <Card>
        <CardHeader>
          <CardTitle>{m.employee_information_create_tax_profile_title()}</CardTitle>
          <CardDescription>
            {m.employee_information_create_tax_profile_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className='grid gap-5 md:grid-cols-2'>
            <EmployeeSelectField
              name='taxProfile.ptkpStatus'
              label={m.employee_information_create_ptkp_status_label()}
              required
              options={toSelectOptions([
                { id: 'TK/0', name: 'TK/0' },
                { id: 'TK/1', name: 'TK/1' },
                { id: 'TK/2', name: 'TK/2' },
                { id: 'TK/3', name: 'TK/3' },
                { id: 'K/0', name: 'K/0' },
                { id: 'K/1', name: 'K/1' },
                { id: 'K/2', name: 'K/2' },
                { id: 'K/3', name: 'K/3' },
                { id: 'K/I/1', name: 'K/I/1' },
                { id: 'K/I/2', name: 'K/I/2' },
                { id: 'K/I/3', name: 'K/I/3' },
              ])}
            />
            <EmployeeDateField
              name='taxProfile.effectiveStartDate'
              label={m.employee_information_create_effective_start_label()}
              required
            />
            <EmployeeTextField
              name='taxProfile.npwpNumber'
              label={m.employee_information_create_npwp_label()}
            />
            <div className='grid gap-5 md:col-span-2 md:grid-cols-2'>
              <EmployeeBooleanField
                name='taxProfile.isDtpEligible'
                label={m.employee_information_create_dtp_eligible_label()}
              />
              <EmployeeBooleanField
                name='taxProfile.isKtpUsedAsNpwp'
                label={m.employee_information_create_use_ktp_as_npwp_label()}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
