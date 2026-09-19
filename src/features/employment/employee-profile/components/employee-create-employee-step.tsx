import { IconPhoto, IconTrash, IconUpload } from '@tabler/icons-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { FieldGroup } from '@/shared/components/ui/field'
import {
  employeeCreateValues,
  toSelectOptions,
  toValueOptions,
} from '@/features/employment/employee-profile/components/employee-create-form-config'
import {
  EmployeeDateField,
  EmployeeSelectField,
  EmployeeTextareaField,
  EmployeeTextField,
} from '@/features/employment/employee-profile/components/employee-create-form-fields'
import type { EmployeeCreationOptionsData } from '@/features/employment/employee-profile/types'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeCreateEmployeeStepProps {
  options: EmployeeCreationOptionsData
  onPhotoChange: (file: File | undefined) => void
}

function FormSection({
  title,
  description,
  children,
  className,
}: Readonly<{
  title: string
  description: string
  children: React.ReactNode
  className?: string
}>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function EmployeeCreateEmployeeStep({
  options,
  onPhotoChange,
}: EmployeeCreateEmployeeStepProps) {
  const { setValue } = useFormContext()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File>()
  const [photoError, setPhotoError] = useState('')
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false)
  const employeeStatus = useWatch({ name: 'employee.employeeStatus' })
  const fullName = useWatch({ name: 'employee.fullName' })
  const genderOptions = toValueOptions(
    options.genders.length ? options.genders : ['Male', 'Female'],
  )

  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : ''), [photo])

  useEffect(() => {
    if (photoPreview) return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const handlePhotoChange = (file?: File) => {
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError(m.employee_information_create_photo_invalid())
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError(m.employee_information_create_photo_too_large())
      return
    }

    setPhotoError('')
    setPhoto(file)
    onPhotoChange(file)
    setValue('employee.photoFileId', '')
  }

  const handlePhotoDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDraggingPhoto(false)
    handlePhotoChange(event.dataTransfer.files?.[0])
  }

  const removePhoto = () => {
    setPhoto(undefined)
    setPhotoError('')
    onPhotoChange(undefined)
    setValue('employee.photoFileId', '')
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const initials = fullName
    ? fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0])
        .join('')
        .toUpperCase()
    : 'EE'

  return (
    <div className='grid items-start gap-5'>
      <FormSection
        title={m.employee_information_create_identity_title()}
        description={m.employee_information_create_identity_description()}
      >
        <FieldGroup className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
          <div className='md:col-span-2 xl:col-span-4'>
            <div className='rounded-2xl border bg-muted/20 p-4 sm:p-5'>
              <div className='mb-4 flex items-start justify-between gap-3'>
                <div className='flex items-start gap-3'>
                  <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <IconPhoto className='size-5' />
                  </span>
                  <div>
                    <p className='text-sm font-semibold'>
                      {m.employee_information_create_photo_title()}
                    </p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {m.employee_information_create_photo_hint()}
                    </p>
                  </div>
                </div>
                {photo && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='text-muted-foreground hover:text-destructive'
                    onClick={removePhoto}
                  >
                    <IconTrash />
                    {m.employee_information_create_photo_remove()}
                  </Button>
                )}
              </div>

              <div className='grid items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)]'>
                <div className='flex justify-center md:justify-start'>
                  <div className='rounded-full bg-background p-1.5 shadow-sm ring-1 ring-border'>
                    <Avatar className='size-28 sm:size-32'>
                      <AvatarImage src={photoPreview} alt={fullName || 'Employee profile photo'} />
                      <AvatarFallback className='bg-primary/10 text-2xl font-bold text-primary'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <button
                  type='button'
                  className={`group flex min-h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed px-5 py-4 text-center transition-colors ${
                    isDraggingPhoto
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background/70 hover:border-primary/60 hover:bg-background'
                  }`}
                  onClick={() => photoInputRef.current?.click()}
                  onDragEnter={(event) => {
                    event.preventDefault()
                    setIsDraggingPhoto(true)
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => {
                    if (event.currentTarget === event.target) setIsDraggingPhoto(false)
                  }}
                  onDrop={handlePhotoDrop}
                >
                  <span className='mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105'>
                    <IconUpload className='size-5' />
                  </span>
                  <span className='text-sm font-semibold text-foreground'>
                    {photo
                      ? m.employee_information_create_photo_change()
                      : m.employee_information_create_photo_upload()}
                  </span>
                  <span className='mt-1 text-xs text-muted-foreground'>
                    {m.employee_information_create_photo_hint()}
                  </span>
                </button>
              </div>

              <input
                ref={photoInputRef}
                className='sr-only'
                type='file'
                accept='image/jpeg,image/png,image/webp'
                onChange={(event) => handlePhotoChange(event.target.files?.[0])}
              />
              {photo && (
                <div className='mt-4 flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs'>
                  <IconPhoto className='size-4 shrink-0 text-primary' />
                  <span className='min-w-0 flex-1 truncate' title={photo.name}>
                    {photo.name}
                  </span>
                  <span className='shrink-0 text-muted-foreground'>
                    {(photo.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
              {photoError && (
                <p className='mt-3 text-sm text-destructive' role='alert'>
                  {photoError}
                </p>
              )}
            </div>
          </div>
          <EmployeeTextField
            name='employee.employeeNumber'
            label={m.employee_information_create_employee_number_label()}
            required
          />
          <EmployeeTextField
            name='employee.fullName'
            label={m.employee_information_create_full_name_label()}
            required
          />
          <EmployeeTextField
            name='employee.personalEmail'
            label={m.employee_information_create_personal_email_label()}
            type='email'
            required
          />
          <EmployeeTextField
            name='employee.placeOfBirth'
            label={m.employee_information_create_place_of_birth_label()}
          />
          <EmployeeSelectField
            name='employee.gender'
            label={m.employee_information_create_gender_label()}
            options={genderOptions}
          />
          <EmployeeDateField
            name='employee.dateOfBirth'
            label={m.employee_information_create_birth_date_label()}
          />
          <EmployeeSelectField
            name='employee.citizenshipStatus'
            label={m.employee_information_create_citizenship_label()}
            options={toValueOptions(employeeCreateValues.citizenships)}
          />
          <EmployeeSelectField
            name='employee.maritalStatus'
            label={m.employee_information_create_marital_status_label()}
            options={toValueOptions(employeeCreateValues.maritalStatuses)}
          />
          <EmployeeSelectField
            name='employee.religion'
            label={m.employee_information_create_religion_label()}
            options={toValueOptions(employeeCreateValues.religions)}
          />
          <EmployeeSelectField
            name='employee.bloodType'
            label={m.employee_information_create_blood_type_label()}
            options={toValueOptions(employeeCreateValues.bloodTypes)}
          />
          <EmployeeTextField
            name='employee.ktpNumber'
            label={m.employee_information_create_ktp_label()}
          />
          <EmployeeTextField
            name='employee.kkNumber'
            label={m.employee_information_create_kk_label()}
          />
          <EmployeeTextField
            name='employee.motherMaidenName'
            label={m.employee_information_create_mother_maiden_name_label()}
          />
          <EmployeeSelectField
            name='employee.lastEducationLevel'
            label={m.employee_information_create_last_education_label()}
            options={toValueOptions(employeeCreateValues.educationLevels)}
          />
          <EmployeeTextField
            name='employee.heightCm'
            label={m.employee_information_create_height_label()}
            type='number'
          />
          <EmployeeTextField
            name='employee.weightKg'
            label={m.employee_information_create_weight_label()}
            type='number'
          />
        </FieldGroup>
      </FormSection>

      <FormSection
        title={m.employee_information_create_address_title()}
        description={m.employee_information_create_address_description()}
      >
        <FieldGroup className='grid gap-5 md:grid-cols-2'>
          <EmployeeTextField
            name='employee.phoneNumber'
            label={m.employee_information_create_phone_label()}
          />
          <EmployeeTextField
            name='employee.whatsappNumber'
            label={m.employee_information_create_whatsapp_label()}
          />
          <EmployeeTextareaField
            className='md:col-span-2'
            name='employee.address'
            label={m.employee_information_create_address_label()}
          />
          <EmployeeTextareaField
            className='md:col-span-2'
            name='employee.domicileAddress'
            label={m.employee_information_create_domicile_address_label()}
          />
          <EmployeeTextField
            name='employee.country'
            label={m.employee_information_create_country_label()}
          />
          <EmployeeTextField
            name='employee.province'
            label={m.employee_information_create_province_label()}
          />
          <EmployeeTextField
            name='employee.city'
            label={m.employee_information_create_city_label()}
          />
          <EmployeeTextField
            name='employee.district'
            label={m.employee_information_create_district_label()}
          />
          <EmployeeTextField
            name='employee.village'
            label={m.employee_information_create_village_label()}
          />
          <EmployeeTextField
            name='employee.postalCode'
            label={m.employee_information_create_postal_code_label()}
          />
          <EmployeeTextField
            name='employee.latitude'
            label={m.employee_information_create_latitude_label()}
            type='number'
          />
          <EmployeeTextField
            name='employee.longitude'
            label={m.employee_information_create_longitude_label()}
            type='number'
          />
        </FieldGroup>
      </FormSection>

      <FormSection
        title={m.employee_information_create_statutory_title()}
        description={m.employee_information_create_statutory_description()}
      >
        <FieldGroup className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          <EmployeeSelectField
            name='employee.employmentType'
            label={m.employee_information_create_employment_type_label()}
            options={toValueOptions(employeeCreateValues.employmentTypes)}
          />
          <EmployeeSelectField
            name='employee.employeeStatus'
            label={m.employee_information_create_employee_status_label()}
            options={toValueOptions(employeeCreateValues.employeeStatuses)}
          />
          <EmployeeDateField
            name='employee.hireDate'
            label={m.employee_information_create_join_date_label()}
            required
          />
          {employeeStatus === 'RESIGNED' && (
            <>
              <EmployeeDateField
                name='employee.resignDate'
                label={m.employee_information_create_resign_date_label()}
              />
              <EmployeeTextField
                name='employee.terminationReason'
                label={m.employee_information_create_termination_reason_label()}
              />
            </>
          )}
          <EmployeeTextField
            name='employee.attendanceMachineNumber'
            label={m.employee_information_create_attendance_number_label()}
          />
          <EmployeeTextField
            name='employee.drivingLicenseNumber'
            label={m.employee_information_create_driving_license_label()}
          />
          <EmployeeTextField
            name='employee.workPermitNumber'
            label={m.employee_information_create_work_permit_label()}
          />
          <EmployeeSelectField
            name='employee.bankId'
            label={m.employee_information_create_bank_label()}
            options={toSelectOptions(options.banks)}
          />
          <EmployeeTextField
            name='employee.bankAccountNumber'
            label={m.employee_information_create_bank_account_label()}
          />
          <EmployeeTextField
            name='employee.bankAccountHolderName'
            label={m.employee_information_create_bank_holder_label()}
          />
          <EmployeeTextField
            name='employee.npwpNumber'
            label={m.employee_information_create_npwp_label()}
          />
          <EmployeeTextField
            name='employee.bpjsKesehatanNumber'
            label={m.employee_information_create_bpjs_health_label()}
          />
          <EmployeeTextField
            name='employee.bpjsKetenagakerjaanNumber'
            label={m.employee_information_create_bpjs_employment_label()}
          />
        </FieldGroup>
      </FormSection>
    </div>
  )
}
