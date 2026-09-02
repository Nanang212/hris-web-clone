import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconDownload,
  IconFileText,
  IconInfoCircle,
  IconPhoto,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form'
import { z } from 'zod'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input, type InputProps } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { Spinner } from '@/shared/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import {
  useGetEmployeeCreationOptions,
  useRequestEmployeeBankVerification,
  useUpdateEmployeeInformation,
} from '@/features/company/employee-information/hooks'
import type {
  EmployeeInformationDetailData,
  EmployeeInformationEmploymentType,
  EmployeeInformationStatus,
} from '@/features/company/employee-information/types'
import { m } from '@/i18n/paraglide/messages'

const MAX_PHOTO_SIZE = 2 * 1024 * 1024
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024
const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

interface EmployeeInformationEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeInformationDetailData
}

interface SelectOption {
  value: string
  label: string
}

interface TextFormFieldProps extends Omit<InputProps, 'id'> {
  id: string
  label: string
  error?: string
  registration: UseFormRegisterReturn
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getStatusLabel(status: EmployeeInformationStatus) {
  return {
    Active: m.employee_information_status_active(),
    OnLeave: m.employee_information_status_on_leave(),
    Probation: m.employee_information_status_probation(),
    Resigned: m.employee_information_status_resigned(),
    Inactive: m.employee_information_status_inactive(),
  }[status]
}

function getStatusVariant(status: EmployeeInformationStatus) {
  return {
    Active: 'green',
    OnLeave: 'blue',
    Probation: 'amber',
    Resigned: 'slate',
    Inactive: 'red',
  }[status] as 'green' | 'blue' | 'amber' | 'slate' | 'red'
}

function getEmploymentTypeLabel(type: EmployeeInformationEmploymentType) {
  return {
    Permanent: m.employee_information_type_permanent(),
    Contract: m.employee_information_type_contract(),
    Internship: m.employee_information_type_internship(),
    Freelance: m.employee_information_type_freelance(),
  }[type]
}

function formatFileSize(size: number | null | undefined) {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function TextFormField({
  id,
  label,
  error,
  registration,
  ...inputProps
}: Readonly<TextFormFieldProps>) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} aria-invalid={!!error} {...registration} {...inputProps} />
      <FieldError>{error}</FieldError>
    </Field>
  )
}

function SelectFormField({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  options,
  error,
  disabled,
}: Readonly<{
  id: string
  label: string
  placeholder: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  error?: string
  disabled?: boolean
}>) {
  return (
    <Field data-invalid={!!error} data-disabled={disabled}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className='w-full' aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError>{error}</FieldError>
    </Field>
  )
}

function DateFormField({
  label,
  placeholder,
  value,
  onChange,
  error,
}: Readonly<{
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string
}>) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      <DatePicker
        mode='single'
        className='w-full'
        selected={value ? dayjs(value).toDate() : undefined}
        onSelect={(date) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')}
        placeholder={placeholder}
        aria-invalid={!!error}
      />
      <FieldError>{error}</FieldError>
    </Field>
  )
}

function createDefaultValues(employee: EmployeeInformationDetailData) {
  const personal = employee.personalInformation
  const employment = employee.employmentInformation
  const emergency = employee.emergencyContact
  const financial = employee.financialAndCompliance
  const medical = employee.medicalCheckup

  return {
    fullName: personal.fullName,
    email: personal.email,
    phoneNumber: personal.phoneNumber ?? '',
    birthDate: personal.birthDate ?? '',
    gender: personal.gender ?? '',
    maritalStatus: personal.maritalStatus ?? '',
    nationality: personal.nationality ?? '',
    address: personal.address ?? '',
    emergencyName: emergency.name ?? '',
    emergencyRelationship: emergency.relationship ?? '',
    emergencyPhone: emergency.phoneNumber ?? '',
    emergencyAddress: emergency.address ?? '',
    departmentId: employment.departmentId,
    divisionId: employment.divisionId,
    positionId: employment.positionId,
    gradeId: employment.gradeId ?? '',
    branchId: employment.branchId,
    supervisorId: employment.supervisorId ?? '',
    employmentType: employment.employmentType,
    joinDate: employment.joinDate,
    workLocation: employment.workLocation,
    status: employee.status,
    statusEffectiveDate: employee.statusManagement?.effectiveDate ?? employee.joinDate,
    statusReason: employee.statusManagement?.reason ?? 'StatusCorrection',
    lastWorkingDate: employee.statusManagement?.lastWorkingDate ?? '',
    statusNotes: employee.statusManagement?.notes ?? '',
    bankId: financial.bankId ?? '',
    bankAccountHolder: financial.bankAccountHolder ?? '',
    bankAccountNumber: financial.bankAccountNumber ?? '',
    bankBranch: financial.bankBranch ?? '',
    bankAccountType: financial.bankAccountType ?? 'Savings',
    currency: financial.currency ?? 'IDR',
    bankEffectiveDate: financial.bankEffectiveDate ?? employee.joinDate,
    payrollAccount: financial.payrollAccount === false ? 'No' : 'Yes',
    npwpNumber: financial.npwpNumber ?? '',
    npwpStatus: financial.npwpStatus ?? '',
    npwpRegisteredName: financial.npwpRegisteredName ?? personal.fullName,
    taxCategory: financial.taxCategory ?? '',
    npwpEffectiveDate: financial.npwpEffectiveDate ?? employee.joinDate,
    taxOffice: financial.taxOffice ?? '',
    bpjsHealthNumber: financial.bpjsHealthNumber ?? '',
    bpjsEmploymentNumber: financial.bpjsEmploymentNumber ?? '',
    medicalStatus: medical.status ?? '',
    lastCheckupDate: medical.lastCheckupDate ?? '',
    dueDate: medical.dueDate ?? '',
    medicalProvider: medical.provider ?? '',
    examinationType: medical.examinationType ?? '',
    followUpRequired: medical.followUpRequired ? 'Yes' : 'No',
    administrativeNote: medical.administrativeNote ?? '',
    profilePhoto: undefined as File | undefined,
    removeProfilePhoto: false,
    npwpDocument: undefined as File | undefined,
    medicalCheckupDocument: undefined as File | undefined,
  }
}

