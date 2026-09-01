import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconInfoCircle,
  IconPhoto,
  IconTrash,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { DatePicker } from '@/shared/components/ui/date-picker'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import {
  useCreateEmployeeInformation,
  useGetEmployeeCreationOptions,
} from '@/features/company/employee-information/hooks'
import type { EmployeeInformationEmploymentType } from '@/features/company/employee-information/types'
import { m } from '@/i18n/paraglide/messages'

const MAX_PHOTO_SIZE = 2 * 1024 * 1024
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const PERSONAL_FIELDS = [
  'employeeNumber',
  'fullName',
  'workEmail',
  'phoneNumber',
  'gender',
  'birthDate',
  'address',
  'profilePhoto',
] as const
const EMPLOYMENT_FIELDS = [
  'departmentId',
  'divisionId',
  'positionId',
  'gradeId',
  'branchId',
  'managerId',
  'employmentType',
  'joinDate',
  'workLocation',
] as const
const PAYROLL_FIELDS = [
  'bankId',
  'bankAccountNumber',
  'bankAccountHolder',
  'npwpNumber',
  'bpjsHealthNumber',
  'bpjsEmploymentNumber',
] as const

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  return initials || 'EE'
}

function getEmploymentTypeLabel(type: EmployeeInformationEmploymentType) {
  return {
    Permanent: m.employee_information_type_permanent(),
    Contract: m.employee_information_type_contract(),
    Internship: m.employee_information_type_internship(),
    Freelance: m.employee_information_type_freelance(),
  }[type]
}

