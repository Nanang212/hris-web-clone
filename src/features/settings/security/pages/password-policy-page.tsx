import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
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
import { useGetPasswordPolicy, useUpdatePasswordPolicy } from '@/features/settings/security/hooks'
import type {
  PasswordPolicyConfiguration,
  UpdatePasswordPolicyPayload,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

const minimumLengthOptions = [8, 10, 12, 14, 16]
const passwordExpiryOptions = [0, 30, 60, 90, 180]
const lockoutThresholdOptions = [3, 5, 10]
const lockoutDurationOptions = [15, 30, 60]

function getPolicyValues(policy: PasswordPolicyConfiguration): UpdatePasswordPolicyPayload {
  return {
    minimumLength: policy.minimumLength,
    passwordExpiryDays: policy.passwordExpiryDays,
    requireUppercase: policy.requireUppercase,
    requireLowercase: policy.requireLowercase,
    requireNumber: policy.requireNumber,
    requireSymbol: policy.requireSymbol,
    preventPasswordReuse: policy.preventPasswordReuse,
    forceChangeAfterHrReset: policy.forceChangeAfterHrReset,
    lockoutThreshold: policy.lockoutThreshold,
    lockoutDurationMinutes: policy.lockoutDurationMinutes,
  }
}

export function PasswordPolicyPage() {
  const passwordPolicyQuery = useGetPasswordPolicy()
  const updateMutation = useUpdatePasswordPolicy()
  const formSchema = useSchema((z) => ({
    minimumLength: z
      .number()
      .min(8, { message: m.security_password_minimum_length_invalid() })
      .max(64, { message: m.security_password_minimum_length_invalid() }),
    passwordExpiryDays: z
      .number()
      .min(0, { message: m.security_password_expiry_invalid() })
      .max(365, { message: m.security_password_expiry_invalid() }),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumber: z.boolean(),
    requireSymbol: z.boolean(),
    preventPasswordReuse: z.boolean(),
    forceChangeAfterHrReset: z.boolean(),
    lockoutThreshold: z
      .number()
      .min(1, { message: m.security_password_lockout_threshold_invalid() })
      .max(20, { message: m.security_password_lockout_threshold_invalid() }),
    lockoutDurationMinutes: z
      .number()
      .min(1, { message: m.security_password_lockout_duration_invalid() })
      .max(1440, { message: m.security_password_lockout_duration_invalid() }),
  }))
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minimumLength: 12,
      passwordExpiryDays: 90,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSymbol: true,
      preventPasswordReuse: true,
      forceChangeAfterHrReset: true,
      lockoutThreshold: 5,
      lockoutDurationMinutes: 30,
    },
  })

  useEffect(() => {
    if (passwordPolicyQuery.data) {
      reset(getPolicyValues(passwordPolicyQuery.data.policy))
    }
  }, [passwordPolicyQuery.data, reset])

  if (passwordPolicyQuery.isPending || passwordPolicyQuery.error || !passwordPolicyQuery.data) {
    return (
      <AppMain
        pending={passwordPolicyQuery.isPending}
        error={passwordPolicyQuery.error}
        retry={() => void passwordPolicyQuery.refetch()}
        notFound={!passwordPolicyQuery.data}
      />
    )
  }

  const passwordPolicy = passwordPolicyQuery.data

  const handleSave = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values, {
      onSuccess: () => snackbar.success(m.security_password_save_success()),
      onError: (error) => snackbar.exception(error),
    })
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/security', label: m.app_layout_nav_security() },
        { label: m.security_password_title() },
      ]}
      backTo='/settings/security'
      title={m.security_password_title()}
      subtitle={m.security_password_subtitle()}
    >
      <div className='grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.9fr)]'>
        <Card className='gap-0 py-0'>
          <form className='flex flex-col' onSubmit={handleSubmit(handleSave)} noValidate>
            <CardHeader className='border-b p-5'>
              <CardTitle>{m.security_password_policy_title()}</CardTitle>
              <CardDescription>{m.security_password_policy_description()}</CardDescription>
            </CardHeader>
            <CardContent className='p-5'>
              <FieldGroup>
                <FieldGroup className='grid md:grid-cols-2'>
                  <Controller
                    name='minimumLength'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.minimumLength}>
                        <FieldLabel htmlFor='password-minimum-length'>
                          {m.security_password_minimum_length()}
                        </FieldLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger
                            id='password-minimum-length'
                            className='w-full'
                            aria-invalid={!!errors.minimumLength}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {minimumLengthOptions.map((value) => (
                                <SelectItem key={value} value={String(value)}>
                                  {m.security_password_characters({ count: value })}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          {m.security_password_minimum_length_help()}
                        </FieldDescription>
                        <FieldError
                          errors={errors.minimumLength ? [errors.minimumLength] : undefined}
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    name='passwordExpiryDays'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.passwordExpiryDays}>
                        <FieldLabel htmlFor='password-expiry'>
                          {m.security_password_expiry()}
                        </FieldLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger
                            id='password-expiry'
                            className='w-full'
                            aria-invalid={!!errors.passwordExpiryDays}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {passwordExpiryOptions.map((value) => (
                                <SelectItem key={value} value={String(value)}>
                                  {value === 0
                                    ? m.security_password_never()
                                    : m.security_password_days({ count: value })}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>{m.security_password_expiry_help()}</FieldDescription>
                        <FieldError
                          errors={
                            errors.passwordExpiryDays ? [errors.passwordExpiryDays] : undefined
                          }
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>

                <FieldGroup>
                  {(
                    [
                      ['requireUppercase', m.security_password_require_uppercase()],
                      ['requireLowercase', m.security_password_require_lowercase()],
                      ['requireNumber', m.security_password_require_number()],
                      ['requireSymbol', m.security_password_require_symbol()],
                      ['preventPasswordReuse', m.security_password_prevent_reuse()],
                      ['forceChangeAfterHrReset', m.security_password_force_change_after_reset()],
                    ] as const
                  ).map(([name, label]) => (
                    <Controller
                      key={name}
                      name={name}
                      control={control}
                      render={({ field }) => (
                        <Field orientation='horizontal'>
                          <FieldLabel htmlFor={`password-${name}`}>{label}</FieldLabel>
                          <Switch
                            id={`password-${name}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label={label}
                          />
                        </Field>
                      )}
                    />
                  ))}
                </FieldGroup>

                <FieldGroup className='grid md:grid-cols-2'>
                  <Controller
                    name='lockoutThreshold'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.lockoutThreshold}>
                        <FieldLabel htmlFor='password-lockout-threshold'>
                          {m.security_password_lockout_threshold()}
                        </FieldLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger
                            id='password-lockout-threshold'
                            className='w-full'
                            aria-invalid={!!errors.lockoutThreshold}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {lockoutThresholdOptions.map((value) => (
                                <SelectItem key={value} value={String(value)}>
                                  {m.security_password_failed_attempts({ count: value })}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError
                          errors={errors.lockoutThreshold ? [errors.lockoutThreshold] : undefined}
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    name='lockoutDurationMinutes'
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors.lockoutDurationMinutes}>
                        <FieldLabel htmlFor='password-lockout-duration'>
                          {m.security_password_lockout_duration()}
                        </FieldLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger
                            id='password-lockout-duration'
                            className='w-full'
                            aria-invalid={!!errors.lockoutDurationMinutes}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {lockoutDurationOptions.map((value) => (
                                <SelectItem key={value} value={String(value)}>
                                  {m.security_password_minutes({ count: value })}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError
                          errors={
                            errors.lockoutDurationMinutes
                              ? [errors.lockoutDurationMinutes]
                              : undefined
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
                {m.security_password_save_button()}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{m.security_password_account_security_title()}</CardTitle>
            <Badge
              variant={passwordPolicy.accountSecurity.lockedAccounts > 0 ? 'amber' : 'emerald'}
            >
              {m.security_password_locked_count({
                count: passwordPolicy.accountSecurity.lockedAccounts,
              })}
            </Badge>
            <CardDescription>{m.security_password_locked_description()}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant='outline' className='w-full'>
              <Link to='/settings/security/password/locked-accounts'>
                {m.security_password_review_locked_accounts()}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppMain>
  )
}
