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
        title='Bank Accounts'
        description='Tambahkan rekening yang digunakan untuk payroll karyawan.'
        addLabel='Tambah rekening'
        count={bankAccounts.fields.length}
        onAdd={() => bankAccounts.append(emptyBankAccount())}
      >
        {bankAccounts.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={`Rekening ${index + 1}`}
            description={bankAccountValues[index]?.accountNumber || 'Belum diisi'}
            removeLabel='Hapus'
            onRemove={bankAccounts.fields.length > 1 ? () => bankAccounts.remove(index) : undefined}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2'>
              <EmployeeSelectField
                name={`bankAccounts.${index}.bankId`}
                label='Bank'
                options={toSelectOptions(options.banks)}
                required
              />
              <EmployeeTextField
                name={`bankAccounts.${index}.accountNumber`}
                label='Nomor rekening'
                required
              />
              <EmployeeTextField
                name={`bankAccounts.${index}.accountHolderName`}
                label='Nama pemilik rekening'
                required
              />
              <EmployeeDateField
                name={`bankAccounts.${index}.effectiveStartDate`}
                label='Mulai berlaku'
                required
              />
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>

      <CollectionCard
        title='BPJS'
        description='Lengkapi kepesertaan BPJS dan dokumen pendukungnya.'
        addLabel='Tambah kepesertaan BPJS'
        count={bpjs.fields.length}
        onAdd={() => bpjs.append(emptyBpjs('KESEHATAN'))}
      >
        {bpjs.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={
              bpjsValues[index]?.program === 'KETENAGAKERJAAN'
                ? 'BPJS Ketenagakerjaan'
                : 'BPJS Kesehatan'
            }
            description={bpjsValues[index]?.participantNumber || 'Belum diisi'}
            removeLabel='Hapus'
            onRemove={bpjs.fields.length > 1 ? () => bpjs.remove(index) : undefined}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2'>
              <EmployeeSelectField
                name={`bpjs.${index}.program`}
                label='Program'
                options={[
                  { value: 'KESEHATAN', label: 'BPJS Kesehatan' },
                  { value: 'KETENAGAKERJAAN', label: 'BPJS Ketenagakerjaan' },
                ]}
                required
              />
              <EmployeeTextField
                name={`bpjs.${index}.participantNumber`}
                label='Nomor peserta'
                required
              />
              <EmployeeTextField name={`bpjs.${index}.facilityName`} label='Nama fasilitas' />
              <EmployeeTextField name={`bpjs.${index}.membershipClass`} label='Kelas kepesertaan' />
              <EmployeeDateField
                name={`bpjs.${index}.effectiveStartDate`}
                label='Mulai berlaku'
                required
              />
              <EmployeeDateField name={`bpjs.${index}.effectiveEndDate`} label='Berakhir berlaku' />
              <div className='md:col-span-2'>
                <EmployeeFileField name={`bpjs.${index}.documentFileId`} label='Dokumen BPJS' />
              </div>
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>

      <CollectionCard
        title='Payroll components'
        description='Assign recurring payroll components for this employee.'
        addLabel='Add payroll component'
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
              title={`Payroll component ${index + 1}`}
              description={selectedComponent?.name ?? 'Belum diisi'}
              removeLabel='Hapus'
              onRemove={() => payrollComponents.remove(index)}
            >
              <FieldGroup className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
                <EmployeeSelectField
                  name={`payrollComponents.${index}.componentId`}
                  label='Component'
                  options={toSelectOptions(payrollComponentOptions)}
                  required
                />
                <EmployeeDateField
                  name={`payrollComponents.${index}.effectiveStartDate`}
                  label='Mulai berlaku'
                  required
                />
                <EmployeeDateField
                  name={`payrollComponents.${index}.effectiveEndDate`}
                  label='Berakhir berlaku'
                />
                {showAmount && (
                  <EmployeeTextField
                    name={`payrollComponents.${index}.amount`}
                    label='Amount'
                    type='number'
                  />
                )}
                {calculationMethod === 'PERCENTAGE' && (
                  <EmployeeTextField
                    name={`payrollComponents.${index}.percentage`}
                    label='Percentage'
                    type='number'
                  />
                )}
                {calculationMethod === 'FORMULA' && (
                  <EmployeeTextField
                    name={`payrollComponents.${index}.customFormulaExpression`}
                    label='Formula'
                  />
                )}
                <EmployeeTextField name={`payrollComponents.${index}.notes`} label='Notes' />
              </FieldGroup>
            </CollectionItem>
          )
        })}
      </CollectionCard>

      <Card>
        <CardHeader>
          <CardTitle>Tax profile</CardTitle>
          <CardDescription>Informasi pajak dan status PTKP karyawan.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className='grid gap-5 md:grid-cols-2'>
            <EmployeeSelectField
              name='taxProfile.ptkpStatus'
              label='PTKP status'
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
              label='Effective start date'
              required
            />
            <EmployeeTextField name='taxProfile.npwpNumber' label='NPWP number' />
            <div className='grid gap-5 md:col-span-2 md:grid-cols-2'>
              <EmployeeBooleanField name='taxProfile.isDtpEligible' label='DTP eligible' />
              <EmployeeBooleanField name='taxProfile.isKtpUsedAsNpwp' label='Use KTP as NPWP' />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
