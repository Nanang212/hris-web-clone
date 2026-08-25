import { zodResolver } from '@hookform/resolvers/zod'
import { IconListDetails, IconShieldCheck, IconUsers } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
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
import { BindingPolicyExceptionsDialog } from '@/features/settings/security/components/binding-policy-exceptions-dialog'
import {
  useGetDeviceBindingPolicy,
  useUpdateDeviceBindingPolicy,
} from '@/features/settings/security/hooks'
import type {
  DeviceBindingPolicyConfiguration,
  UpdateDeviceBindingPolicyPayload,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

const maximumDeviceOptions = [1, 2, 3] as const
const cooldownOptions = [0, 12, 24, 48] as const
const inactiveExpiryOptions = [30, 60, 90, 180] as const
const reverificationOptions = ['Required', 'RiskBased', 'Disabled'] as const

const defaultPolicyValues: UpdateDeviceBindingPolicyPayload = {
  maximumActiveDevices: 1,
  changeCooldownHours: 24,
  requireDeviceChangeApproval: true,
  blockRootedDevices: true,
  blockMockLocationDevices: true,
  autoExpireInactiveBindings: true,
  inactiveBindingExpiryDays: 90,
  reverifyAfterOsReset: 'Required',
}

function getPolicyValues(
  policy: DeviceBindingPolicyConfiguration,
): UpdateDeviceBindingPolicyPayload {
  return {
    maximumActiveDevices: policy.maximumActiveDevices,
    changeCooldownHours: policy.changeCooldownHours,
    requireDeviceChangeApproval: policy.requireDeviceChangeApproval,
    blockRootedDevices: policy.blockRootedDevices,
    blockMockLocationDevices: policy.blockMockLocationDevices,
    autoExpireInactiveBindings: policy.autoExpireInactiveBindings,
    inactiveBindingExpiryDays: policy.inactiveBindingExpiryDays,
    reverifyAfterOsReset: policy.reverifyAfterOsReset,
  }
}

function getReverificationLabel(value: (typeof reverificationOptions)[number]) {
  const labels = {
    Required: m.security_binding_reverification_required(),
    RiskBased: m.security_binding_reverification_risk_based(),
    Disabled: m.security_binding_reverification_disabled(),
  }
  return labels[value]
}

export function DeviceBindingPolicyPage() {
  const [exceptionsOpen, setExceptionsOpen] = useState(false)
  const policyQuery = useGetDeviceBindingPolicy()
  const updateMutation = useUpdateDeviceBindingPolicy()
  const formSchema = useSchema((z) => ({
    maximumActiveDevices: z
      .number()
      .int()
      .min(1, { message: m.security_binding_maximum_devices_invalid() })
      .max(3, { message: m.security_binding_maximum_devices_invalid() }),
    changeCooldownHours: z.number().refine((value) => cooldownOptions.includes(value), {
      message: m.security_binding_cooldown_invalid(),
    }),
    requireDeviceChangeApproval: z.boolean(),
    blockRootedDevices: z.boolean(),
    blockMockLocationDevices: z.boolean(),
    autoExpireInactiveBindings: z.boolean(),
    inactiveBindingExpiryDays: z.number().refine((value) => inactiveExpiryOptions.includes(value), {
      message: m.security_binding_inactive_expiry_invalid(),
    }),
    reverifyAfterOsReset: z.enum(reverificationOptions),
  }))
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultPolicyValues,
  })
  const autoExpireInactiveBindings = useWatch({
    control,
    name: 'autoExpireInactiveBindings',
  })

  useEffect(() => {
    if (policyQuery.data) reset(getPolicyValues(policyQuery.data.policy))
  }, [policyQuery.data, reset])

  if (policyQuery.isPending || policyQuery.error || !policyQuery.data) {
    return (
      <AppMain
        pending={policyQuery.isPending}
        error={policyQuery.error}
        retry={() => void policyQuery.refetch()}
        notFound={!policyQuery.data}
      />
    )
  }

  const bindingPolicy = policyQuery.data

  const handleSave = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values, {
      onSuccess: () => snackbar.success(m.security_binding_save_success()),
      onError: (error) => snackbar.exception(error),
    })
  }

  const switchFields = [
    ['requireDeviceChangeApproval', m.security_binding_require_approval_label()],
    ['blockRootedDevices', m.security_binding_block_rooted_label()],
    ['blockMockLocationDevices', m.security_binding_block_mock_location_label()],
    ['autoExpireInactiveBindings', m.security_binding_auto_expire_label()],
  ] as const

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/security', label: m.app_layout_nav_security() },
        { to: '/settings/security/device', label: m.security_device_title() },
        { label: m.security_binding_title() },
      ]}
      backTo='/settings/security/device'
      title={m.security_binding_title()}
      subtitle={m.security_binding_subtitle()}
    >
      <div className='grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.9fr)]'>
        <Card className='min-w-0 gap-0 py-0'>
          <form onSubmit={handleSubmit(handleSave)} noValidate>
            <CardHeader className='border-b p-5'>
              <CardTitle>{m.security_binding_rules_title()}</CardTitle>
              <CardDescription>{m.security_binding_rules_description()}</CardDescription>
            </CardHeader>
            <CardContent className='p-5'>
              <FieldGroup>
                <FieldGroup className='grid md:grid-cols-2'>
                  <Controller
                    name='maximumActiveDevices'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.maximumActiveDevices}>
                        <FieldLabel htmlFor='binding-maximum-devices'>
                          {m.security_binding_maximum_devices_label()}
                        </FieldLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger
                            id='binding-maximum-devices'
                            className='w-full'
                            aria-invalid={!!errors.maximumActiveDevices}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {maximumDeviceOptions.map((value) => (
                                <SelectItem key={value} value={String(value)}>
                                  {m.security_binding_maximum_devices_option({ count: value })}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          {m.security_binding_maximum_devices_help()}
                        </FieldDescription>
                        <FieldError
                          errors={
                            errors.maximumActiveDevices ? [errors.maximumActiveDevices] : undefined
                          }
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    name='changeCooldownHours'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.changeCooldownHours}>
                        <FieldLabel htmlFor='binding-change-cooldown'>
                          {m.security_binding_cooldown_label()}
                        </FieldLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger
                            id='binding-change-cooldown'
                            className='w-full'
                            aria-invalid={!!errors.changeCooldownHours}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {cooldownOptions.map((value) => (
                                <SelectItem key={value} value={String(value)}>
                                  {value === 0
                                    ? m.security_binding_cooldown_none()
                                    : m.security_binding_hours({ count: value })}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>{m.security_binding_cooldown_help()}</FieldDescription>
                        <FieldError
                          errors={
                            errors.changeCooldownHours ? [errors.changeCooldownHours] : undefined
                          }
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>

                <FieldGroup>
                  {switchFields.map(([name, label]) => (
                    <Controller
                      key={name}
                      name={name}
                      control={control}
                      render={({ field }) => (
                        <Field data-invalid={!!errors[name]} orientation='horizontal'>
                          <FieldLabel htmlFor={`binding-${name}`}>{label}</FieldLabel>
                          <Switch
                            id={`binding-${name}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label={label}
                            aria-invalid={!!errors[name]}
                          />
                        </Field>
                      )}
                    />
                  ))}
                </FieldGroup>

                <FieldGroup className='grid md:grid-cols-2'>
                  <Controller
                    name='inactiveBindingExpiryDays'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.inactiveBindingExpiryDays}>
                        <FieldLabel htmlFor='binding-inactive-expiry'>
                          {m.security_binding_inactive_expiry_label()}
                        </FieldLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={!autoExpireInactiveBindings}
                        >
                          <SelectTrigger
                            id='binding-inactive-expiry'
                            className='w-full'
                            aria-invalid={!!errors.inactiveBindingExpiryDays}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {inactiveExpiryOptions.map((value) => (
                                <SelectItem key={value} value={String(value)}>
                                  {m.security_binding_days({ count: value })}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          {m.security_binding_inactive_expiry_help()}
                        </FieldDescription>
                        <FieldError
                          errors={
                            errors.inactiveBindingExpiryDays
                              ? [errors.inactiveBindingExpiryDays]
                              : undefined
                          }
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    name='reverifyAfterOsReset'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.reverifyAfterOsReset}>
                        <FieldLabel htmlFor='binding-os-reset-reverification'>
                          {m.security_binding_reverification_label()}
                        </FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id='binding-os-reset-reverification'
                            className='w-full'
                            aria-invalid={!!errors.reverifyAfterOsReset}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {reverificationOptions.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {getReverificationLabel(value)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError
                          errors={
                            errors.reverifyAfterOsReset ? [errors.reverifyAfterOsReset] : undefined
                          }
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldGroup>
            </CardContent>
            <CardFooter className='justify-end border-t p-5'>
              <Button
                type='submit'
                className='w-full sm:w-auto'
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Spinner data-icon='inline-start' />}
                {m.security_binding_save_button()}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className='grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-1'>
          <Card className='min-w-0'>
            <CardHeader>
              <CardTitle>{m.security_binding_impact_title()}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <Card size='sm'>
                <CardContent className='flex items-center gap-3'>
                  <Badge variant='blue' className='size-11 rounded-xl p-0'>
                    <IconUsers />
                  </Badge>
                  <div className='flex min-w-0 flex-col gap-1'>
                    <CardDescription>{m.security_binding_users_covered()}</CardDescription>
                    <CardTitle>{bindingPolicy.impact.usersCovered.toLocaleString()}</CardTitle>
                    <Badge variant='blue'>{m.security_binding_active_accounts()}</Badge>
                  </div>
                </CardContent>
              </Card>
              <CardDescription>{m.security_binding_impact_description()}</CardDescription>
              <Badge
                variant={bindingPolicy.impact.auditTrailEnabled ? 'green' : 'gray'}
                className='w-fit'
              >
                <IconShieldCheck data-icon='inline-start' />
                {bindingPolicy.impact.auditTrailEnabled
                  ? m.security_binding_audit_enabled()
                  : m.security_binding_audit_disabled()}
              </Badge>
            </CardContent>
          </Card>

          <Card className='min-w-0'>
            <CardHeader>
              <CardTitle>{m.security_binding_exceptions_title()}</CardTitle>
              <CardDescription>{m.security_binding_exceptions_description()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant='violet'>
                {m.security_binding_exceptions_count({
                  count: bindingPolicy.exceptions.length,
                })}
              </Badge>
            </CardContent>
            <CardFooter>
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={() => setExceptionsOpen(true)}
              >
                <IconListDetails data-icon='inline-start' />
                {m.security_binding_manage_exceptions()}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <BindingPolicyExceptionsDialog
        open={exceptionsOpen}
        exceptions={bindingPolicy.exceptions}
        onOpenChange={setExceptionsOpen}
      />
    </AppMain>
  )
}
