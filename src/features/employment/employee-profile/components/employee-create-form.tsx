import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconArrowRight, IconCheck, IconInfoCircle } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { FormProvider, useForm, type SubmitErrorHandler } from 'react-hook-form'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Spinner } from '@/shared/components/ui/spinner'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { EmployeeCreateContactsStep } from '@/features/employment/employee-profile/components/employee-create-contacts-step'
import { EmployeeCreateEducationDocumentsStep } from '@/features/employment/employee-profile/components/employee-create-education-documents-step'
import { EmployeeCreateEmployeeStep } from '@/features/employment/employee-profile/components/employee-create-employee-step'
import { EmployeeCreateEmploymentStep } from '@/features/employment/employee-profile/components/employee-create-employment-step'
import {
  employeeCreateDefaultValues,
  employeeCreateFormShape,
  type EmployeeCreateFormValues,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import { EmployeeCreateStepper } from '@/features/employment/employee-profile/components/employee-create-form-ui'
import { useCreateEmployeeInformation } from '@/features/employment/employee-profile/hooks'
import type {
  CreateEmployeeInformationPayload,
  EmployeeCreationOptionsData,
} from '@/features/employment/employee-profile/types'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeCreateFormProps {
  options: EmployeeCreationOptionsData
}

const stepFields = [
  ['employee'],
  ['assignments', 'contracts', 'projects'],
  ['contacts'],
  ['educations', 'documents'],
] as const

function optionalNumber(value: string) {
  return value === '' ? undefined : Number(value)
}

function toPayload(
  form: EmployeeCreateFormValues,
  options: EmployeeCreationOptionsData,
): CreateEmployeeInformationPayload {
  return {
    employee: {
      ...form.employee,
      bankName: options.banks.find((bank) => bank.id === form.employee.bankId)?.name ?? '',
      heightCm: optionalNumber(form.employee.heightCm),
      latitude: optionalNumber(form.employee.latitude),
      longitude: optionalNumber(form.employee.longitude),
      weightKg: optionalNumber(form.employee.weightKg),
    },
    assignments: form.assignments,
    contacts: form.contacts,
    contracts: form.contracts,
    documents: form.documents,
    educations: form.educations.map((education) => ({
      ...education,
      gpa: optionalNumber(education.gpa),
      graduationYear: optionalNumber(education.graduationYear),
    })),
    projects: form.projects,
  }
}

export function EmployeeCreateForm({ options }: EmployeeCreateFormProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [profilePhoto, setProfilePhoto] = useState<File>()
  const mutation = useCreateEmployeeInformation()
  const schema = useSchema((schema, messages) =>
    employeeCreateFormShape(schema, {
      required: messages.employee_information_create_field_required(),
      email: messages.employee_information_create_email_invalid(),
    }),
  )
  const methods = useForm<EmployeeCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: employeeCreateDefaultValues,
    mode: 'onBlur',
  })

  const steps = [
    {
      title: m.employee_information_create_step_employee(),
      description: m.employee_information_create_step_employee_description(),
    },
    {
      title: m.employee_information_create_step_employment_setup(),
      description: m.employee_information_create_step_employment_setup_description(),
    },
    {
      title: m.employee_information_create_step_contacts(),
      description: m.employee_information_create_step_contacts_description(),
    },
    {
      title: m.employee_information_create_step_education_documents(),
      description: m.employee_information_create_step_education_documents_description(),
    },
  ]

  const submit = (form: EmployeeCreateFormValues) => {
    mutation.mutate(
      { payload: toPayload(form, options), profilePhoto },
      {
        onSuccess: () => {
          snackbar.success(m.employee_information_create_success())
          void navigate({ to: '/employment/employee-profile' })
        },
        onError: (error) => snackbar.exception(error),
      },
    )
  }

  const handleInvalid: SubmitErrorHandler<EmployeeCreateFormValues> = (errors) => {
    if (errors.employee) setCurrentStep(0)
    else if (errors.assignments || errors.contracts || errors.projects) setCurrentStep(1)
    else if (errors.contacts) setCurrentStep(2)
    else setCurrentStep(3)
  }

  const continueStep = async () => {
    const isValid = await methods.trigger([...stepFields[currentStep]])
    if (isValid) setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }

  return (
    <FormProvider {...methods}>
      <form
        className='flex min-w-0 flex-col gap-5'
        onSubmit={methods.handleSubmit(submit, handleInvalid)}
        noValidate
      >
        <EmployeeCreateStepper
          currentStep={currentStep}
          steps={steps}
          onStepChange={setCurrentStep}
        />

        {currentStep === 0 && (
          <EmployeeCreateEmployeeStep options={options} onPhotoChange={setProfilePhoto} />
        )}
        {currentStep === 1 && <EmployeeCreateEmploymentStep options={options} />}
        {currentStep === 2 && <EmployeeCreateContactsStep />}
        {currentStep === 3 && <EmployeeCreateEducationDocumentsStep />}

        <Card className='border-primary/15 bg-primary/5'>
          <CardContent className='flex items-start gap-2 text-sm text-primary'>
            <IconInfoCircle className='mt-0.5 size-4 shrink-0' />
            {m.employee_information_create_required_hint()}
          </CardContent>
        </Card>

        <div className='sticky bottom-3 z-10 flex flex-col-reverse justify-between gap-3 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row'>
          <Button variant='ghost' asChild>
            <Link to='/employment/employee-profile'>{m.employee_information_create_cancel()}</Link>
          </Button>
          <div className='flex justify-end gap-2'>
            {currentStep > 0 && (
              <Button
                type='button'
                variant='outline'
                onClick={() => setCurrentStep((step) => step - 1)}
              >
                <IconArrowLeft />
                {m.employee_information_create_back()}
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button type='button' onClick={() => void continueStep()}>
                {m.employee_information_create_continue()}
                <IconArrowRight />
              </Button>
            ) : (
              <Button type='button' disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner /> : <IconCheck />}
                {m.employee_information_create_submit()}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
