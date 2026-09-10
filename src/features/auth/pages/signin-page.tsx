import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconLock,
  IconMail,
  IconShieldCheck,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

import { AuthLayout } from '@/features/auth/components/auth-layout'
import { useSignIn } from '@/features/auth/hooks'
import { m } from '@/i18n/paraglide/messages'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { setCookie } from '@/shared/lib/utils'

function SecureAccessNotice() {
  return (
    <Alert>
      <IconShieldCheck />
      <AlertTitle>{m.auth_signin_secure_notice_title()}</AlertTitle>
      <AlertDescription>{m.auth_signin_secure_notice_desc()}</AlertDescription>
    </Alert>
  )
}

function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { mutate: signIn, isPending } = useSignIn()

  const formSchema = useSchema(() => ({
    email: z.email({ message: m.auth_signin_email_invalid() }),
    password: z.string().min(1, { message: m.auth_signin_password_required() }),
    rememberMe: z.boolean().optional(),
  }))

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const handleSignIn = (values: z.infer<typeof formSchema>) => {
    signIn(values, {
      onSuccess: () => {
        setCookie('is_signed_in', 'true')
        snackbar.success(m.auth_signin_toast_success())
        navigate({ to: '/', replace: true })
      },
      onError: (error) => {
        snackbar.exception(error)
      },
    })
  }

  return (
    <AuthLayout title={m.auth_signin_welcome_title()} subtitle={m.auth_signin_welcome_subtitle()}>
      <form className='flex flex-col gap-5' onSubmit={handleSubmit(handleSignIn)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor='identifier'>{m.auth_signin_identifier_field_label()}</FieldLabel>
            <div className='relative'>
              <IconMail
                size={16}
                className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                id='identifier'
                type='email'
                autoComplete='email'
                placeholder={m.auth_signin_identifier_field_placeholder()}
                className='pl-9'
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </div>
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor='password'>{m.auth_signin_password_field_label()}</FieldLabel>
            <div className='relative'>
              <IconLock
                size={16}
                className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                id='password'
                autoComplete='current-password'
                type={showPassword ? 'text' : 'password'}
                placeholder={m.auth_signin_password_field_placeholder()}
                className='pr-9 pl-9'
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={
                  showPassword
                    ? m.auth_signin_password_hide_label()
                    : m.auth_signin_password_show_label()
                }
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            <FieldError errors={errors.password ? [errors.password] : undefined} />
          </Field>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Controller
                name='rememberMe'
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id='remember-me'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FieldLabel
                htmlFor='remember-me'
                className='text-sm font-normal text-muted-foreground'
              >
                {m.auth_signin_remember_me_label()}
              </FieldLabel>
            </div>
            <Link to='/reset' className='text-sm text-primary underline-offset-4 hover:underline'>
              {m.auth_signin_forgot_password_link()}
            </Link>
          </div>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending && <IconLoader2 data-icon='inline-start' className='animate-spin' />}
            {m.auth_signin_submit_button()}
          </Button>
        </FieldGroup>
      </form>

      <SecureAccessNotice />
    </AuthLayout>
  )
}

export function SignInPage() {
  return <SignInForm />
}
