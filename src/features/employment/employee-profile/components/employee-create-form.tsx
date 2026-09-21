import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconArrowRight, IconCheck, IconInfoCircle } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, type SubmitErrorHandler } from 'react-hook-form'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Spinner } from '@/shared/components/ui/spinner'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { EmployeeCreateBankPayrollStep } from '@/features/employment/employee-profile/components/employee-create-bank-payroll-step'
import { EmployeeCreateContactsStep } from '@/features/employment/employee-profile/components/employee-create-contacts-step'
import { EmployeeCreateEducationStep } from '@/features/employment/employee-profile/components/employee-create-education-step'
import { EmployeeCreateEmployeeStep } from '@/features/employment/employee-profile/components/employee-create-employee-step'
import { EmployeeCreateEmploymentStep } from '@/features/employment/employee-profile/components/employee-create-employment-step'
import {
  employeeCreateDefaultValues,
  employeeCreateFormShape,
  type EmployeeCreateFormValues,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import { EmployeeCreateStepper } from '@/features/employment/employee-profile/components/employee-create-form-ui'
import {
  useCreateEmployeeInformation,
  useUpdateEmployeeInformation,
} from '@/features/employment/employee-profile/hooks'
import type {
  CreateEmployeeInformationPayload,
  EmployeeInformationDetailData,
  EmployeeCreationOptionsData,
  EmployeeProfileContactType,
  EmployeeProfileContractStatus,
  EmployeeProfileContractType,
  EmployeeProfileEducationLevel,
  EmployeeProfileEmploymentType,
  UpdateEmployeeInformationRequest,
} from '@/features/employment/employee-profile/types'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeCreateFormProps {
  options: EmployeeCreationOptionsData
  mode?: 'create' | 'update'
  employee?: EmployeeInformationDetailData
}

const stepFields = [
  ['employee'],
  ['assignments', 'contracts', 'projects'],
  ['bankAccounts', 'bpjs', 'payrollComponents', 'taxProfile'],
  ['contacts'],
  ['educations'],
] as const

function optionalNumber(value: string) {
  return value === '' ? undefined : Number(value)
}

function optionalProfileValue(value: string | number) {
  const parsed = value === '' ? undefined : value
  return parsed === undefined ? undefined : (parsed as unknown as Record<string, unknown>)
}

function optionalDate(value: string) {
  return value || null
}

function toInformationEmploymentType(value: string): EmployeeInformationDetailData['employmentType'] {
  return {
    PERMANENT: 'Permanent',
    CONTRACT: 'Contract',
    OUTSOURCING: 'Contract',
    INTERN: 'Internship',
    FREELANCE: 'Freelance',
    Permanent: 'Permanent',
    Contract: 'Contract',
    Internship: 'Internship',
    Freelance: 'Freelance',
  }[value] ?? 'Permanent'
}

function toProfileEmploymentType(
  value: EmployeeInformationDetailData['employmentType'],
): EmployeeCreateFormValues['assignments'][number]['employmentType'] {
  return {
    Permanent: 'PERMANENT',
    Contract: 'CONTRACT',
    Internship: 'INTERN',
    Freelance: 'FREELANCE',
  }[value]
}

function getPayrollAssignmentValueFields(
  component: EmployeeCreateFormValues['payrollComponents'][number],
  options: EmployeeCreationOptionsData,
) {
  const selectedComponent = options.payrollComponents?.find(
    (option) => option.id === component.componentId,
  )
  const calculationMethod = selectedComponent?.calculationMethod
  const isBasicSalary = selectedComponent?.code === 'BASIC_SALARY'

  return {
    amount:
      calculationMethod === 'MANUAL' || (calculationMethod === 'SYSTEM' && isBasicSalary)
        ? component.amount || null
        : null,
    customFormulaExpression:
      calculationMethod === 'FORMULA' ? component.customFormulaExpression || null : null,
    percentage: calculationMethod === 'PERCENTAGE' ? component.percentage || null : null,
  }
}

function toPayload(
  form: EmployeeCreateFormValues,
  options: EmployeeCreationOptionsData,
): CreateEmployeeInformationPayload {
  return {
    employee: {
      ...form.employee,
      citizenshipStatus: form.employee.citizenshipStatus as 'WNI' | 'WNA',
      dateOfBirth: optionalDate(form.employee.dateOfBirth),
      heightCm: optionalProfileValue(optionalNumber(form.employee.heightCm) ?? ''),
      latitude: optionalProfileValue(optionalNumber(form.employee.latitude) ?? ''),
      longitude: optionalProfileValue(optionalNumber(form.employee.longitude) ?? ''),
      resignDate: optionalDate(form.employee.resignDate),
      weightKg: optionalProfileValue(optionalNumber(form.employee.weightKg) ?? ''),
    },
    assignments: form.assignments.map((assignment) => ({
      ...assignment,
      employmentType: assignment.employmentType as EmployeeProfileEmploymentType,
      effectiveEndDate: optionalDate(assignment.effectiveEndDate),
    })),
    bankAccounts: form.bankAccounts
      .filter((account) => account.bankId && account.accountNumber)
      .map((account) => ({
        ...account,
        employeeId: form.employee.employeeNumber,
      })),
    bpjs: form.bpjs
      .filter((item) => item.participantNumber)
      .map((item) => ({
        ...item,
        documentFileId: item.documentFileId || null,
        effectiveEndDate: optionalDate(item.effectiveEndDate),
        employeeId: form.employee.employeeNumber,
        facilityName: item.facilityName || null,
        membershipClass: item.membershipClass || null,
        program: item.program as 'KESEHATAN' | 'KETENAGAKERJAAN',
      })),
    contacts: form.contacts.map((contact) => ({
      ...contact,
      contactType: contact.contactType as EmployeeProfileContactType,
      birthDate: optionalDate(contact.birthDate),
      effectiveEndDate: optionalDate(contact.effectiveEndDate),
      ktpFileId: contact.ktpFileId || null,
    })),
    contracts: form.contracts.map((contract) => ({
      ...contract,
      contractType: contract.contractType as EmployeeProfileContractType,
      status: contract.status as EmployeeProfileContractStatus,
      effectiveEndDate: optionalDate(contract.effectiveEndDate),
      maxExtensionDate: optionalDate(contract.maxExtensionDate),
      probationEffectiveEndDate: optionalDate(contract.probationEffectiveEndDate),
    })),
    educations: form.educations
      .filter((education) => education.institutionName)
      .map((education) => ({
        ...education,
        employeeId: form.employee.employeeNumber,
        educationLevel: education.educationLevel as EmployeeProfileEducationLevel,
        gpa: optionalProfileValue(optionalNumber(education.gpa) ?? ''),
        graduationYear: optionalNumber(education.graduationYear),
      })),
    projects: form.projects.map((project) => ({
      ...project,
      employeeId: form.employee.employeeNumber,
      effectiveEndDate: optionalDate(project.effectiveEndDate),
    })),
    payrollComponents: form.payrollComponents
      .filter((component) => component.componentId)
      .map((component) => ({
        ...component,
        ...getPayrollAssignmentValueFields(component, options),
        effectiveEndDate: optionalDate(component.effectiveEndDate),
        employeeId: form.employee.employeeNumber,
      })),
    taxProfile: {
      ...form.taxProfile,
      ptkpStatus: form.taxProfile.ptkpStatus as
        | 'TK/0'
        | 'TK/1'
        | 'TK/2'
        | 'TK/3'
        | 'K/0'
        | 'K/1'
        | 'K/2'
        | 'K/3'
        | 'K/I/1'
        | 'K/I/2'
        | 'K/I/3',
    },
  }
}

function toUpdatePayload(
  form: EmployeeCreateFormValues,
  employee: EmployeeInformationDetailData,
): UpdateEmployeeInformationRequest['payload'] {
  const assignment = form.assignments[0]
  const bankAccount = form.bankAccounts[0]
  const healthBpjs = form.bpjs.find((item) => item.program === 'KESEHATAN')
  const employmentBpjs = form.bpjs.find((item) => item.program === 'KETENAGAKERJAAN')
  const contact = form.contacts[0]

  return {
    status: employee.status,
    personalInformation: {
      fullName: form.employee.fullName,
      email: form.employee.personalEmail,
      phoneNumber: form.employee.phoneNumber || null,
      birthDate: form.employee.dateOfBirth || null,
      gender: form.employee.gender || null,
      maritalStatus: form.employee.maritalStatus || null,
      nationality: form.employee.citizenshipStatus || null,
      address: form.employee.address || null,
    },
    employmentInformation: {
      joinDate: form.employee.hireDate,
      employmentType: toInformationEmploymentType(assignment.employmentType),
      departmentId: assignment.departmentUnitId,
      divisionId: assignment.divisionUnitId,
      positionId: assignment.positionId,
      gradeId: assignment.gradeId || undefined,
      branchId: employee.employmentInformation.branchId,
      supervisorId: assignment.supervisorEmployeeId || undefined,
      workLocation: assignment.workLocation || '',
    },
    emergencyContact: {
      name: contact.fullName || null,
      relationship: contact.contactType || null,
      phoneNumber: contact.phone || null,
      address: contact.address || null,
    },
    financialAndCompliance: {
      bankId: bankAccount.bankId || undefined,
      bankAccountHolder: bankAccount.accountHolderName || undefined,
      bankAccountNumber: bankAccount.accountNumber || undefined,
      bankEffectiveDate: bankAccount.effectiveStartDate || undefined,
      payrollAccount: employee.financialAndCompliance.payrollAccount ?? undefined,
      npwpNumber: form.taxProfile.npwpNumber || undefined,
      npwpStatus: employee.financialAndCompliance.npwpStatus || undefined,
      npwpRegisteredName: employee.financialAndCompliance.npwpRegisteredName || undefined,
      taxCategory: employee.financialAndCompliance.taxCategory || undefined,
      npwpEffectiveDate: form.taxProfile.effectiveStartDate || undefined,
      bpjsHealthNumber: healthBpjs?.participantNumber || undefined,
      bpjsEmploymentNumber: employmentBpjs?.participantNumber || undefined,
    },
    medicalCheckup: {
      status: employee.medicalCheckup.status,
      dueDate: employee.medicalCheckup.dueDate,
      lastCheckupDate: employee.medicalCheckup.lastCheckupDate,
      provider: employee.medicalCheckup.provider || undefined,
      examinationType: employee.medicalCheckup.examinationType || undefined,
      followUpRequired: employee.medicalCheckup.followUpRequired ?? undefined,
      administrativeNote: employee.medicalCheckup.administrativeNote || undefined,
    },
  }
}

export function EmployeeCreateForm({ options, mode = 'create', employee }: EmployeeCreateFormProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const createMutation = useCreateEmployeeInformation()
  const updateMutation = useUpdateEmployeeInformation()
  const mutation = mode === 'update' ? updateMutation : createMutation
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

  useEffect(() => {
    if (!employee) return
    const values = structuredClone(employeeCreateDefaultValues)
    values.employee = {
      ...values.employee,
      employeeNumber: employee.employeeNumber,
      fullName: employee.personalInformation.fullName,
      personalEmail: employee.personalInformation.email,
      phoneNumber: employee.personalInformation.phoneNumber ?? '',
      dateOfBirth: employee.personalInformation.birthDate ?? '',
      gender: employee.personalInformation.gender ?? '',
      maritalStatus: employee.personalInformation.maritalStatus ?? '',
      citizenshipStatus: (employee.personalInformation.nationality as 'WNI' | 'WNA') || 'WNI',
      address: employee.personalInformation.address ?? '',
      hireDate: employee.employmentInformation.joinDate,
      employeeStatus: employee.status,
    }
    values.assignments = [
      {
        ...values.assignments[0],
        departmentUnitId: employee.employmentInformation.departmentId,
        divisionUnitId: employee.employmentInformation.divisionId,
        positionId: employee.employmentInformation.positionId,
        gradeId: employee.employmentInformation.gradeId ?? '',
        supervisorEmployeeId: employee.employmentInformation.supervisorId ?? '',
        effectiveStartDate: employee.employmentInformation.joinDate,
        employmentType: toProfileEmploymentType(employee.employmentInformation.employmentType),
        workLocation: employee.employmentInformation.workLocation,
      },
    ]
    values.contacts = [
      {
        ...values.contacts[0],
        fullName: employee.emergencyContact.name ?? '',
        contactType: employee.emergencyContact.relationship ?? 'OTHER',
        phone: employee.emergencyContact.phoneNumber ?? '',
        address: employee.emergencyContact.address ?? '',
      },
    ]
    values.bankAccounts = [
      {
        ...values.bankAccounts[0],
        bankId: employee.financialAndCompliance.bankId ?? '',
        accountHolderName: employee.financialAndCompliance.bankAccountHolder ?? '',
        accountNumber: employee.financialAndCompliance.bankAccountNumber ?? '',
        effectiveStartDate:
          employee.financialAndCompliance.bankEffectiveDate ?? employee.joinDate,
      },
    ]
    values.bpjs = values.bpjs.map((item) => ({
      ...item,
      participantNumber:
        item.program === 'KESEHATAN'
          ? (employee.financialAndCompliance.bpjsHealthNumber ?? '')
          : (employee.financialAndCompliance.bpjsEmploymentNumber ?? ''),
      effectiveStartDate: employee.joinDate,
    }))
    values.taxProfile = {
      ...values.taxProfile,
      npwpNumber: employee.financialAndCompliance.npwpNumber ?? '',
      effectiveStartDate:
        employee.financialAndCompliance.npwpEffectiveDate ?? employee.joinDate,
    }
    methods.reset(values)
  }, [employee, methods])

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
      title: 'Bank & Payroll',
      description: 'Rekening bank, BPJS, dan payroll karyawan.',
    },
    {
      title: m.employee_information_create_step_contacts(),
      description: m.employee_information_create_step_contacts_description(),
    },
    {
      title: 'Education',
      description: 'Riwayat pendidikan dan sertifikat pendukung.',
    },
  ]

  const submit = (form: EmployeeCreateFormValues) => {
    if (mode === 'update' && employee) {
      updateMutation.mutate(
        { employeeId: employee.id, payload: toUpdatePayload(form, employee) },
        {
          onSuccess: () => {
            snackbar.success(m.employee_information_edit_success())
            void navigate({ to: '/employment/employee-profile/$employeeId', params: { employeeId: employee.id } })
          },
          onError: (error) => snackbar.exception(error),
        },
      )
      return
    }
    mutation.mutate(toPayload(form, options), {
      onSuccess: () => {
        snackbar.success(m.employee_information_create_success())
        void navigate({ to: '/employment/employee-profile' })
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  const handleInvalid: SubmitErrorHandler<EmployeeCreateFormValues> = (errors) => {
    if (errors.employee) setCurrentStep(0)
    else if (errors.assignments || errors.contracts || errors.projects) setCurrentStep(1)
    else if (errors.bankAccounts || errors.bpjs || errors.payrollComponents || errors.taxProfile)
      setCurrentStep(2)
    else if (errors.contacts) setCurrentStep(3)
    else setCurrentStep(4)
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

        {currentStep === 0 && <EmployeeCreateEmployeeStep options={options} />}
        {currentStep === 1 && <EmployeeCreateEmploymentStep options={options} />}
        {currentStep === 2 && <EmployeeCreateBankPayrollStep options={options} />}
        {currentStep === 3 && <EmployeeCreateContactsStep />}
        {currentStep === 4 && <EmployeeCreateEducationStep />}

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
              <Button type='submit' disabled={mutation.isPending}>
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
