import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { FieldGroup } from '@/shared/components/ui/field'
import {
  employeeCreateValues,
  emptyDocument,
  emptyEducation,
  getDummyEmployeeCreateOptions,
  toSelectOptions,
  toValueOptions,
  type EmployeeCreateFormValues,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import {
  EmployeeDateField,
  EmployeeFileField,
  EmployeeSelectField,
  EmployeeTextField,
} from '@/features/employment/employee-profile/components/employee-create-form-fields'
import {
  CollectionCard,
  CollectionItem,
} from '@/features/employment/employee-profile/components/employee-create-form-ui'
import { m } from '@/i18n/paraglide/messages'

export function EmployeeCreateEducationDocumentsStep() {
  const { control } = useFormContext<EmployeeCreateFormValues>()
  const educations = useFieldArray({ control, name: 'educations' })
  const documents = useFieldArray({ control, name: 'documents' })
  const educationValues = useWatch({ control, name: 'educations' })
  const documentValues = useWatch({ control, name: 'documents' })
  const notProvided = m.employee_information_create_not_provided()

  return (
    <div className='grid grid-cols-1 items-start gap-5'>
      <CollectionCard
        title={m.employee_information_create_education_title()}
        description={m.employee_information_create_education_description()}
        addLabel={m.employee_information_create_add_education()}
        count={educations.fields.length}
        onAdd={() => educations.append(emptyEducation())}
      >
        {educations.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={m.employee_information_create_education_item({ number: index + 1 })}
            description={educationValues[index]?.institutionName || notProvided}
            removeLabel={m.employee_information_create_remove_item()}
            onRemove={educations.fields.length > 1 ? () => educations.remove(index) : undefined}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2'>
              <EmployeeSelectField
                name={`educations.${index}.certificateFileId`}
                label={m.employee_information_create_certificate_file_label()}
                options={toSelectOptions(getDummyEmployeeCreateOptions().files)}
              />
              <EmployeeSelectField
                name={`educations.${index}.educationLevel`}
                label={m.employee_information_create_education_level_label()}
                options={toValueOptions(employeeCreateValues.educationLevels)}
              />
              <EmployeeTextField
                name={`educations.${index}.institutionName`}
                label={m.employee_information_create_institution_label()}
              />
              <EmployeeTextField
                name={`educations.${index}.major`}
                label={m.employee_information_create_major_label()}
              />
              <EmployeeTextField
                name={`educations.${index}.gpa`}
                label={m.employee_information_create_gpa_label()}
                type='number'
              />
              <EmployeeTextField
                name={`educations.${index}.graduationYear`}
                label={m.employee_information_create_graduation_year_label()}
                type='number'
              />
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>

      <CollectionCard
        title={m.employee_information_create_document_title()}
        description={m.employee_information_create_document_description()}
        addLabel={m.employee_information_create_add_document()}
        count={documents.fields.length}
        onAdd={() => documents.append(emptyDocument())}
      >
        {documents.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={m.employee_information_create_document_item({ number: index + 1 })}
            description={documentValues[index]?.documentNumber || notProvided}
            removeLabel={m.employee_information_create_remove_item()}
            onRemove={documents.fields.length > 1 ? () => documents.remove(index) : undefined}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2'>
              <EmployeeFileField
                name={`documents.${index}.documentFileId`}
                label={m.employee_information_create_document_file_label()}
              />
              <EmployeeSelectField
                name={`documents.${index}.documentTypeId`}
                label={m.employee_information_create_document_type_label()}
                options={toSelectOptions(getDummyEmployeeCreateOptions().documentTypes)}
              />
              <EmployeeTextField
                name={`documents.${index}.documentNumber`}
                label={m.employee_information_create_document_number_label()}
              />
              <EmployeeSelectField
                name={`documents.${index}.verificationStatus`}
                label={m.employee_information_create_verification_status_label()}
                options={toValueOptions(employeeCreateValues.verificationStatuses)}
              />
              <EmployeeDateField
                name={`documents.${index}.issuedDate`}
                label={m.employee_information_create_issued_date_label()}
              />
              <EmployeeDateField
                name={`documents.${index}.expiryDate`}
                label={m.employee_information_create_expiry_date_label()}
              />
              <EmployeeDateField
                name={`documents.${index}.verifiedAt`}
                label={m.employee_information_create_verified_at_label()}
              />
              <EmployeeSelectField
                name={`documents.${index}.verifiedBy`}
                label={m.employee_information_create_verified_by_label()}
                options={[
                  {
                    label: m.employee_information_create_review_employee(),
                    value: 'employee-current',
                  },
                ]}
              />
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>
    </div>
  )
}
