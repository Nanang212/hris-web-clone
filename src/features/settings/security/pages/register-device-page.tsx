import { zodResolver } from '@hookform/resolvers/zod'
import { IconCheck } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
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
import { Switch } from '@/shared/components/ui/switch'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import {
  useCreateDeviceRegistration,
  useGetDeviceRegistrationOptions,
} from '@/features/settings/security/hooks'
import type {
  DeviceBindingStart,
  DeviceRegistrationMethod,
  DeviceSecurityCheck,
  DeviceType,
  DeviceVerificationStep,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

function getDeviceTypeLabel(value: DeviceType) {
  const labels = {
    Mobile: m.security_device_register_device_type_mobile(),
    Tablet: m.security_device_register_device_type_tablet(),
    Desktop: m.security_device_register_device_type_desktop(),
  }
  return labels[value]
}

function getRegistrationMethodLabel(value: DeviceRegistrationMethod) {
  const labels = {
    OtpAndDeviceVerification: m.security_device_register_method_otp(),
    DeviceVerification: m.security_device_register_method_device(),
    ManualApproval: m.security_device_register_method_manual(),
  }
  return labels[value]
}

function getBindingStartLabel(value: DeviceBindingStart) {
  const labels = {
    ImmediatelyAfterVerification: m.security_device_register_binding_immediate(),
    AfterApproval: m.security_device_register_binding_approval(),
  }
  return labels[value]
}

function getVerificationStepLabel(value: DeviceVerificationStep) {
  const labels = {
    SendOtp: m.security_device_register_step_send_otp(),
    VerifyDeviceIdentifier: m.security_device_register_step_verify_identifier(),
    RunSecurityChecks: m.security_device_register_step_security_checks(),
    BindDeviceToAccount: m.security_device_register_step_bind_account(),
  }
  return labels[value]
}

function getSecurityCheckLabel(value: DeviceSecurityCheck) {
  const labels = {
    RootJailbreakDetection: m.security_device_register_check_root(),
    MockLocationDetection: m.security_device_register_check_mock_location(),
    DeviceIntegrity: m.security_device_register_check_integrity(),
    ExistingActiveBinding: m.security_device_register_check_binding(),
  }
  return labels[value]
}

export function RegisterDevicePage() {
  const navigate = useNavigate()
  const optionsQuery = useGetDeviceRegistrationOptions()
  const createRegistrationMutation = useCreateDeviceRegistration()
  const formSchema = useSchema((z) => ({
    employeeId: z.string().min(1, { message: m.security_device_register_employee_required() }),
    deviceName: z
      .string()
      .trim()
      .min(1, { message: m.security_device_register_device_name_required() })
      .max(100, { message: m.security_device_register_device_name_invalid() }),
    deviceType: z.enum(['Mobile', 'Tablet', 'Desktop']),
    operatingSystem: z
      .string()
      .trim()
      .min(1, { message: m.security_device_register_operating_system_required() })
      .max(100, { message: m.security_device_register_operating_system_invalid() }),
    serialNumber: z
      .string()
      .trim()
      .max(100, { message: m.security_device_register_serial_invalid() }),
    registrationMethod: z.enum([
      'OtpAndDeviceVerification',
      'DeviceVerification',
      'ManualApproval',
    ]),
    bindingStart: z.enum(['ImmediatelyAfterVerification', 'AfterApproval']),
    setAsPrimaryDevice: z.boolean(),
  }))
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      deviceName: '',
      deviceType: 'Mobile',
      operatingSystem: '',
      serialNumber: '',
      registrationMethod: 'OtpAndDeviceVerification',
      bindingStart: 'ImmediatelyAfterVerification',
      setAsPrimaryDevice: true,
    },
  })

  useEffect(() => {
    const firstEmployee = optionsQuery.data?.employees[0]
    if (firstEmployee && !getValues('employeeId')) {
      setValue('employeeId', firstEmployee.id)
    }
  }, [getValues, optionsQuery.data, setValue])

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

  const handleRegisterDevice = (values: z.infer<typeof formSchema>) => {
    createRegistrationMutation.mutate(
      {
        ...values,
        serialNumber: values.serialNumber || undefined,
      },
      {
        onSuccess: () => {
          snackbar.success(m.security_device_register_success())
          void navigate({ to: '/settings/security/device/registered-devices' })
        },
        onError: (error) => snackbar.exception(error),
      },
    )
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/security', label: m.app_layout_nav_security() },
        { to: '/settings/security/device', label: m.security_device_title() },
        { label: m.security_device_register_page_title() },
      ]}
      backTo='/settings/security/device'
      title={m.security_device_register_page_title()}
      subtitle={m.security_device_register_page_subtitle()}
    >
      <div className='grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.9fr)]'>
        <Card className='min-w-0 gap-0 py-0'>
          <form
            className='flex min-w-0 flex-col'
            onSubmit={handleSubmit(handleRegisterDevice)}
            noValidate
          >
            <CardHeader className='border-b p-5'>
              <CardTitle>{m.security_device_register_information_title()}</CardTitle>
              <CardDescription>
                {m.security_device_register_information_description()}
              </CardDescription>
            </CardHeader>
            <CardContent className='p-5'>
              <FieldGroup>
                <FieldGroup className='grid md:grid-cols-2'>
                  <Controller
                    name='employeeId'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.employeeId}>
                        <FieldLabel htmlFor='device-registration-employee'>
                          {m.security_device_register_employee_label()}
                        </FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id='device-registration-employee'
                            className='w-full'
                            aria-invalid={!!errors.employeeId}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {options.employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name} · {employee.employeeNumber}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError errors={errors.employeeId ? [errors.employeeId] : undefined} />
                      </Field>
                    )}
                  />

                  <Field data-invalid={!!errors.deviceName}>
                    <FieldLabel htmlFor='device-registration-name'>
                      {m.security_device_register_device_name_label()}
                    </FieldLabel>
                    <Input
                      id='device-registration-name'
                      placeholder={m.security_device_register_device_name_placeholder()}
                      aria-invalid={!!errors.deviceName}
                      {...register('deviceName')}
                    />
                    <FieldError errors={errors.deviceName ? [errors.deviceName] : undefined} />
                  </Field>

                  <Controller
                    name='deviceType'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.deviceType}>
                        <FieldLabel htmlFor='device-registration-type'>
                          {m.security_device_register_device_type_label()}
                        </FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id='device-registration-type'
                            className='w-full'
                            aria-invalid={!!errors.deviceType}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {options.deviceTypes.map((deviceType) => (
                                <SelectItem key={deviceType} value={deviceType}>
                                  {getDeviceTypeLabel(deviceType)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          {m.security_device_register_device_type_help()}
                        </FieldDescription>
                        <FieldError errors={errors.deviceType ? [errors.deviceType] : undefined} />
                      </Field>
                    )}
                  />

                  <Field data-invalid={!!errors.operatingSystem}>
                    <FieldLabel htmlFor='device-registration-os'>
                      {m.security_device_register_operating_system_label()}
                    </FieldLabel>
                    <Input
                      id='device-registration-os'
                      placeholder={m.security_device_register_operating_system_placeholder()}
                      aria-invalid={!!errors.operatingSystem}
                      {...register('operatingSystem')}
                    />
                    <FieldError
                      errors={errors.operatingSystem ? [errors.operatingSystem] : undefined}
                    />
                  </Field>

                  <Field data-disabled>
                    <FieldLabel htmlFor='device-registration-identifier'>
                      {m.security_device_register_identifier_label()}
                    </FieldLabel>
                    <Input
                      id='device-registration-identifier'
                      value={m.security_device_register_identifier_generated()}
                      disabled
                      readOnly
                    />
                  </Field>

                  <Field data-invalid={!!errors.serialNumber}>
                    <FieldLabel htmlFor='device-registration-serial'>
                      {m.security_device_register_serial_label()}
                    </FieldLabel>
                    <Input
                      id='device-registration-serial'
                      placeholder={m.security_device_register_serial_placeholder()}
                      aria-invalid={!!errors.serialNumber}
                      {...register('serialNumber')}
                    />
                    <FieldError errors={errors.serialNumber ? [errors.serialNumber] : undefined} />
                  </Field>

                  <Controller
                    name='registrationMethod'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.registrationMethod}>
                        <FieldLabel htmlFor='device-registration-method'>
                          {m.security_device_register_method_label()}
                        </FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id='device-registration-method'
                            className='w-full'
                            aria-invalid={!!errors.registrationMethod}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {options.registrationMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                  {getRegistrationMethodLabel(method)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError
                          errors={
                            errors.registrationMethod ? [errors.registrationMethod] : undefined
                          }
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    name='bindingStart'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.bindingStart}>
                        <FieldLabel htmlFor='device-registration-binding'>
                          {m.security_device_register_binding_start_label()}
                        </FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id='device-registration-binding'
                            className='w-full'
                            aria-invalid={!!errors.bindingStart}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {options.bindingStarts.map((bindingStart) => (
                                <SelectItem key={bindingStart} value={bindingStart}>
                                  {getBindingStartLabel(bindingStart)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError
                          errors={errors.bindingStart ? [errors.bindingStart] : undefined}
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>

                <Controller
                  name='setAsPrimaryDevice'
                  control={control}
                  render={({ field }) => (
                    <Field orientation='horizontal'>
                      <FieldLabel htmlFor='device-registration-primary'>
                        {m.security_device_register_primary_label()}
                      </FieldLabel>
                      <Switch
                        id='device-registration-primary'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label={m.security_device_register_primary_label()}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
            <CardFooter className='flex-col-reverse gap-2 border-t p-5 sm:flex-row sm:justify-end'>
              <Button asChild variant='outline' className='w-full sm:w-auto'>
                <Link to='/settings/security/device'>
                  {m.security_device_register_cancel_button()}
                </Link>
              </Button>
              <Button
                type='submit'
                className='w-full sm:w-auto'
                disabled={createRegistrationMutation.isPending}
              >
                {createRegistrationMutation.isPending && <Spinner data-icon='inline-start' />}
                {m.security_device_register_submit_button()}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className='grid gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>{m.security_device_register_verification_title()}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              {options.verificationSteps.map((step, index) => (
                <div key={step} className='flex items-center gap-3'>
                  <Badge variant='blue' className='size-7 rounded-full p-0'>
                    {index + 1}
                  </Badge>
                  <span className='text-sm'>{getVerificationStepLabel(step)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{m.security_device_register_checks_title()}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              {options.securityChecks.map((check) => (
                <div key={check} className='flex items-center gap-3'>
                  <Badge variant='emerald' className='size-7 rounded-full p-0'>
                    <IconCheck />
                  </Badge>
                  <span className='text-sm'>{getSecurityCheckLabel(check)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppMain>
  )
}
