import { zodResolver } from '@hookform/resolvers/zod'
import { IconEye, IconEyeOff, IconInfoCircle } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Alert, AlertDescription, AlertIcon } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/shared/components/ui/input-otp'
import { Spinner } from '@/shared/components/ui/spinner'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { useRequestPasswordReset, useResetPassword } from '@/features/auth/hooks'
import { m } from '@/i18n/paraglide/messages'

const OTP_LENGTH = 6

function PasswordStrength({ password }: Readonly<{ password: string }>) {
  if (!password) return null

  const score = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length
  const level = score <= 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'good' : 'strong'
  const levelLabel = {
    weak: m.auth_reset_password_strength_weak(),
    fair: m.auth_reset_password_strength_fair(),
    good: m.auth_reset_password_strength_good(),
    strong: m.auth_reset_password_strength_strong(),
  }[level]
  const segmentClass = {
    weak: 'bg-red-500',
    fair: 'bg-amber-500',
    good: 'bg-blue-500',
    strong: 'bg-emerald-500',
  }[level]

  return (
    <div className='flex flex-col gap-2' aria-live='polite'>
      <div className='flex items-center gap-1.5' aria-label={levelLabel}>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${index < Math.ceil((score / 5) * 4) ? segmentClass : 'bg-muted'}`}
          />
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>
        {m.auth_reset_password_strength_label({ strength: levelLabel })}
      </p>
    </div>
  )
}

function RequestResetForm({ onSent }: Readonly<{ onSent: (email: string) => void }>) {
  const { mutate, isPending } = useRequestPasswordReset()
  const schema = useSchema(() => ({ email: z.email({ message: m.auth_signin_email_invalid() }) }))
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })
  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        mutate(values, {
          onSuccess: () => {
            snackbar.success(m.auth_reset_otp_sent())
            onSent(values.email)
          },
          onError: (error) => snackbar.exception(error),
        }),
      )}
    >
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor='reset-email'>{m.auth_signin_identifier_field_label()}</FieldLabel>
          <Input
            id='reset-email'
            type='email'
            autoComplete='email'
            aria-invalid={!!errors.email}
            disabled={isPending}
            {...register('email')}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Button type='submit' disabled={isPending}>
          {isPending && <Spinner data-icon='inline-start' />}
          {m.auth_reset_send_otp()}
        </Button>
      </FieldGroup>
    </form>
  )
}

function ResetPasswordForm({
  email,
  onChangeEmail,
}: Readonly<{ email: string; onChangeEmail: () => void }>) {
  const [showPassword, setShowPassword] = useState(false)
  const reset = useResetPassword()
  const resend = useRequestPasswordReset()
  const schema = useSchema(() => ({
    otp: z.string().regex(/^\d{6}$/, m.auth_reset_otp_invalid()),
    password: z.string().min(1, m.auth_signin_password_required()),
    confirmPassword: z.string().min(1, m.auth_signin_password_required()),
  })).refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: m.auth_reset_password_mismatch(),
  })
  const {
    register,
    handleSubmit,
    resetField,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { otp: '', password: '', confirmPassword: '' },
  })
  const isPending = reset.isPending || resend.isPending
  const password = useWatch({ control, name: 'password' })

  if (reset.isSuccess) {
    return (
      <Alert>
        <AlertDescription>
          {reset.data.data.shouldActivate
            ? m.auth_reset_activation_required()
            : m.auth_reset_success()}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='flex flex-col gap-5'>
      <Alert variant='info' className='shadow-none'>
        <AlertIcon>
          <IconInfoCircle />
        </AlertIcon>
        <AlertDescription className='flex min-w-0 flex-col items-start gap-2'>
          <div className='wrap-break-word'>{m.auth_reset_otp_destination({ email })}</div>
          <Button
            type='button'
            variant='link'
            size='xs'
            className='h-auto p-0'
            disabled={isPending}
            onClick={onChangeEmail}
          >
            {m.auth_reset_change_email()}
          </Button>
        </AlertDescription>
      </Alert>
      <form
        noValidate
        onSubmit={handleSubmit((values) =>
          reset.mutate(
            { email, ...values },
            {
              onSuccess: () => snackbar.success(m.auth_reset_success()),
              onError: (error) => snackbar.exception(error),
            },
          ),
        )}
      >
        <FieldGroup>
          <Field data-invalid={!!errors.otp}>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <FieldLabel htmlFor='reset-otp'>{m.auth_reset_otp_label()}</FieldLabel>
              <Button
                type='button'
                variant='link'
                size='xs'
                className='h-auto shrink-0 p-0'
                disabled={isPending}
                onClick={() =>
                  resend.mutate(
                    { email },
                    {
                      onSuccess: () => {
                        resetField('otp')
                        snackbar.success(m.auth_reset_otp_sent())
                      },
                      onError: (error) => snackbar.exception(error),
                    },
                  )
                }
              >
                {resend.isPending && <Spinner data-icon='inline-start' />}
                {m.auth_reset_resend_otp()}
              </Button>
            </div>
            <Controller
              name='otp'
              control={control}
              render={({ field }) => (
                <InputOTP
                  {...field}
                  id='reset-otp'
                  containerClassName='w-full min-w-0'
                  maxLength={OTP_LENGTH}
                  pattern={REGEXP_ONLY_DIGITS}
                  autoComplete='one-time-code'
                  aria-invalid={!!errors.otp}
                  aria-describedby={errors.otp ? 'reset-otp-error' : undefined}
                  disabled={isPending}
                >
                  <InputOTPGroup className='w-full'>
                    {Array.from({ length: OTP_LENGTH }, (_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className='min-w-0 flex-1'
                        aria-invalid={!!errors.otp}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            <FieldError id='reset-otp-error' errors={[errors.otp]} />
          </Field>
          {(['password', 'confirmPassword'] as const).map((name) => (
            <Field key={name} data-invalid={!!errors[name]}>
              <FieldLabel htmlFor={name}>
                {name === 'password'
                  ? m.auth_reset_new_password_label()
                  : m.auth_reset_confirm_password_label()}
              </FieldLabel>
              <div className='relative'>
                <Input
                  id={name}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  className='pr-10'
                  aria-invalid={!!errors[name]}
                  disabled={isPending}
                  {...register(name)}
                />
                <button
                  type='button'
                  className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground'
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? m.auth_reset_password_hide_label()
                      : m.auth_reset_password_show_label()
                  }
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
              {name === 'password' && <PasswordStrength password={password} />}
              <FieldError errors={[errors[name]]} />
            </Field>
          ))}
          <Button type='submit' disabled={isPending}>
            {reset.isPending && <Spinner data-icon='inline-start' />}
            {m.auth_reset_submit_button()}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}

export function ResetPage() {
  const [email, setEmail] = useState<string>()
  return (
    <AuthLayout
      title={email ? m.auth_reset_title() : m.auth_reset_request_title()}
      subtitle={email ? m.auth_reset_subtitle() : m.auth_reset_request_subtitle()}
    >
      {email ? (
        <ResetPasswordForm email={email} onChangeEmail={() => setEmail(undefined)} />
      ) : (
        <RequestResetForm onSent={setEmail} />
      )}
      <Button asChild variant='outline'>
        <Link to='/signin'>{m.auth_back_to_signin()}</Link>
      </Button>
    </AuthLayout>
  )
}
