import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { FieldGroup } from '@/shared/components/ui/field'
import {
  employeeCreateValues,
  emptyEducation,
  toValueOptions,
  type EmployeeCreateFormValues,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import {
  EmployeeFileField,
  EmployeeSelectField,
  EmployeeTextField,
} from '@/features/employment/employee-profile/components/employee-create-form-fields'
import {
  CollectionCard,
  CollectionItem,
} from '@/features/employment/employee-profile/components/employee-create-form-ui'
import { m } from '@/i18n/paraglide/messages'

export function EmployeeCreateEducationStep() {
  const { control } = useFormContext<EmployeeCreateFormValues>()
  const educations = useFieldArray({ control, name: 'educations' })
  const educationValues = useWatch({ control, name: 'educations' })
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
              <EmployeeFileField
                name={`educations.${index}.certificateFileId`}
                label={m.employee_information_create_certificate_file_label()}
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
    </div>
  )
}