export function CreateEmployeeInformationPage() {
  const navigate = useNavigate()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const optionsQuery = useGetEmployeeCreationOptions()
  const createMutation = useCreateEmployeeInformation()
  const formSchema = useSchema((z) => ({
    employeeNumber: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_create_employee_number_required() })
      .regex(/^[A-Za-z0-9_-]{3,30}$/, {
        message: m.employee_information_create_employee_number_invalid(),
      }),
    fullName: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_create_full_name_required() })
      .max(120),
    workEmail: z.email({ message: m.employee_information_create_email_invalid() }),
    phoneNumber: z
      .string()
      .trim()
      .refine((value) => !value || (value.length >= 6 && value.length <= 30), {
        message: m.employee_information_create_phone_invalid(),
      }),
    gender: z.enum(['Male', 'Female']).optional(),
    birthDate: z.string().refine((value) => !value || !dayjs(value).isAfter(dayjs(), 'day'), {
      message: m.employee_information_create_birth_date_invalid(),
    }),
    address: z
      .string()
      .trim()
      .max(500, { message: m.employee_information_create_address_invalid() }),
    profilePhoto: z
      .custom<File>()
      .optional()
      .refine((file) => !file || PHOTO_TYPES.includes(file.type), {
        message: m.employee_information_create_photo_invalid(),
      })
      .refine((file) => !file || file.size <= MAX_PHOTO_SIZE, {
        message: m.employee_information_create_photo_too_large(),
      }),
    departmentId: z
      .string()
      .min(1, { message: m.employee_information_create_department_required() }),
    divisionId: z.string().min(1, { message: m.employee_information_create_division_required() }),
    positionId: z.string().min(1, { message: m.employee_information_create_position_required() }),
    gradeId: z.string().min(1, { message: m.employee_information_create_grade_required() }),
    branchId: z.string().min(1, { message: m.employee_information_create_branch_required() }),
    managerId: z.string(),
    employmentType: z.enum(['Permanent', 'Contract', 'Internship', 'Freelance']),
    joinDate: z.string().min(1, { message: m.employee_information_create_join_date_required() }),
    workLocation: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_create_work_location_required() })
      .max(150),
    bankId: z.string().min(1, { message: m.employee_information_create_bank_required() }),
    bankAccountNumber: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_create_bank_account_required() })
      .max(50),
    bankAccountHolder: z
      .string()
      .trim()
      .min(1, { message: m.employee_information_create_bank_holder_required() })
      .max(120),
    npwpNumber: z
      .string()
      .trim()
      .max(50, { message: m.employee_information_create_identifier_invalid() }),
    bpjsHealthNumber: z
      .string()
      .trim()
      .max(50, { message: m.employee_information_create_identifier_invalid() }),
    bpjsEmploymentNumber: z
      .string()
      .trim()
      .max(50, { message: m.employee_information_create_identifier_invalid() }),
  }))
  type FormValues = z.infer<typeof formSchema>
  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeNumber: '',
      fullName: '',
      workEmail: '',
      phoneNumber: '',
      birthDate: '',
      address: '',
      departmentId: '',
      divisionId: '',
      positionId: '',
      gradeId: '',
      branchId: '',
      managerId: '',
      employmentType: 'Permanent',
      joinDate: '',
      workLocation: '',
      bankId: '',
      bankAccountNumber: '',
      bankAccountHolder: '',
      npwpNumber: '',
      bpjsHealthNumber: '',
      bpjsEmploymentNumber: '',
    },
  })
  const values = useWatch({ control })
  const profilePhoto = useWatch({ control, name: 'profilePhoto' })
  const photoPreview = useMemo(
    () => (profilePhoto ? URL.createObjectURL(profilePhoto) : undefined),
    [profilePhoto],
  )

  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    },
    [photoPreview],
  )

  if (optionsQuery.isPending || optionsQuery.error || !optionsQuery.data) {
    return (
      <AppMain
        pending={optionsQuery.isPending}
        error={optionsQuery.error}
        retry={() => void optionsQuery.refetch()}
        notFound={!optionsQuery.data}
      />
    )
  }

  const options = optionsQuery.data
  const positions = options.positions.filter(
    (position) => !values.departmentId || position.departmentId === values.departmentId,
  )
  const steps = [
    m.employee_information_create_step_personal(),
    m.employee_information_create_step_employment(),
    m.employee_information_create_step_payroll(),
    m.employee_information_create_step_review(),
  ]
  const findName = (items: Array<{ id: string; name: string }>, id?: string) =>
    items.find((item) => item.id === id)?.name
  const departmentName = findName(options.departments, values.departmentId)
  const divisionName = findName(options.divisions, values.divisionId)
  const positionName = findName(options.positions, values.positionId)
  const branchName = findName(options.branches, values.branchId)
  const bankName = findName(options.banks, values.bankId)
  const notProvided = m.employee_information_create_not_provided()

  const continueToNextStep = async () => {
    const fields = [PERSONAL_FIELDS, EMPLOYMENT_FIELDS, PAYROLL_FIELDS][currentStep]
    if (!fields) return
    const valid = await trigger(fields as readonly FieldPath<FormValues>[])
    if (valid) setCurrentStep((step) => Math.min(step + 1, 3))
  }

  const submitEmployee = (formValues: FormValues, status: 'Draft' | 'Active') => {
    createMutation.mutate(
      {
        payload: {
          status,
          personalInformation: {
            employeeNumber: formValues.employeeNumber,
            fullName: formValues.fullName,
            workEmail: formValues.workEmail,
            phoneNumber: formValues.phoneNumber || undefined,
            gender: formValues.gender,
            birthDate: formValues.birthDate || undefined,
            address: formValues.address || undefined,
          },
          employmentInformation: {
            departmentId: formValues.departmentId,
            divisionId: formValues.divisionId,
            positionId: formValues.positionId,
            gradeId: formValues.gradeId,
            branchId: formValues.branchId,
            managerId: formValues.managerId || undefined,
            employmentType: formValues.employmentType,
            joinDate: formValues.joinDate,
            workLocation: formValues.workLocation,
          },
          payrollAndIdentification: {
            bankId: formValues.bankId,
            bankAccountNumber: formValues.bankAccountNumber,
            bankAccountHolder: formValues.bankAccountHolder,
            npwpNumber: formValues.npwpNumber || undefined,
            bpjsHealthNumber: formValues.bpjsHealthNumber || undefined,
            bpjsEmploymentNumber: formValues.bpjsEmploymentNumber || undefined,
          },
        },
        profilePhoto: formValues.profilePhoto,
      },
      {
        onSuccess: () => {
          snackbar.success(
            status === 'Draft'
              ? m.employee_information_create_draft_success()
              : m.employee_information_create_success(),
          )
          void navigate({ to: '/company/employee-info' })
        },
        onError: (error) => snackbar.exception(error),
      },
    )
  }

  return (
    <AppMain
      breadcrumbs={[
        { label: m.app_layout_nav_company() },
        { to: '/company/employee-info', label: m.employee_information_title() },
        { label: m.employee_information_create_title() },
      ]}
      backTo='/company/employee-info'
      title={
        currentStep === 3
          ? m.employee_information_create_review_title()
          : m.employee_information_create_title()
      }
      subtitle={
        currentStep === 3
          ? m.employee_information_create_review_description()
          : m.employee_information_create_subtitle()
      }
    >
      <form
        className='flex min-w-0 flex-col gap-5'
        onSubmit={handleSubmit((formValues) => submitEmployee(formValues, 'Active'))}
        noValidate
      >
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
          {steps.map((step, index) => (
            <Button
              key={step}
              type='button'
              variant={currentStep === index ? 'default' : 'outline'}
              className={cn(
                'h-auto justify-start gap-2 py-3',
                index < currentStep && 'border-primary text-primary',
              )}
              onClick={() => index < currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border text-xs',
                  currentStep === index && 'border-primary-foreground',
                )}
              >
                {index < currentStep ? <IconCheck className='size-3.5' /> : index + 1}
              </span>
              <span className='truncate'>{step}</span>
            </Button>
          ))}
        </div>

        {currentStep === 0 && (
          <div className='grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_15rem]'>
            <Card className='min-w-0'>
              <CardHeader>
                <CardTitle>{m.employee_information_create_personal_title()}</CardTitle>
                <CardDescription>
                  {m.employee_information_create_personal_description()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className='grid md:grid-cols-2'>
                  <Field data-invalid={!!errors.employeeNumber}>
                    <FieldLabel htmlFor='employee-create-number'>
                      {m.employee_information_create_employee_number_label()}
                    </FieldLabel>
                    <Input
                      id='employee-create-number'
                      placeholder={m.employee_information_create_employee_number_placeholder()}
                      aria-invalid={!!errors.employeeNumber}
                      {...register('employeeNumber')}
                    />
                    <FieldError
                      errors={errors.employeeNumber ? [errors.employeeNumber] : undefined}
                    />
                  </Field>
                  <Field data-invalid={!!errors.fullName}>
                    <FieldLabel htmlFor='employee-create-name'>
                      {m.employee_information_create_full_name_label()}
                    </FieldLabel>
                    <Input
                      id='employee-create-name'
                      placeholder={m.employee_information_create_full_name_placeholder()}
                      aria-invalid={!!errors.fullName}
                      {...register('fullName')}
                    />
                    <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
                  </Field>
                  <Field data-invalid={!!errors.workEmail}>
                    <FieldLabel htmlFor='employee-create-email'>
                      {m.employee_information_create_email_label()}
                    </FieldLabel>
                    <Input
                      id='employee-create-email'
                      type='email'
                      placeholder={m.employee_information_create_email_placeholder()}
                      aria-invalid={!!errors.workEmail}
                      {...register('workEmail')}
                    />
                    <FieldError errors={errors.workEmail ? [errors.workEmail] : undefined} />
                  </Field>
                  <Field data-invalid={!!errors.phoneNumber}>
                    <FieldLabel htmlFor='employee-create-phone'>
                      {m.employee_information_create_phone_label()}
                    </FieldLabel>
                    <Input
                      id='employee-create-phone'
                      type='tel'
                      placeholder={m.employee_information_create_phone_placeholder()}
                      aria-invalid={!!errors.phoneNumber}
                      {...register('phoneNumber')}
                    />
                    <FieldError errors={errors.phoneNumber ? [errors.phoneNumber] : undefined} />
                  </Field>
                  <Controller
                    name='gender'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.gender}>
                        <FieldLabel htmlFor='employee-create-gender'>
                          {m.employee_information_create_gender_label()}
                        </FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id='employee-create-gender'
                            className='w-full'
                            aria-invalid={!!errors.gender}
                          >
                            <SelectValue
                              placeholder={m.employee_information_create_gender_placeholder()}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {options.genders.map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {gender === 'Male'
                                    ? m.employee_information_create_gender_male()
                                    : m.employee_information_create_gender_female()}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError errors={errors.gender ? [errors.gender] : undefined} />
                      </Field>
                    )}
                  />
                  <Controller
                    name='birthDate'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.birthDate}>
                        <FieldLabel>{m.employee_information_create_birth_date_label()}</FieldLabel>
                        <DatePicker
                          mode='single'
                          className='w-full'
                          selected={field.value ? dayjs(field.value).toDate() : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                          }
                          placeholder={m.employee_information_create_birth_date_placeholder()}
                          aria-invalid={!!errors.birthDate}
                        />
                        <FieldError errors={errors.birthDate ? [errors.birthDate] : undefined} />
                      </Field>
                    )}
                  />
                  <Field className='md:col-span-2' data-invalid={!!errors.address}>
                    <FieldLabel htmlFor='employee-create-address'>
                      {m.employee_information_create_address_label()}
                    </FieldLabel>
                    <Textarea
                      id='employee-create-address'
                      placeholder={m.employee_information_create_address_placeholder()}
                      aria-invalid={!!errors.address}
                      {...register('address')}
                    />
                    <FieldError errors={errors.address ? [errors.address] : undefined} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <div className='flex flex-col gap-4'>
              <Card>
                <CardHeader>
                  <CardTitle>{m.employee_information_create_photo_title()}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center gap-4'>
                  <Avatar className='size-28 text-xl'>
                    <AvatarImage src={photoPreview} alt='' />
                    <AvatarFallback className='bg-primary/10 font-semibold text-primary'>
                      {getInitials(values.fullName || '')}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    ref={photoInputRef}
                    className='sr-only'
                    type='file'
                    accept={PHOTO_TYPES.join(',')}
                    onChange={(event) =>
                      setValue('profilePhoto', event.target.files?.[0], { shouldValidate: true })
                    }
                  />
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <IconPhoto />
                    {profilePhoto
                      ? m.employee_information_create_photo_change()
                      : m.employee_information_create_photo_upload()}
                  </Button>
                  {profilePhoto && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='text-destructive'
                      onClick={() => setValue('profilePhoto', undefined, { shouldValidate: true })}
                    >
                      <IconTrash />
                      {m.employee_information_create_photo_remove()}
                    </Button>
                  )}
                  <FieldDescription className='text-center'>
                    {m.employee_information_create_photo_hint()}
                  </FieldDescription>
                  <FieldError errors={errors.profilePhoto ? [errors.profilePhoto] : undefined} />
                </CardContent>
              </Card>
              <Card className='border-primary/10 bg-primary/5'>
                <CardContent className='flex gap-2 text-sm text-primary'>
                  <IconInfoCircle className='size-4 shrink-0' />
                  {m.employee_information_create_required_notice()}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>{m.employee_information_create_employment_title()}</CardTitle>
              <CardDescription>
                {m.employee_information_create_employment_description()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className='grid md:grid-cols-2'>
                <Controller
                  name='departmentId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.departmentId}>
                      <FieldLabel>{m.employee_information_create_department_label()}</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          setValue('positionId', '')
                        }}
                      >
                        <SelectTrigger className='w-full' aria-invalid={!!errors.departmentId}>
                          <SelectValue
                            placeholder={m.employee_information_create_department_placeholder()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {options.departments.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={errors.departmentId ? [errors.departmentId] : undefined}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name='divisionId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.divisionId}>
                      <FieldLabel htmlFor='employee-create-division'>
                        {m.employee_information_create_division_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id='employee-create-division'
                          className='w-full'
                          aria-invalid={!!errors.divisionId}
                        >
                          <SelectValue
                            placeholder={m.employee_information_create_division_placeholder()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {options.divisions.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={errors.divisionId ? [errors.divisionId] : undefined} />
                    </Field>
                  )}
                />
                <Controller
                  name='positionId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.positionId}>
                      <FieldLabel>{m.employee_information_create_position_label()}</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!values.departmentId}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue
                            placeholder={m.employee_information_create_position_placeholder()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={errors.positionId ? [errors.positionId] : undefined} />
                    </Field>
                  )}
                />
                <Controller
                  name='gradeId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.gradeId}>
                      <FieldLabel htmlFor='employee-create-grade'>
                        {m.employee_information_create_grade_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id='employee-create-grade'
                          className='w-full'
                          aria-invalid={!!errors.gradeId}
                        >
                          <SelectValue
                            placeholder={m.employee_information_create_grade_placeholder()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {options.grades.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={errors.gradeId ? [errors.gradeId] : undefined} />
                    </Field>
                  )}
                />
                <Controller
                  name='branchId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.branchId}>
                      <FieldLabel>{m.employee_information_create_branch_label()}</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue
                            placeholder={m.employee_information_create_branch_placeholder()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {options.branches.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={errors.branchId ? [errors.branchId] : undefined} />
                    </Field>
                  )}
                />
                <Controller
                  name='managerId'
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{m.employee_information_create_manager_label()}</FieldLabel>
                      <Select
                        value={field.value || 'none'}
                        onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue
                            placeholder={m.employee_information_create_manager_placeholder()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='none'>
                            {m.employee_information_create_manager_none()}
                          </SelectItem>
                          {options.managers.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  name='employmentType'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.employmentType}>
                      <FieldLabel>
                        {m.employee_information_create_employment_type_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {options.employmentTypes.map((item) => (
                            <SelectItem key={item} value={item}>
                              {getEmploymentTypeLabel(item)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  name='joinDate'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.joinDate}>
                      <FieldLabel>{m.employee_information_create_join_date_label()}</FieldLabel>
                      <DatePicker
                        mode='single'
                        className='w-full'
                        selected={field.value ? dayjs(field.value).toDate() : undefined}
                        onSelect={(date) =>
                          field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                        }
                        placeholder={m.employee_information_create_join_date_placeholder()}
                      />
                      <FieldError errors={errors.joinDate ? [errors.joinDate] : undefined} />
                    </Field>
                  )}
                />
                <Field data-invalid={!!errors.workLocation}>
                  <FieldLabel htmlFor='employee-create-location'>
                    {m.employee_information_create_work_location_label()}
                  </FieldLabel>
                  <Input
                    id='employee-create-location'
                    placeholder={m.employee_information_create_work_location_placeholder()}
                    aria-invalid={!!errors.workLocation}
                    {...register('workLocation')}
                  />
                  <FieldError errors={errors.workLocation ? [errors.workLocation] : undefined} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{m.employee_information_create_payroll_title()}</CardTitle>
              <CardDescription>
                {m.employee_information_create_payroll_description()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className='grid md:grid-cols-2'>
                <Controller
                  name='bankId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.bankId}>
                      <FieldLabel>{m.employee_information_create_bank_label()}</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full' aria-invalid={!!errors.bankId}>
                          <SelectValue
                            placeholder={m.employee_information_create_bank_placeholder()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {options.banks.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={errors.bankId ? [errors.bankId] : undefined} />
                    </Field>
                  )}
                />
                <Field data-invalid={!!errors.bankAccountNumber}>
                  <FieldLabel htmlFor='employee-create-bank-account'>
                    {m.employee_information_create_bank_account_label()}
                  </FieldLabel>
                  <Input
                    id='employee-create-bank-account'
                    placeholder={m.employee_information_create_bank_account_placeholder()}
                    aria-invalid={!!errors.bankAccountNumber}
                    {...register('bankAccountNumber')}
                  />
                  <FieldError
                    errors={errors.bankAccountNumber ? [errors.bankAccountNumber] : undefined}
                  />
                </Field>
                <Field data-invalid={!!errors.bankAccountHolder}>
                  <FieldLabel htmlFor='employee-create-bank-holder'>
                    {m.employee_information_create_bank_holder_label()}
                  </FieldLabel>
                  <Input
                    id='employee-create-bank-holder'
                    placeholder={m.employee_information_create_bank_holder_placeholder()}
                    aria-invalid={!!errors.bankAccountHolder}
                    {...register('bankAccountHolder')}
                  />
                  <FieldError
                    errors={errors.bankAccountHolder ? [errors.bankAccountHolder] : undefined}
                  />
                </Field>
                <Field data-invalid={!!errors.npwpNumber}>
                  <FieldLabel htmlFor='employee-create-npwp'>
                    {m.employee_information_create_npwp_label()}
                  </FieldLabel>
                  <Input
                    id='employee-create-npwp'
                    placeholder={m.employee_information_create_npwp_placeholder()}
                    aria-invalid={!!errors.npwpNumber}
                    {...register('npwpNumber')}
                  />
                  <FieldError errors={errors.npwpNumber ? [errors.npwpNumber] : undefined} />
                </Field>
                <Field data-invalid={!!errors.bpjsHealthNumber}>
                  <FieldLabel htmlFor='employee-create-bpjs-health'>
                    {m.employee_information_create_bpjs_health_label()}
                  </FieldLabel>
                  <Input
                    id='employee-create-bpjs-health'
                    placeholder={m.employee_information_create_bpjs_health_placeholder()}
                    aria-invalid={!!errors.bpjsHealthNumber}
                    {...register('bpjsHealthNumber')}
                  />
                  <FieldError
                    errors={errors.bpjsHealthNumber ? [errors.bpjsHealthNumber] : undefined}
                  />
                </Field>
                <Field data-invalid={!!errors.bpjsEmploymentNumber}>
                  <FieldLabel htmlFor='employee-create-bpjs-employment'>
                    {m.employee_information_create_bpjs_employment_label()}
                  </FieldLabel>
                  <Input
                    id='employee-create-bpjs-employment'
                    placeholder={m.employee_information_create_bpjs_employment_placeholder()}
                    aria-invalid={!!errors.bpjsEmploymentNumber}
                    {...register('bpjsEmploymentNumber')}
                  />
                  <FieldError
                    errors={errors.bpjsEmploymentNumber ? [errors.bpjsEmploymentNumber] : undefined}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <div className='flex min-w-0 flex-col gap-4'>
            <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              {[
                {
                  label: m.employee_information_create_review_employee(),
                  value: values.fullName,
                },
                {
                  label: m.employee_information_create_review_nip(),
                  value: values.employeeNumber,
                },
                {
                  label: m.employee_information_create_department_label(),
                  value: departmentName,
                },
                {
                  label: m.employee_information_create_position_label(),
                  value: positionName,
                },
              ].map((item) => (
                <Card key={item.label} className='gap-1 py-4'>
                  <CardContent>
                    <p className='text-xs text-muted-foreground'>{item.label}</p>
                    <p className='mt-2 truncate font-semibold'>{item.value || notProvided}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className='gap-1 py-4'>
              <CardContent>
                <p className='text-sm font-semibold'>
                  {m.employee_information_create_review_personal()}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {m.employee_information_create_review_personal_summary()}
                </p>
              </CardContent>
            </Card>
            <Card className='gap-1 py-4'>
              <CardContent>
                <p className='text-sm font-semibold'>
                  {m.employee_information_create_review_employment()}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {m.employee_information_create_review_employment_summary({
                    employmentType: values.employmentType
                      ? getEmploymentTypeLabel(values.employmentType)
                      : notProvided,
                    division: divisionName || notProvided,
                    department: departmentName || notProvided,
                    branch: branchName || notProvided,
                  })}
                </p>
              </CardContent>
            </Card>
            <Card className='gap-1 py-4'>
              <CardContent>
                <p className='text-sm font-semibold'>
                  {m.employee_information_create_review_payroll()}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {m.employee_information_create_review_payroll_summary({
                    bank: bankName || notProvided,
                    accountEnding: values.bankAccountNumber?.slice(-4) || notProvided,
                  })}
                </p>
              </CardContent>
            </Card>

            <Card className='border-primary/10 bg-primary/5 py-4'>
              <CardContent className='flex gap-2 text-sm text-primary'>
                <IconInfoCircle className='size-4 shrink-0' />
                {m.employee_information_create_review_account_notice()}
              </CardContent>
            </Card>
          </div>
        )}

        <div className='flex flex-col-reverse justify-between gap-3 sm:flex-row'>
          {currentStep < 3 ? (
            <Button variant='outline' asChild>
              <Link to='/company/employee-info'>{m.employee_information_create_cancel()}</Link>
            </Button>
          ) : (
            <span />
          )}
          <div className='flex gap-2'>
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
            {currentStep < 3 ? (
              <Button type='button' onClick={() => void continueToNextStep()}>
                {m.employee_information_create_continue()}
                <IconArrowRight />
              </Button>
            ) : (
              <>
                <Button
                  type='button'
                  variant='outline'
                  disabled={createMutation.isPending}
                  onClick={() =>
                    void handleSubmit((formValues) => submitEmployee(formValues, 'Draft'))()
                  }
                >
                  {m.employee_information_create_save_draft()}
                </Button>
                <Button type='submit' disabled={createMutation.isPending}>
                  {createMutation.isPending && <Spinner />}
                  {m.employee_information_create_submit()}
                  <IconCheck />
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </AppMain>
  )
}