export function EmployeeInformationEditSheet({
  open,
  onOpenChange,
  employee,
}: Readonly<EmployeeInformationEditSheetProps>) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const npwpDocumentInputRef = useRef<HTMLInputElement>(null)
  const medicalCheckupDocumentInputRef = useRef<HTMLInputElement>(null)
  const optionsQuery = useGetEmployeeCreationOptions()
  const updateMutation = useUpdateEmployeeInformation()
  const bankVerificationMutation = useRequestEmployeeBankVerification()
  const [activeTab, setActiveTab] = useState('personal')
  const formSchema = useSchema((z) => ({
    fullName: z.string().trim().min(1, { message: m.employee_information_edit_name_required() }),
    email: z.email({ message: m.employee_information_edit_email_invalid() }),
    phoneNumber: z
      .string()
      .trim()
      .refine((value) => value.length >= 6 && value.length <= 30, {
        message: m.employee_information_edit_phone_invalid(),
      }),
    birthDate: z.string().min(1, { message: m.employee_information_edit_required() }),
    gender: z.string().min(1, { message: m.employee_information_edit_required() }),
    maritalStatus: z.string().trim().min(1, { message: m.employee_information_edit_required() }),
    nationality: z.string().trim().min(1, { message: m.employee_information_edit_required() }),
    address: z.string().trim().min(1, { message: m.employee_information_edit_required() }).max(500),
    emergencyName: z.string().trim().min(1, { message: m.employee_information_edit_required() }),
    emergencyRelationship: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_edit_required() }),
    emergencyPhone: z
      .string()
      .trim()
      .min(6, { message: m.employee_information_edit_phone_invalid() })
      .max(30, { message: m.employee_information_edit_phone_invalid() }),
    emergencyAddress: z.string().trim().max(500),
    departmentId: z.string().min(1, { message: m.employee_information_edit_required() }),
    divisionId: z.string().min(1, { message: m.employee_information_edit_required() }),
    positionId: z.string().min(1, { message: m.employee_information_edit_required() }),
    gradeId: z.string(),
    branchId: z.string().min(1, { message: m.employee_information_edit_required() }),
    supervisorId: z.string(),
    employmentType: z.enum(['Permanent', 'Contract', 'Internship', 'Freelance']),
    joinDate: z.string().min(1, { message: m.employee_information_edit_required() }),
    workLocation: z.string().trim().min(1, { message: m.employee_information_edit_required() }),
    status: z.enum(['Active', 'OnLeave', 'Probation', 'Resigned', 'Inactive']),
    statusEffectiveDate: z.string().min(1, { message: m.employee_information_edit_required() }),
    statusReason: z.string().min(1, { message: m.employee_information_edit_required() }),
    lastWorkingDate: z.string(),
    statusNotes: z.string().trim().max(1000),
    bankId: z.string().min(1, { message: m.employee_information_edit_required() }),
    bankAccountHolder: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_edit_required() })
      .max(120),
    bankAccountNumber: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_edit_required() })
      .max(50),
    bankBranch: z.string().trim().max(120),
    bankAccountType: z.string().min(1, { message: m.employee_information_edit_required() }),
    currency: z.string().min(1, { message: m.employee_information_edit_required() }),
    bankEffectiveDate: z.string().min(1, { message: m.employee_information_edit_required() }),
    payrollAccount: z.enum(['Yes', 'No']),
    npwpNumber: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_edit_required() })
      .max(50),
    npwpStatus: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_edit_required() })
      .max(50),
    npwpRegisteredName: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_edit_required() })
      .max(120),
    taxCategory: z.string().trim().max(50),
    npwpEffectiveDate: z.string().min(1, { message: m.employee_information_edit_required() }),
    taxOffice: z.string().trim().max(120),
    bpjsHealthNumber: z.string().trim().max(50),
    bpjsEmploymentNumber: z.string().trim().max(50),
    medicalStatus: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_edit_required() })
      .max(50),
    lastCheckupDate: z.string().min(1, { message: m.employee_information_edit_required() }),
    dueDate: z.string().min(1, { message: m.employee_information_edit_required() }),
    medicalProvider: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_edit_required() })
      .max(120),
    examinationType: z.string().min(1, { message: m.employee_information_edit_required() }),
    followUpRequired: z.enum(['Yes', 'No']),
    administrativeNote: z.string().trim().max(1000),
    profilePhoto: z
      .custom<File>()
      .optional()
      .refine((file) => !file || PHOTO_TYPES.includes(file.type), {
        message: m.employee_information_create_photo_invalid(),
      })
      .refine((file) => !file || file.size <= MAX_PHOTO_SIZE, {
        message: m.employee_information_create_photo_too_large(),
      }),
    removeProfilePhoto: z.boolean(),
    npwpDocument: z
      .custom<File>()
      .optional()
      .refine((file) => !file || DOCUMENT_TYPES.includes(file.type), {
        message: m.employee_information_edit_document_invalid(),
      })
      .refine((file) => !file || file.size <= MAX_DOCUMENT_SIZE, {
        message: m.employee_information_edit_document_too_large(),
      }),
    medicalCheckupDocument: z
      .custom<File>()
      .optional()
      .refine((file) => !file || DOCUMENT_TYPES.includes(file.type), {
        message: m.employee_information_edit_document_invalid(),
      })
      .refine((file) => !file || file.size <= MAX_DOCUMENT_SIZE, {
        message: m.employee_information_edit_document_too_large(),
      }),
  }))
  type FormValues = z.infer<typeof formSchema>
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(employee),
  })
  const values = useWatch({ control })
  const profilePhoto = useWatch({ control, name: 'profilePhoto' })
  const removeProfilePhoto = useWatch({ control, name: 'removeProfilePhoto' })
  const npwpDocument = useWatch({ control, name: 'npwpDocument' })
  const medicalCheckupDocument = useWatch({ control, name: 'medicalCheckupDocument' })
  const photoPreview = useMemo(
    () => {
      if (removeProfilePhoto) return undefined
      return profilePhoto ? URL.createObjectURL(profilePhoto) : (employee.avatarUrl ?? undefined)
    },
    [employee.avatarUrl, profilePhoto, removeProfilePhoto],
  )

  useEffect(() => {
    if (open) reset(createDefaultValues(employee))
  }, [employee, open, reset])

  useEffect(
    () => () => {
      if (profilePhoto && photoPreview) URL.revokeObjectURL(photoPreview)
    },
    [photoPreview, profilePhoto],
  )

  const options = optionsQuery.data
  const positions = (options?.positions ?? []).filter(
    (position) => !values.departmentId || position.departmentId === values.departmentId,
  )
  const toOptions = (items: Array<{ id: string; name: string }> = []) =>
    items.map((item) => ({ value: item.id, label: item.name }))

  const submitProfile = (formValues: FormValues) => {
    updateMutation.mutate(
      {
        employeeId: employee.id,
        profilePhoto: formValues.profilePhoto,
        npwpDocument: formValues.npwpDocument,
        medicalCheckupDocument: formValues.medicalCheckupDocument,
        payload: {
          status: formValues.status,
          removeProfilePhoto: formValues.removeProfilePhoto,
          personalInformation: {
            fullName: formValues.fullName,
            email: formValues.email,
            phoneNumber: formValues.phoneNumber,
            birthDate: formValues.birthDate,
            gender: formValues.gender,
            maritalStatus: formValues.maritalStatus,
            nationality: formValues.nationality,
            address: formValues.address,
          },
          employmentInformation: {
            joinDate: formValues.joinDate,
            employmentType: formValues.employmentType,
            departmentId: formValues.departmentId,
            divisionId: formValues.divisionId,
            positionId: formValues.positionId,
            gradeId: formValues.gradeId || undefined,
            branchId: formValues.branchId,
            supervisorId: formValues.supervisorId || undefined,
            workLocation: formValues.workLocation,
          },
          emergencyContact: {
            name: formValues.emergencyName,
            relationship: formValues.emergencyRelationship,
            phoneNumber: formValues.emergencyPhone,
            address: formValues.emergencyAddress || null,
          },
          financialAndCompliance: {
            bankId: formValues.bankId || undefined,
            bankAccountHolder: formValues.bankAccountHolder || undefined,
            bankAccountNumber: formValues.bankAccountNumber || undefined,
            bankBranch: formValues.bankBranch || undefined,
            bankAccountType: formValues.bankAccountType || undefined,
            currency: formValues.currency || undefined,
            bankEffectiveDate: formValues.bankEffectiveDate || undefined,
            payrollAccount: formValues.payrollAccount === 'Yes',
            npwpNumber: formValues.npwpNumber || undefined,
            npwpStatus: formValues.npwpStatus || undefined,
            npwpRegisteredName: formValues.npwpRegisteredName || undefined,
            taxCategory: formValues.taxCategory || undefined,
            npwpEffectiveDate: formValues.npwpEffectiveDate || undefined,
            taxOffice: formValues.taxOffice || undefined,
            bpjsHealthNumber: formValues.bpjsHealthNumber || undefined,
            bpjsEmploymentNumber: formValues.bpjsEmploymentNumber || undefined,
          },
          medicalCheckup: {
            status: formValues.medicalStatus || null,
            lastCheckupDate: formValues.lastCheckupDate || null,
            dueDate: formValues.dueDate || null,
            provider: formValues.medicalProvider || undefined,
            examinationType: formValues.examinationType || undefined,
            followUpRequired: formValues.followUpRequired === 'Yes',
            administrativeNote: formValues.administrativeNote || undefined,
          },
          ...(formValues.status !== employee.status
            ? {
                statusChange: {
                  previousStatus: employee.status,
                  effectiveDate: formValues.statusEffectiveDate,
                  reason: formValues.statusReason,
                  lastWorkingDate: formValues.lastWorkingDate || undefined,
                  notes: formValues.statusNotes,
                },
              }
            : {}),
        },
      },
      {
        onSuccess: () => {
          snackbar.success(m.employee_information_edit_success())
          onOpenChange(false)
        },
        onError: (error) => snackbar.exception(error),
      },
    )
  }

  const statusOptions: SelectOption[] = (
    ['Active', 'OnLeave', 'Probation', 'Resigned', 'Inactive'] as EmployeeInformationStatus[]
  ).map((status) => ({ value: status, label: getStatusLabel(status) }))
  const employmentTypeOptions: SelectOption[] = (
    ['Permanent', 'Contract', 'Internship', 'Freelance'] as EmployeeInformationEmploymentType[]
  ).map((type) => ({ value: type, label: getEmploymentTypeLabel(type) }))
  const yesNoOptions = [
    { value: 'Yes', label: m.employee_information_edit_yes() },
    { value: 'No', label: m.employee_information_edit_no() },
  ]
  const statusReasonOptions = [
    { value: 'StatusCorrection', label: m.employee_information_edit_status_reason_correction() },
    { value: 'Resignation', label: m.employee_information_edit_status_reason_resignation() },
    { value: 'Termination', label: m.employee_information_edit_status_reason_termination() },
    { value: 'Leave', label: m.employee_information_edit_status_reason_leave() },
    { value: 'ReturnFromLeave', label: m.employee_information_edit_status_reason_return() },
    { value: 'ProbationCompletion', label: m.employee_information_edit_status_reason_probation() },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        showCloseButton={false}
        className='gap-0 data-[side=right]:w-full data-[side=right]:sm:w-1/2 data-[side=right]:sm:max-w-none'
      >
        <form
          className='flex h-full min-h-0 flex-col'
          onSubmit={handleSubmit(submitProfile)}
          noValidate
        >
          <SheetHeader className='shrink-0 border-b p-4 sm:p-5'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div className='min-w-0'>
                <SheetTitle>{m.employee_information_edit_title()}</SheetTitle>
                <SheetDescription className='truncate'>
                  {m.employee_information_edit_description({
                    name: employee.fullName,
                    employeeNumber: employee.employeeNumber,
                  })}
                </SheetDescription>
              </div>
              <div className='flex shrink-0 gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='flex-1 sm:flex-none'
                  onClick={() => onOpenChange(false)}
                >
                  {m.employee_information_edit_cancel()}
                </Button>
                <Button
                  type='submit'
                  className='flex-1 sm:flex-none'
                  disabled={updateMutation.isPending || optionsQuery.isPending}
                >
                  {updateMutation.isPending && <Spinner />}
                  {m.employee_information_edit_save()}
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className='min-h-0 flex-1 overflow-y-auto p-4 sm:p-5'>
            <div className='mb-4 flex min-w-0 items-center gap-3 rounded-lg border bg-muted/20 p-3'>
              <Avatar className='size-11'>
                <AvatarImage src={photoPreview} alt={employee.fullName} />
                <AvatarFallback className='bg-primary/10 font-semibold text-primary'>
                  {getInitials(values.fullName || employee.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='truncate font-semibold'>{values.fullName || employee.fullName}</p>
                  <Badge variant={getStatusVariant(values.status)}>
                    {getStatusLabel(values.status)}
                  </Badge>
                </div>
                <p className='truncate text-xs text-muted-foreground'>
                  {employee.positionName} · {employee.departmentName}
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='min-w-0'>
              <TabsList
                variant='line'
                className='grid h-auto w-full grid-cols-7 gap-1 border-b group-data-horizontal/tabs:h-auto [&_[data-slot=tabs-trigger]]:h-auto [&_[data-slot=tabs-trigger]]:min-h-10 [&_[data-slot=tabs-trigger]]:min-w-0 [&_[data-slot=tabs-trigger]]:px-1 [&_[data-slot=tabs-trigger]]:py-2 [&_[data-slot=tabs-trigger]]:text-center [&_[data-slot=tabs-trigger]]:text-[10px] [&_[data-slot=tabs-trigger]]:leading-tight [&_[data-slot=tabs-trigger]]:whitespace-normal sm:[&_[data-slot=tabs-trigger]]:px-2 sm:[&_[data-slot=tabs-trigger]]:text-xs'
              >
                <TabsTrigger value='personal'>
                  {m.employee_information_edit_tab_personal()}
                </TabsTrigger>
                <TabsTrigger value='employment'>
                  {m.employee_information_edit_tab_employment()}
                </TabsTrigger>
                <TabsTrigger value='status'>{m.employee_information_edit_tab_status()}</TabsTrigger>
                <TabsTrigger value='photo'>{m.employee_information_edit_tab_photo()}</TabsTrigger>
                <TabsTrigger value='bank'>{m.employee_information_edit_tab_bank()}</TabsTrigger>
                <TabsTrigger value='npwp'>{m.employee_information_edit_tab_npwp()}</TabsTrigger>
                <TabsTrigger value='mcu'>{m.employee_information_edit_tab_mcu()}</TabsTrigger>
              </TabsList>

              <TabsContent value='personal' className='pt-4'>
                <FieldGroup>
                  <FieldGroup className='grid sm:grid-cols-2'>
                    <TextFormField
                      id='employee-edit-name'
                      label={m.employee_information_detail_field_full_name()}
                      error={errors.fullName?.message}
                      registration={register('fullName')}
                    />
                    <TextFormField
                      id='employee-edit-emergency-name'
                      label={m.employee_information_detail_field_contact_name()}
                      error={errors.emergencyName?.message}
                      registration={register('emergencyName')}
                    />
                    <TextFormField
                      id='employee-edit-email'
                      type='email'
                      label={m.employee_information_detail_field_email()}
                      error={errors.email?.message}
                      registration={register('email')}
                    />
                    <TextFormField
                      id='employee-edit-relationship'
                      label={m.employee_information_detail_field_relationship()}
                      placeholder={m.employee_information_edit_relationship_placeholder()}
                      error={errors.emergencyRelationship?.message}
                      registration={register('emergencyRelationship')}
                    />
                    <TextFormField
                      id='employee-edit-phone'
                      type='tel'
                      label={m.employee_information_detail_field_phone()}
                      error={errors.phoneNumber?.message}
                      registration={register('phoneNumber')}
                    />
                    <TextFormField
                      id='employee-edit-emergency-phone'
                      type='tel'
                      label={m.employee_information_edit_emergency_phone()}
                      error={errors.emergencyPhone?.message}
                      registration={register('emergencyPhone')}
                    />
                    <Controller
                      name='birthDate'
                      control={control}
                      render={({ field }) => (
                        <DateFormField
                          label={m.employee_information_detail_field_birth_date()}
                          placeholder={m.employee_information_create_birth_date_placeholder()}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.birthDate?.message}
                        />
                      )}
                    />
                    <Controller
                      name='gender'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-gender'
                          label={m.employee_information_detail_field_gender()}
                          placeholder={m.employee_information_create_gender_placeholder()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={(options?.genders ?? []).map((gender) => ({
                            value: gender,
                            label:
                              gender === 'Male'
                                ? m.employee_information_create_gender_male()
                                : m.employee_information_create_gender_female(),
                          }))}
                          error={errors.gender?.message}
                        />
                      )}
                    />
                    <TextFormField
                      id='employee-edit-marital'
                      label={m.employee_information_detail_field_marital_status()}
                      placeholder={m.employee_information_edit_marital_placeholder()}
                      error={errors.maritalStatus?.message}
                      registration={register('maritalStatus')}
                    />
                    <TextFormField
                      id='employee-edit-nationality'
                      label={m.employee_information_detail_field_nationality()}
                      placeholder={m.employee_information_edit_nationality_placeholder()}
                      error={errors.nationality?.message}
                      registration={register('nationality')}
                    />
                  </FieldGroup>
                  <FieldGroup className='grid sm:grid-cols-2'>
                    <Field data-invalid={!!errors.address}>
                      <FieldLabel htmlFor='employee-edit-address'>
                        {m.employee_information_detail_field_address()}
                      </FieldLabel>
                      <Textarea
                        id='employee-edit-address'
                        aria-invalid={!!errors.address}
                        {...register('address')}
                      />
                      <FieldError>{errors.address?.message}</FieldError>
                    </Field>
                    <Field data-invalid={!!errors.emergencyAddress}>
                      <FieldLabel htmlFor='employee-edit-emergency-address'>
                        {m.employee_information_edit_emergency_address()}
                      </FieldLabel>
                      <Textarea
                        id='employee-edit-emergency-address'
                        aria-invalid={!!errors.emergencyAddress}
                        {...register('emergencyAddress')}
                      />
                      <FieldError>{errors.emergencyAddress?.message}</FieldError>
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </TabsContent>

              <TabsContent value='employment' className='pt-4'>
                <FieldGroup className='grid sm:grid-cols-2'>
                  <Controller
                    name='departmentId'
                    control={control}
                    render={({ field }) => (
                      <SelectFormField
                        id='employee-edit-department'
                        label={m.employee_information_detail_field_department()}
                        placeholder={m.employee_information_create_department_placeholder()}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          setValue('positionId', '')
                        }}
                        options={toOptions(options?.departments)}
                        error={errors.departmentId?.message}
                      />
                    )}
                  />
                  <Controller
                    name='divisionId'
                    control={control}
                    render={({ field }) => (
                      <SelectFormField
                        id='employee-edit-division'
                        label={m.employee_information_detail_field_division()}
                        placeholder={m.employee_information_create_division_placeholder()}
                        value={field.value}
                        onValueChange={field.onChange}
                        options={toOptions(options?.divisions)}
                        error={errors.divisionId?.message}
                      />
                    )}
                  />
                  <Controller
                    name='positionId'
                    control={control}
                    render={({ field }) => (
                      <SelectFormField
                        id='employee-edit-position'
                        label={m.employee_information_detail_field_position()}
                        placeholder={m.employee_information_create_position_placeholder()}
                        value={field.value}
                        onValueChange={field.onChange}
                        options={toOptions(positions)}
                        error={errors.positionId?.message}
                        disabled={!values.departmentId}
                      />
                    )}
                  />
                  <Controller
                    name='gradeId'
                    control={control}
                    render={({ field }) => (
                      <SelectFormField
                        id='employee-edit-grade'
                        label={m.employee_information_detail_field_grade()}
                        placeholder={m.employee_information_create_grade_placeholder()}
                        value={field.value}
                        onValueChange={field.onChange}
                        options={toOptions(options?.grades)}
                        error={errors.gradeId?.message}
                      />
                    )}
                  />
                  <Controller
                    name='branchId'
                    control={control}
                    render={({ field }) => (
                      <SelectFormField
                        id='employee-edit-branch'
                        label={m.employee_information_create_branch_label()}
                        placeholder={m.employee_information_create_branch_placeholder()}
                        value={field.value}
                        onValueChange={field.onChange}
                        options={toOptions(options?.branches)}
                        error={errors.branchId?.message}
                      />
                    )}
                  />
                  <Controller
                    name='supervisorId'
                    control={control}
                    render={({ field }) => (
                      <SelectFormField
                        id='employee-edit-supervisor'
                        label={m.employee_information_detail_field_supervisor()}
                        placeholder={m.employee_information_create_manager_placeholder()}
                        value={field.value}
                        onValueChange={field.onChange}
                        options={toOptions(options?.managers)}
                        error={errors.supervisorId?.message}
                      />
                    )}
                  />
                  <Controller
                    name='employmentType'
                    control={control}
                    render={({ field }) => (
                      <SelectFormField
                        id='employee-edit-type'
                        label={m.employee_information_detail_field_employment_type()}
                        placeholder={m.employee_information_create_employment_type_placeholder()}
                        value={field.value}
                        onValueChange={field.onChange}
                        options={employmentTypeOptions}
                        error={errors.employmentType?.message}
                      />
                    )}
                  />
                  <Controller
                    name='joinDate'
                    control={control}
                    render={({ field }) => (
                      <DateFormField
                        label={m.employee_information_detail_field_join_date()}
                        placeholder={m.employee_information_create_join_date_placeholder()}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.joinDate?.message}
                      />
                    )}
                  />
                  <TextFormField
                    id='employee-edit-location'
                    label={m.employee_information_detail_field_work_location()}
                    error={errors.workLocation?.message}
                    registration={register('workLocation')}
                  />
                </FieldGroup>
              </TabsContent>

              <TabsContent value='status' className='pt-4'>
                <FieldGroup>
                  <FieldGroup className='grid sm:grid-cols-2'>
                    <Field>
                      <FieldLabel htmlFor='employee-edit-current-status'>
                        {m.employee_information_edit_current_status()}
                      </FieldLabel>
                      <Input
                        id='employee-edit-current-status'
                        value={getStatusLabel(employee.status)}
                        readOnly
                      />
                    </Field>
                    <Controller
                      name='status'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-status'
                          label={m.employee_information_edit_new_status()}
                          placeholder={m.employee_information_edit_status_placeholder()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={statusOptions}
                          error={errors.status?.message}
                        />
                      )}
                    />
                    <Controller
                      name='employmentType'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-status-employment-type'
                          label={m.employee_information_edit_employment_status()}
                          placeholder={m.employee_information_create_employment_type_placeholder()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={employmentTypeOptions}
                          error={errors.employmentType?.message}
                        />
                      )}
                    />
                    <Controller
                      name='statusEffectiveDate'
                      control={control}
                      render={({ field }) => (
                        <DateFormField
                          label={m.employee_information_edit_effective_date()}
                          placeholder={m.employee_information_create_join_date_placeholder()}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.statusEffectiveDate?.message}
                        />
                      )}
                    />
                    <Controller
                      name='statusReason'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-status-reason'
                          label={m.employee_information_edit_status_reason()}
                          placeholder={m.employee_information_edit_status_reason()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={statusReasonOptions}
                          error={errors.statusReason?.message}
                        />
                      )}
                    />
                    <Controller
                      name='lastWorkingDate'
                      control={control}
                      render={({ field }) => (
                        <DateFormField
                          label={m.employee_information_edit_last_working_date()}
                          placeholder={m.employee_information_create_join_date_placeholder()}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.lastWorkingDate?.message}
                        />
                      )}
                    />
                    <Field className='sm:col-span-2' data-invalid={!!errors.statusNotes}>
                      <FieldLabel htmlFor='employee-edit-status-notes'>
                        {m.employee_information_edit_status_notes()}
                      </FieldLabel>
                      <Textarea
                        id='employee-edit-status-notes'
                        className='min-h-24'
                        placeholder={m.employee_information_edit_status_notes_placeholder()}
                        aria-invalid={!!errors.statusNotes}
                        {...register('statusNotes')}
                      />
                      <FieldError>{errors.statusNotes?.message}</FieldError>
                    </Field>
                  </FieldGroup>

                  <Card className='border-amber-300 bg-amber-50 shadow-none dark:bg-amber-950/20'>
                    <CardContent className='text-xs text-amber-800 dark:text-amber-300'>
                      <p className='font-semibold'>
                        {m.employee_information_edit_status_impact_title()}
                      </p>
                      <p className='mt-1'>
                        {m.employee_information_edit_status_impact_description()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className='bg-muted/20 shadow-none'>
                    <CardHeader>
                      <CardTitle className='text-sm'>
                        {m.employee_information_edit_status_history_title()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-3 text-xs'>
                      {(employee.statusHistory?.length
                        ? employee.statusHistory
                        : [
                            {
                              id: 'current-status',
                              status: employee.status,
                              employmentType: employee.employmentType,
                              effectiveDate: employee.joinDate,
                              reason: null,
                            },
                          ]
                      ).map((history) => (
                        <div key={history.id} className='border-b pb-3 last:border-0 last:pb-0'>
                          <p className='font-medium'>
                            {dayjs(history.effectiveDate).format('DD MMM YYYY')} ·{' '}
                            {getStatusLabel(history.status)} ·{' '}
                            {getEmploymentTypeLabel(history.employmentType)}
                          </p>
                          <p className='mt-1 text-muted-foreground'>
                            {history.reason ?? m.employee_information_edit_status_history_created()}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </FieldGroup>
              </TabsContent>

              <TabsContent value='photo' className='pt-4'>
                <FieldGroup>
                  <Field data-invalid={!!errors.profilePhoto}>
                    <FieldLabel>{m.employee_information_edit_current_photo()}</FieldLabel>
                    <div className='flex flex-col items-center gap-3 py-2'>
                      <Avatar className='size-32'>
                        <AvatarImage src={photoPreview} alt={employee.fullName} />
                        <AvatarFallback className='bg-primary/10 text-3xl font-bold text-primary'>
                          {getInitials(values.fullName || employee.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <Badge variant='green'>
                        {m.employee_information_edit_photo_current_badge()}
                      </Badge>
                    </div>
                    <Input
                      ref={photoInputRef}
                      className='sr-only'
                      type='file'
                      accept={PHOTO_TYPES.join(',')}
                      onChange={(event) => {
                        setValue('profilePhoto', event.target.files?.[0], { shouldValidate: true })
                        setValue('removeProfilePhoto', false)
                      }}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      className='h-28 w-full flex-col border-dashed px-3 text-center whitespace-normal'
                      onClick={() => photoInputRef.current?.click()}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault()
                        setValue('profilePhoto', event.dataTransfer.files?.[0], {
                          shouldValidate: true,
                        })
                        setValue('removeProfilePhoto', false)
                      }}
                    >
                      <IconUpload className='size-6' />
                      <span>{m.employee_information_edit_photo_dropzone()}</span>
                      <span className='text-xs font-normal text-muted-foreground'>
                        {m.employee_information_edit_photo_hint()}
                      </span>
                    </Button>
                    {profilePhoto && (
                      <p className='text-center text-xs text-muted-foreground'>
                        {m.employee_information_edit_photo_new({ name: profilePhoto.name })}
                      </p>
                    )}
                    <div className='grid grid-cols-2 gap-3'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                          setValue('profilePhoto', undefined, { shouldValidate: true })
                          setValue('removeProfilePhoto', true)
                        }}
                        disabled={!employee.avatarUrl && !profilePhoto}
                      >
                        <IconTrash />
                        {m.employee_information_edit_photo_remove()}
                      </Button>
                      <Button type='button' onClick={() => photoInputRef.current?.click()}>
                        <IconPhoto />
                        {m.employee_information_edit_photo_replace()}
                      </Button>
                    </div>
                    <FieldError>{errors.profilePhoto?.message}</FieldError>
                  </Field>
                  <Card className='border-primary/20 bg-primary/5 shadow-none'>
                    <CardContent className='text-xs text-primary'>
                      <p className='font-semibold'>
                        {m.employee_information_edit_photo_usage_title()}
                      </p>
                      <p className='mt-1'>
                        {m.employee_information_edit_photo_usage_description()}
                      </p>
                    </CardContent>
                  </Card>
                </FieldGroup>
              </TabsContent>

              <TabsContent value='bank' className='pt-4'>
                <FieldGroup>
                  <FieldGroup className='grid sm:grid-cols-2'>
                    <TextFormField
                      id='employee-edit-bank-holder'
                      label={m.employee_information_detail_field_bank_holder()}
                      error={errors.bankAccountHolder?.message}
                      registration={register('bankAccountHolder')}
                    />
                    <Controller
                      name='bankId'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-bank'
                          label={m.employee_information_detail_field_bank_name()}
                          placeholder={m.employee_information_create_bank_placeholder()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={toOptions(options?.banks)}
                          error={errors.bankId?.message}
                        />
                      )}
                    />
                    <TextFormField
                      id='employee-edit-bank-number'
                      label={m.employee_information_detail_field_bank_number()}
                      error={errors.bankAccountNumber?.message}
                      registration={register('bankAccountNumber')}
                    />
                    <TextFormField
                      id='employee-edit-bank-branch'
                      label={m.employee_information_edit_bank_branch()}
                      error={errors.bankBranch?.message}
                      registration={register('bankBranch')}
                    />
                    <Controller
                      name='bankAccountType'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-bank-account-type'
                          label={m.employee_information_edit_bank_account_type()}
                          placeholder={m.employee_information_edit_bank_account_type()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={[
                            {
                              value: 'Savings',
                              label: m.employee_information_edit_bank_savings(),
                            },
                            {
                              value: 'Checking',
                              label: m.employee_information_edit_bank_checking(),
                            },
                          ]}
                          error={errors.bankAccountType?.message}
                        />
                      )}
                    />
                    <Controller
                      name='currency'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-bank-currency'
                          label={m.employee_information_edit_bank_currency()}
                          placeholder={m.employee_information_edit_bank_currency()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={[
                            { value: 'IDR', label: 'IDR' },
                            { value: 'USD', label: 'USD' },
                            { value: 'SGD', label: 'SGD' },
                          ]}
                          error={errors.currency?.message}
                        />
                      )}
                    />
                    <Controller
                      name='bankEffectiveDate'
                      control={control}
                      render={({ field }) => (
                        <DateFormField
                          label={m.employee_information_edit_effective_date()}
                          placeholder={m.employee_information_create_join_date_placeholder()}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.bankEffectiveDate?.message}
                        />
                      )}
                    />
                    <Controller
                      name='payrollAccount'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-bank-payroll-account'
                          label={m.employee_information_edit_bank_payroll_account()}
                          placeholder={m.employee_information_edit_bank_payroll_account()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={yesNoOptions}
                          error={errors.payrollAccount?.message}
                        />
                      )}
                    />
                  </FieldGroup>

                  <Card className='bg-muted/20 shadow-none'>
                    <CardHeader className='grid grid-cols-[1fr_auto] items-center'>
                      <CardTitle className='text-sm'>
                        {m.employee_information_edit_bank_verification_title()}
                      </CardTitle>
                      <Badge
                        variant={
                          employee.financialAndCompliance.bankVerification?.status === 'Verified'
                            ? 'green'
                            : 'amber'
                        }
                      >
                        {employee.financialAndCompliance.bankVerification?.status === 'Verified'
                          ? m.employee_information_edit_bank_verified()
                          : m.employee_information_edit_bank_pending()}
                      </Badge>
                    </CardHeader>
                    <CardContent className='flex flex-col items-start gap-3'>
                      {employee.financialAndCompliance.bankVerification?.verifiedAt && (
                        <p className='text-xs text-muted-foreground'>
                          {m.employee_information_edit_bank_last_verified({
                            date: dayjs(
                              employee.financialAndCompliance.bankVerification.verifiedAt,
                            ).format('DD MMM YYYY'),
                          })}
                        </p>
                      )}
                      <Button
                        type='button'
                        variant='outline'
                        disabled={bankVerificationMutation.isPending}
                        onClick={() =>
                          bankVerificationMutation.mutate(employee.id, {
                            onSuccess: () =>
                              snackbar.success(
                                m.employee_information_edit_bank_reverify_success(),
                              ),
                            onError: (error) => snackbar.exception(error),
                          })
                        }
                      >
                        {bankVerificationMutation.isPending && <Spinner />}
                        {m.employee_information_edit_bank_reverify()}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className='border-amber-300 bg-amber-50 shadow-none dark:bg-amber-950/20'>
                    <CardContent className='text-xs text-amber-800 dark:text-amber-300'>
                      <p className='font-semibold'>
                        {m.employee_information_edit_sensitive_title()}
                      </p>
                      <p className='mt-1'>
                        {m.employee_information_edit_bank_sensitive_description()}
                      </p>
                    </CardContent>
                  </Card>
                </FieldGroup>
              </TabsContent>

              <TabsContent value='npwp' className='pt-4'>
                <FieldGroup>
                  <FieldGroup className='grid sm:grid-cols-2'>
                    <TextFormField
                      id='employee-edit-npwp'
                      label={m.employee_information_detail_field_npwp_number()}
                      error={errors.npwpNumber?.message}
                      registration={register('npwpNumber')}
                    />
                    <TextFormField
                      id='employee-edit-npwp-registered-name'
                      label={m.employee_information_edit_npwp_registered_name()}
                      error={errors.npwpRegisteredName?.message}
                      registration={register('npwpRegisteredName')}
                    />
                    <Controller
                      name='npwpStatus'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-npwp-status'
                          label={m.employee_information_detail_field_npwp_status()}
                          placeholder={m.employee_information_edit_npwp_status_placeholder()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={[
                            { value: 'Active', label: m.employee_information_status_active() },
                            { value: 'Inactive', label: m.employee_information_status_inactive() },
                          ]}
                          error={errors.npwpStatus?.message}
                        />
                      )}
                    />
                    <TextFormField
                      id='employee-edit-npwp-tax-category'
                      label={m.employee_information_edit_npwp_tax_category()}
                      error={errors.taxCategory?.message}
                      registration={register('taxCategory')}
                    />
                    <Controller
                      name='npwpEffectiveDate'
                      control={control}
                      render={({ field }) => (
                        <DateFormField
                          label={m.employee_information_edit_effective_date()}
                          placeholder={m.employee_information_create_join_date_placeholder()}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.npwpEffectiveDate?.message}
                        />
                      )}
                    />
                    <TextFormField
                      id='employee-edit-npwp-tax-office'
                      label={m.employee_information_edit_npwp_tax_office()}
                      error={errors.taxOffice?.message}
                      registration={register('taxOffice')}
                    />
                  </FieldGroup>

                  <Card className='bg-muted/20 shadow-none'>
                    <CardHeader>
                      <CardTitle className='text-sm'>
                        {m.employee_information_edit_npwp_document_title()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-3'>
                      <Input
                        ref={npwpDocumentInputRef}
                        className='sr-only'
                        type='file'
                        accept={DOCUMENT_TYPES.join(',')}
                        onChange={(event) =>
                          setValue('npwpDocument', event.target.files?.[0], {
                            shouldValidate: true,
                          })
                        }
                      />
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <IconFileText className='size-4' />
                        <span className='truncate'>
                          {npwpDocument
                            ? m.employee_information_edit_document_selected({
                                name: npwpDocument.name,
                              })
                            : [
                                employee.financialAndCompliance.npwpDocument?.fileName,
                                formatFileSize(
                                  employee.financialAndCompliance.npwpDocument?.fileSize,
                                ),
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 gap-3'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => npwpDocumentInputRef.current?.click()}
                        >
                          <IconUpload />
                          {employee.financialAndCompliance.npwpDocument
                            ? m.employee_information_edit_document_replace()
                            : m.employee_information_edit_document_upload()}
                        </Button>
                        {employee.financialAndCompliance.npwpDocument?.url ? (
                          <Button asChild variant='outline'>
                            <a
                              href={employee.financialAndCompliance.npwpDocument.url}
                              download
                            >
                              <IconDownload />
                              {m.employee_information_edit_document_download()}
                            </a>
                          </Button>
                        ) : (
                          <Button type='button' variant='outline' disabled>
                            <IconDownload />
                            {m.employee_information_edit_document_download()}
                          </Button>
                        )}
                      </div>
                      <FieldError>{errors.npwpDocument?.message}</FieldError>
                    </CardContent>
                  </Card>

                  <Card className='border-amber-300 bg-amber-50 shadow-none dark:bg-amber-950/20'>
                    <CardContent className='text-xs text-amber-800 dark:text-amber-300'>
                      <p className='font-semibold'>
                        {m.employee_information_edit_sensitive_title()}
                      </p>
                      <p className='mt-1'>
                        {m.employee_information_edit_npwp_sensitive_description()}
                      </p>
                    </CardContent>
                  </Card>
                </FieldGroup>
              </TabsContent>

              <TabsContent value='mcu' className='pt-4'>
                <FieldGroup>
                  <FieldGroup className='grid sm:grid-cols-2'>
                    <Controller
                      name='lastCheckupDate'
                      control={control}
                      render={({ field }) => (
                        <DateFormField
                          label={m.employee_information_edit_mcu_date()}
                          placeholder={m.employee_information_create_join_date_placeholder()}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.lastCheckupDate?.message}
                        />
                      )}
                    />
                    <TextFormField
                      id='employee-edit-mcu-provider'
                      label={m.employee_information_edit_mcu_provider()}
                      error={errors.medicalProvider?.message}
                      registration={register('medicalProvider')}
                    />
                    <Controller
                      name='examinationType'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-mcu-examination-type'
                          label={m.employee_information_edit_mcu_examination_type()}
                          placeholder={m.employee_information_edit_mcu_examination_type()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={[
                            {
                              value: 'AnnualMCU',
                              label: m.employee_information_edit_mcu_exam_annual(),
                            },
                            {
                              value: 'PreEmployment',
                              label: m.employee_information_edit_mcu_exam_pre_employment(),
                            },
                            {
                              value: 'FollowUp',
                              label: m.employee_information_edit_mcu_exam_follow_up(),
                            },
                          ]}
                          error={errors.examinationType?.message}
                        />
                      )}
                    />
                    <Controller
                      name='medicalStatus'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-mcu-status'
                          label={m.employee_information_edit_mcu_status()}
                          placeholder={m.employee_information_edit_mcu_status_placeholder()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={[
                            { value: 'Fit', label: m.employee_information_edit_mcu_fit() },
                            {
                              value: 'FitWithNote',
                              label: m.employee_information_edit_mcu_fit_with_note(),
                            },
                            { value: 'Unfit', label: m.employee_information_edit_mcu_unfit() },
                          ]}
                          error={errors.medicalStatus?.message}
                        />
                      )}
                    />
                    <Controller
                      name='dueDate'
                      control={control}
                      render={({ field }) => (
                        <DateFormField
                          label={m.employee_information_edit_mcu_next_due()}
                          placeholder={m.employee_information_create_join_date_placeholder()}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.dueDate?.message}
                        />
                      )}
                    />
                    <Controller
                      name='followUpRequired'
                      control={control}
                      render={({ field }) => (
                        <SelectFormField
                          id='employee-edit-mcu-follow-up'
                          label={m.employee_information_edit_mcu_follow_up()}
                          placeholder={m.employee_information_edit_mcu_follow_up()}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={yesNoOptions}
                          error={errors.followUpRequired?.message}
                        />
                      )}
                    />
                    <Field className='sm:col-span-2' data-invalid={!!errors.administrativeNote}>
                      <FieldLabel htmlFor='employee-edit-mcu-note'>
                        {m.employee_information_edit_mcu_note()}
                      </FieldLabel>
                      <Textarea
                        id='employee-edit-mcu-note'
                        className='min-h-24'
                        aria-invalid={!!errors.administrativeNote}
                        {...register('administrativeNote')}
                      />
                      <FieldError>{errors.administrativeNote?.message}</FieldError>
                    </Field>
                  </FieldGroup>

                  <Card className='bg-muted/20 shadow-none'>
                    <CardHeader>
                      <CardTitle className='text-sm'>
                        {m.employee_information_edit_mcu_document_title()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col items-start gap-3'>
                      <Input
                        ref={medicalCheckupDocumentInputRef}
                        className='sr-only'
                        type='file'
                        accept={DOCUMENT_TYPES.join(',')}
                        onChange={(event) =>
                          setValue('medicalCheckupDocument', event.target.files?.[0], {
                            shouldValidate: true,
                          })
                        }
                      />
                      <p className='text-xs text-muted-foreground'>
                        {medicalCheckupDocument
                          ? m.employee_information_edit_document_selected({
                              name: medicalCheckupDocument.name,
                            })
                          : m.employee_information_edit_mcu_document_hint()}
                      </p>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => medicalCheckupDocumentInputRef.current?.click()}
                      >
                        <IconUpload />
                        {employee.medicalCheckup.document
                          ? m.employee_information_edit_document_replace()
                          : m.employee_information_edit_document_upload()}
                      </Button>
                      <FieldError>{errors.medicalCheckupDocument?.message}</FieldError>
                    </CardContent>
                  </Card>

                  <Card className='border-primary/20 bg-primary/5 shadow-none'>
                    <CardContent className='text-xs text-primary'>
                      <p className='font-semibold'>
                        {m.employee_information_edit_mcu_reminder_title()}
                      </p>
                      <p className='mt-1'>
                        {m.employee_information_edit_mcu_reminder_description()}
                      </p>
                    </CardContent>
                  </Card>
                </FieldGroup>
              </TabsContent>
            </Tabs>

            {(activeTab === 'personal' || activeTab === 'employment') && (
              <div className='mt-5 flex gap-2 rounded-lg border border-primary/10 bg-primary/5 p-4 text-xs text-primary'>
                <IconInfoCircle className='size-4 shrink-0' />
                <div>
                  <p className='font-semibold'>{m.employee_information_edit_audit_title()}</p>
                  <p className='mt-1'>{m.employee_information_edit_audit_description()}</p>
                </div>
              </div>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
