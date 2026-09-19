import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import {
  employeeCreateValues,
  emptyContact,
  toValueOptions,
  type EmployeeCreateFormValues,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import {
  EmployeeBooleanField,
  EmployeeDateField,
  EmployeeSelectField,
  EmployeeTextareaField,
  EmployeeTextField,
} from '@/features/employment/employee-profile/components/employee-create-form-fields'
import {
  CollectionCard,
  CollectionItem,
} from '@/features/employment/employee-profile/components/employee-create-form-ui'
import { m } from '@/i18n/paraglide/messages'
import { FieldGroup } from '@/shared/components/ui/field'

export function EmployeeCreateContactsStep() {
  const { control } = useFormContext<EmployeeCreateFormValues>()
  const contacts = useFieldArray({ control, name: 'contacts' })
  const contactValues = useWatch({ control, name: 'contacts' })

  return (
    <CollectionCard
      title={m.employee_information_create_contact_title()}
      description={m.employee_information_create_contact_description()}
      addLabel={m.employee_information_create_add_contact()}
      count={contacts.fields.length}
      onAdd={() => contacts.append(emptyContact())}
    >
      {contacts.fields.map((item, index) => (
        <CollectionItem
          key={item.id}
          number={index + 1}
          title={m.employee_information_create_contact_item({ number: index + 1 })}
          description={
            contactValues[index]?.fullName || m.employee_information_create_not_provided()
          }
          removeLabel={m.employee_information_create_remove_item()}
          onRemove={contacts.fields.length > 1 ? () => contacts.remove(index) : undefined}
        >
          <FieldGroup className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            <EmployeeTextField
              name={`contacts.${index}.fullName`}
              label={m.employee_information_create_full_name_label()}
              required
            />
            <EmployeeSelectField
              name={`contacts.${index}.contactType`}
              label={m.employee_information_create_contact_type_label()}
              options={toValueOptions(employeeCreateValues.contactTypes)}
            />
            <EmployeeTextField
              name={`contacts.${index}.phone`}
              label={m.employee_information_create_phone_label()}
            />
            <EmployeeTextField
              name={`contacts.${index}.email`}
              label={m.employee_information_create_email_label_optional()}
              type='email'
            />
            <EmployeeTextField
              name={`contacts.${index}.ktpNumber`}
              label={m.employee_information_create_ktp_label()}
            />
            <EmployeeTextField
              name={`contacts.${index}.occupation`}
              label={m.employee_information_create_occupation_label()}
            />
            <EmployeeDateField
              name={`contacts.${index}.birthDate`}
              label={m.employee_information_create_birth_date_label()}
            />
            <EmployeeDateField
              name={`contacts.${index}.startDate`}
              label={m.employee_information_create_start_date_label()}
              required
            />
            <EmployeeDateField
              name={`contacts.${index}.effectiveEndDate`}
              label={m.employee_information_create_effective_end_label()}
            />
            <EmployeeTextareaField
              className='md:col-span-2 xl:col-span-3'
              name={`contacts.${index}.address`}
              label={m.employee_information_create_address_label()}
            />
            <EmployeeBooleanField
              name={`contacts.${index}.isDependent`}
              label={m.employee_information_create_dependent_label()}
            />
            <EmployeeBooleanField
              name={`contacts.${index}.isEmergency`}
              label={m.employee_information_create_emergency_label()}
            />
          </FieldGroup>
        </CollectionItem>
      ))}
    </CollectionCard>
  )
}
