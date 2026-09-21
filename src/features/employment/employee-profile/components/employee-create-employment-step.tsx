import { IconInfoCircle } from '@tabler/icons-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { FieldGroup } from '@/shared/components/ui/field'
import {
  dummyEmployeeCreateOptions,
  employeeCreateValues,
  emptyAssignment,
  emptyContract,
  emptyProject,
  toSelectOptions,
  toValueOptions,
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

interface EmployeeCreateEmploymentStepProps {
  options: EmployeeCreationOptionsData
}

export function EmployeeCreateEmploymentStep({ options }: EmployeeCreateEmploymentStepProps) {
  const { control } = useFormContext<EmployeeCreateFormValues>()
  const assignments = useFieldArray({ control, name: 'assignments' })
  const contracts = useFieldArray({ control, name: 'contracts' })
  const projects = useFieldArray({ control, name: 'projects' })
  const assignmentValues = useWatch({ control, name: 'assignments' })
  const contractValues = useWatch({ control, name: 'contracts' })
  const projectValues = useWatch({ control, name: 'projects' })
  const notProvided = m.employee_information_create_not_provided()

  return (
    <div className='space-y-5'>
      <Alert variant='sky-overlay'>
        <AlertIcon>
          <IconInfoCircle />
        </AlertIcon>
        <div>
          <AlertTitle>{m.employee_information_create_effective_dates_guide_title()}</AlertTitle>
          <AlertDescription className='mt-2 space-y-2'>
            <p>{m.employee_information_create_effective_dates_guide_description()}</p>
            <p>
              <strong>{m.employee_information_create_contract_title()}:</strong>{' '}
              {m.employee_information_create_effective_dates_contract_note()}
            </p>
            <p>
              <strong>{m.employee_information_create_assignment_title()}:</strong>{' '}
              {m.employee_information_create_effective_dates_assignment_note()}
            </p>
            <p>
              <strong>{m.employee_information_create_project_title()}:</strong>{' '}
              {m.employee_information_create_effective_dates_project_note()}
            </p>
          </AlertDescription>
        </div>
      </Alert>

      <CollectionCard
        title={m.employee_information_create_contract_title()}
        description={m.employee_information_create_contract_description()}
        addLabel={m.employee_information_create_add_contract()}
        count={contracts.fields.length}
        onAdd={() => contracts.append(emptyContract())}
      >
        {contracts.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={m.employee_information_create_contract_item({ number: index + 1 })}
            description={
              contractValues[index]?.contractNumber ||
              contractValues[index]?.contractType ||
              notProvided
            }
            removeLabel={m.employee_information_create_remove_item()}
            onRemove={contracts.fields.length > 1 ? () => contracts.remove(index) : undefined}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2'>
              <EmployeeFileField
                name={`contracts.${index}.contractFileId`}
                label={m.employee_information_create_contract_file_label()}
              />
              <EmployeeTextField
                name={`contracts.${index}.contractNumber`}
                label={m.employee_information_create_contract_number_label()}
              />
              <EmployeeSelectField
                name={`contracts.${index}.contractType`}
                label={m.employee_information_create_contract_type_label()}
                options={toValueOptions(employeeCreateValues.contractTypes)}
              />
              <EmployeeSelectField
                name={`contracts.${index}.status`}
                label={m.employee_information_create_status_label()}
                options={toValueOptions(employeeCreateValues.contractStatuses)}
              />
              <EmployeeDateField
                name={`contracts.${index}.startDate`}
                label={m.employee_information_create_start_date_label()}
                required
              />
              <EmployeeDateField
                name={`contracts.${index}.effectiveEndDate`}
                label={m.employee_information_create_effective_end_label()}
              />
              <EmployeeDateField
                name={`contracts.${index}.maxExtensionDate`}
                label={m.employee_information_create_max_extension_label()}
              />
              <EmployeeDateField
                name={`contracts.${index}.probationEffectiveEndDate`}
                label={m.employee_information_create_probation_end_label()}
              />
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>

      <CollectionCard
        title={m.employee_information_create_assignment_title()}
        description={m.employee_information_create_assignment_description()}
        addLabel={m.employee_information_create_add_assignment()}
        count={assignments.fields.length}
        onAdd={() => assignments.append(emptyAssignment())}
      >
        {assignments.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={m.employee_information_create_assignment_item({ number: index + 1 })}
            description={
              options.positions.find((option) => option.id === assignmentValues[index]?.positionId)
                ?.name ?? notProvided
            }
            removeLabel={m.employee_information_create_remove_item()}
            onRemove={assignments.fields.length > 1 ? () => assignments.remove(index) : undefined}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
              <EmployeeSelectField
                name={`assignments.${index}.departmentUnitId`}
                label={m.employee_information_create_department_label()}
                options={toSelectOptions(options.departments)}
              />
              <EmployeeSelectField
                name={`assignments.${index}.employmentType`}
                label={m.employee_information_create_employment_type_label()}
                options={toValueOptions(employeeCreateValues.employmentTypes)}
                required
              />
              <EmployeeSelectField
                name={`assignments.${index}.divisionUnitId`}
                label={m.employee_information_create_division_label()}
                options={toSelectOptions(options.divisions)}
              />
              <EmployeeSelectField
                name={`assignments.${index}.sectionUnitId`}
                label={m.employee_information_create_section_label()}
                options={toSelectOptions(options.sections ?? dummyEmployeeCreateOptions.sections)}
              />
              <EmployeeSelectField
                name={`assignments.${index}.positionId`}
                label={m.employee_information_create_position_label()}
                options={toSelectOptions(options.positions)}
              />
              <EmployeeSelectField
                name={`assignments.${index}.gradeId`}
                label={m.employee_information_create_grade_label()}
                options={toSelectOptions(options.grades)}
              />
              <EmployeeSelectField
                name={`assignments.${index}.supervisorEmployeeId`}
                label={m.employee_information_create_supervisor_label()}
                options={toSelectOptions(options.managers)}
              />
              <EmployeeDateField
                name={`assignments.${index}.effectiveStartDate`}
                label={m.employee_information_create_effective_start_label()}
                required
              />
              <EmployeeDateField
                name={`assignments.${index}.effectiveEndDate`}
                label={m.employee_information_create_effective_end_label()}
              />
              <EmployeeTextField
                name={`assignments.${index}.workLocation`}
                label={m.employee_information_create_work_location_label()}
              />
              <EmployeeTextField
                name={`assignments.${index}.changeReason`}
                label={m.employee_information_create_change_reason_label()}
              />
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>

      <CollectionCard
        title={m.employee_information_create_project_title()}
        description={m.employee_information_create_project_description()}
        addLabel={m.employee_information_create_add_project()}
        count={projects.fields.length}
        onAdd={() => projects.append(emptyProject())}
      >
        {projects.fields.map((item, index) => (
          <CollectionItem
            key={item.id}
            number={index + 1}
            title={m.employee_information_create_project_item({ number: index + 1 })}
            description={projectValues[index]?.roleInProject || notProvided}
            removeLabel={m.employee_information_create_remove_item()}
            onRemove={() => projects.remove(index)}
          >
            <FieldGroup className='grid gap-5 md:grid-cols-2'>
              <EmployeeSelectField
                name={`projects.${index}.projectId`}
                label={m.employee_information_create_project_label()}
                options={toSelectOptions(options.projects ?? [])}
              />
              <EmployeeTextField
                name={`projects.${index}.roleInProject`}
                label={m.employee_information_create_project_role_label()}
              />
              <EmployeeDateField
                name={`projects.${index}.effectiveStartDate`}
                label={m.employee_information_create_effective_start_label()}
                required
              />
              <EmployeeDateField
                name={`projects.${index}.effectiveEndDate`}
                label={m.employee_information_create_effective_end_label()}
              />
              <EmployeeBooleanField
                name={`projects.${index}.isPrimary`}
                label={m.employee_information_create_primary_project_label()}
              />
            </FieldGroup>
          </CollectionItem>
        ))}
      </CollectionCard>
    </div>
  )
}
