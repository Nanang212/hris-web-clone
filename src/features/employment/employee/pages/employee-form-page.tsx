// employee-form-page.tsx — Create / Update employee form

import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconLoader2, IconUser } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import {
  useCreateEmployee,
  useGetEmployeeById,
  useUpdateEmployee,
} from '@/features/employment/employee/hooks'
import type { ContractType, EmployeeStatus } from '@/features/employment/employee/types'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeFormPageProps {
  mode: 'create' | 'update'
  employeeId?: string
}

export function EmployeeFormPage({ mode, employeeId }: Readonly<EmployeeFormPageProps>) {
  const navigate = useNavigate()
  const isEdit = mode === 'update' && !!employeeId

  const formSchema = useSchema((z, m) => ({
    fullName: z.string().min(1, { message: m.employment_form_full_name_required() }),
    email: z.string().email({ message: m.employment_form_email_invalid() }),
    phone: z.string().min(6, { message: m.employment_form_phone_required() }),
    departmentId: z.string().min(1, { message: m.employment_form_department_required() }),
    divisionId: z.string().optional(),
    positionId: z.string().min(1, { message: m.employment_form_position_required() }),
    gradeId: z.string().min(1, { message: m.employment_form_grade_required() }),
    shiftId: z.string().min(1, { message: m.employment_form_shift_required() }),
    contractType: z.enum(['permanent', 'contract', 'internship', 'freelance'] as const, {
      message: m.employment_form_contract_type_required(),
    }),
    joinDate: z.string().min(1, { message: m.employment_form_join_date_required() }),
    endDate: z.string().optional(),
    workLocation: z.string().min(1, { message: m.employment_form_work_location_required() }),
    managerId: z.string().optional(),
    status: z
      .enum(['active', 'inactive', 'probation', 'resigned', 'terminated'] as const)
      .optional(),
  }))

  type FormValues = z.infer<typeof formSchema>

  const { data: existing, isPending: loadingExisting } = useGetEmployeeById(employeeId ?? '')
  const { mutate: createEmployee, isPending: creating } = useCreateEmployee()
  const { mutate: updateEmployee, isPending: updating } = useUpdateEmployee()

  const isPending = creating || updating

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      departmentId: '',
      divisionId: '',
      positionId: '',
      gradeId: '',
      shiftId: '',
      contractType: 'permanent',
      joinDate: '',
      endDate: '',
      workLocation: '',
      managerId: '',
      status: 'active',
    },
  })

  const contractType = watch('contractType')

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existing) {
      reset({
        fullName: existing.fullName,
        email: existing.email,
        phone: existing.phone,
        departmentId: existing.departmentId,
        divisionId: existing.divisionId ?? '',
        positionId: existing.positionId,
        gradeId: existing.gradeId,
        shiftId: '',
        contractType: existing.contractType,
        joinDate: existing.joinDate,
        endDate: existing.endDate ?? '',
        workLocation: existing.workLocation,
        managerId: existing.managerId ?? '',
        status: existing.status,
      })
    }
  }, [existing, isEdit, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      departmentId: values.departmentId,
      divisionId: values.divisionId || undefined,
      positionId: values.positionId,
      gradeId: values.gradeId,
      shiftId: values.shiftId,
      contractType: values.contractType as ContractType,
      joinDate: values.joinDate,
      endDate: values.endDate || undefined,
      workLocation: values.workLocation,
      managerId: values.managerId || undefined,
    }

    if (isEdit && employeeId) {
      updateEmployee(
        { id: employeeId, payload: { ...payload, status: values.status as EmployeeStatus } },
        {
          onSuccess: () => {
            snackbar.success(m.employment_form_update_success())
            navigate({ to: '/employment/employee/$id', params: { id: employeeId } })
          },
          onError: (err) => snackbar.exception(err),
        },
      )
    } else {
      createEmployee(payload, {
        onSuccess: (res) => {
          snackbar.success(m.employment_form_create_success())
          navigate({ to: '/employment/employee/$id', params: { id: res.data.id } })
        },
        onError: (err) => snackbar.exception(err),
      })
    }
  }

  const title = isEdit ? m.employment_form_edit_title() : m.employment_form_create_title()

  if (isEdit && loadingExisting) {
    return <AppMain pending />
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: 'Company' },
        { to: '/employment', label: m.employment_list_title() },
        { to: '.', label: title },
      ]}
      title={title}
      subtitle={isEdit ? m.employment_form_edit_subtitle() : m.employment_form_create_subtitle()}
      actions={
        <Link to='/employment'>
          <Button variant='outline' size='sm'>
            <IconArrowLeft data-icon='inline-start' />
            {m.employment_form_back_button()}
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='flex flex-col gap-6'>
          {/* Personal Data */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconUser size={16} className='text-primary' />
                Data Diri
              </CardTitle>
              <CardDescription>Informasi dasar identitas karyawan</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <Field data-invalid={!!errors.fullName}>
                    <FieldLabel htmlFor='fullName'>
                      {m.employment_form_full_name_label()}
                    </FieldLabel>
                    <Input
                      id='fullName'
                      placeholder={m.employment_form_full_name_placeholder()}
                      aria-invalid={!!errors.fullName}
                      {...register('fullName')}
                    />
                    <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor='email'>{m.employment_form_email_label()}</FieldLabel>
                    <Input
                      id='email'
                      type='email'
                      placeholder={m.employment_form_email_placeholder()}
                      aria-invalid={!!errors.email}
                      {...register('email')}
                    />
                    <FieldError errors={errors.email ? [errors.email] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.phone}>
                    <FieldLabel htmlFor='phone'>{m.employment_form_phone_label()}</FieldLabel>
                    <Input
                      id='phone'
                      placeholder={m.employment_form_phone_placeholder()}
                      aria-invalid={!!errors.phone}
                      {...register('phone')}
                    />
                    <FieldError errors={errors.phone ? [errors.phone] : undefined} />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Position & Organization */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Posisi & Organisasi</CardTitle>
              <CardDescription>Penempatan departemen, jabatan, dan grade</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <Field data-invalid={!!errors.departmentId}>
                    <FieldLabel htmlFor='departmentId'>
                      {m.employment_form_department_label()}
                    </FieldLabel>
                    <Controller
                      name='departmentId'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='departmentId' aria-invalid={!!errors.departmentId}>
                            <SelectValue placeholder='Pilih departemen' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='dept-1'>IT & Engineering</SelectItem>
                            <SelectItem value='dept-2'>Human Resource</SelectItem>
                            <SelectItem value='dept-3'>Finance & Accounting</SelectItem>
                            <SelectItem value='dept-4'>Marketing</SelectItem>
                            <SelectItem value='dept-5'>Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.departmentId ? [errors.departmentId] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.positionId}>
                    <FieldLabel htmlFor='positionId'>
                      {m.employment_form_position_label()}
                    </FieldLabel>
                    <Controller
                      name='positionId'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='positionId' aria-invalid={!!errors.positionId}>
                            <SelectValue placeholder='Pilih jabatan' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pos-1'>Software Engineer</SelectItem>
                            <SelectItem value='pos-2'>HR Manager</SelectItem>
                            <SelectItem value='pos-3'>Finance Analyst</SelectItem>
                            <SelectItem value='pos-4'>Marketing Specialist</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.positionId ? [errors.positionId] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.gradeId}>
                    <FieldLabel htmlFor='gradeId'>{m.employment_form_grade_label()}</FieldLabel>
                    <Controller
                      name='gradeId'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='gradeId' aria-invalid={!!errors.gradeId}>
                            <SelectValue placeholder='Pilih grade' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='grade-1'>Grade 1</SelectItem>
                            <SelectItem value='grade-2'>Grade 2</SelectItem>
                            <SelectItem value='grade-3'>Grade 3</SelectItem>
                            <SelectItem value='grade-4'>Grade 4</SelectItem>
                            <SelectItem value='grade-5'>Grade 5</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.gradeId ? [errors.gradeId] : undefined} />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Contract & Work */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Kontrak & Kerja</CardTitle>
              <CardDescription>Tipe kontrak, tanggal bergabung, dan shift kerja</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <Field data-invalid={!!errors.contractType}>
                    <FieldLabel htmlFor='contractType'>
                      {m.employment_form_contract_type_label()}
                    </FieldLabel>
                    <Controller
                      name='contractType'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='contractType' aria-invalid={!!errors.contractType}>
                            <SelectValue placeholder='Pilih tipe kontrak' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='permanent'>Karyawan Tetap</SelectItem>
                            <SelectItem value='contract'>Kontrak</SelectItem>
                            <SelectItem value='internship'>Magang</SelectItem>
                            <SelectItem value='freelance'>Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.contractType ? [errors.contractType] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.joinDate}>
                    <FieldLabel htmlFor='joinDate'>
                      {m.employment_form_join_date_label()}
                    </FieldLabel>
                    <Input
                      id='joinDate'
                      type='date'
                      aria-invalid={!!errors.joinDate}
                      {...register('joinDate')}
                    />
                    <FieldError errors={errors.joinDate ? [errors.joinDate] : undefined} />
                  </Field>

                  {contractType !== 'permanent' && (
                    <Field data-invalid={!!errors.endDate}>
                      <FieldLabel htmlFor='endDate'>
                        {m.employment_form_end_date_label()}
                      </FieldLabel>
                      <Input
                        id='endDate'
                        type='date'
                        aria-invalid={!!errors.endDate}
                        {...register('endDate')}
                      />
                      <FieldError errors={errors.endDate ? [errors.endDate] : undefined} />
                    </Field>
                  )}

                  <Field data-invalid={!!errors.shiftId}>
                    <FieldLabel htmlFor='shiftId'>{m.employment_form_shift_label()}</FieldLabel>
                    <Controller
                      name='shiftId'
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='shiftId' aria-invalid={!!errors.shiftId}>
                            <SelectValue placeholder='Pilih shift' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='shift-1'>Shift Pagi (08:00 - 17:00)</SelectItem>
                            <SelectItem value='shift-2'>Shift Siang (13:00 - 22:00)</SelectItem>
                            <SelectItem value='shift-3'>Shift Malam (22:00 - 06:00)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={errors.shiftId ? [errors.shiftId] : undefined} />
                  </Field>

                  <Field data-invalid={!!errors.workLocation}>
                    <FieldLabel htmlFor='workLocation'>
                      {m.employment_form_work_location_label()}
                    </FieldLabel>
                    <Input
                      id='workLocation'
                      placeholder={m.employment_form_work_location_placeholder()}
                      aria-invalid={!!errors.workLocation}
                      {...register('workLocation')}
                    />
                    <FieldError errors={errors.workLocation ? [errors.workLocation] : undefined} />
                  </Field>

                  {isEdit && (
                    <Field data-invalid={!!errors.status}>
                      <FieldLabel htmlFor='status'>Status Karyawan</FieldLabel>
                      <Controller
                        name='status'
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id='status' aria-invalid={!!errors.status}>
                              <SelectValue placeholder='Pilih status' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='active'>Aktif</SelectItem>
                              <SelectItem value='probation'>Probasi</SelectItem>
                              <SelectItem value='inactive'>Tidak Aktif</SelectItem>
                              <SelectItem value='resigned'>Resign</SelectItem>
                              <SelectItem value='terminated'>Terminated</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError errors={errors.status ? [errors.status] : undefined} />
                    </Field>
                  )}
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex items-center justify-end gap-3'>
            <Link to='/employment'>
              <Button type='button' variant='outline' disabled={isPending}>
                {m.employment_form_back_button()}
              </Button>
            </Link>
            <Button type='submit' disabled={isPending}>
              {isPending && <IconLoader2 className='animate-spin' />}
              {isEdit ? m.employment_form_update_button() : m.employment_form_create_button()}
            </Button>
          </div>
        </div>
      </form>
    </AppMain>
  )
}
