import { IconEye, IconEyeOff, IconLock, IconMail, IconShieldCheck } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { BackgroundDecor, BrandMark } from '@/features/auth/components/background'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

export type SignInPageProps = React.ComponentProps<'div'>

function SecureAccessNotice() {
  return (
    <div className='flex items-start gap-2 rounded-lg bg-muted/60 p-3'>
      <IconShieldCheck size={16} className='mt-0.5 shrink-0 text-primary' />
      <div className='space-y-0.5'>
        <p className='text-xs font-semibold'>{m.auth_signin_secure_notice_title()}</p>
        <p className='text-[0.7rem] text-muted-foreground'>{m.auth_signin_secure_notice_desc()}</p>
      </div>
    </div>
  )
}

function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className='w-full max-w-lg space-y-6 rounded-2xl border bg-background p-8 shadow-sm'>
      <BrandMark />

      <div className='space-y-1.5'>
        <h1 className='text-2xl font-bold tracking-tight'>{m.auth_signin_welcome_title()}</h1>
        <p className='text-sm text-muted-foreground'>{m.auth_signin_welcome_subtitle()}</p>
      </div>

      <form className='space-y-5'>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='identifier'>{m.auth_signin_identifier_field_label()}</FieldLabel>
            <div className='relative'>
              <IconMail
                size={16}
                className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                id='identifier'
                placeholder={m.auth_signin_identifier_field_placeholder()}
                className='pl-9'
                required
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor='password'>{m.auth_signin_password_field_label()}</FieldLabel>
            <div className='relative'>
              <IconLock
                size={16}
                className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder={m.auth_signin_password_field_placeholder()}
                className='pr-9 pl-9'
                required
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
          </Field>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Checkbox id='remember-me' />
              <FieldLabel
                htmlFor='remember-me'
                className='text-sm font-normal text-muted-foreground'
              >
                {m.auth_signin_remember_me_label()}
              </FieldLabel>
            </div>
            <Link to='.' className='text-sm text-primary underline-offset-4 hover:underline'>
              {m.auth_signin_forgot_password_link()}
            </Link>
          </div>

          <Button type='submit' className='w-full'>
            {m.auth_signin_submit_button()}
          </Button>
        </FieldGroup>
      </form>

      <SecureAccessNotice />
    </div>
  )
}

export function SignInPage({ className, ...props }: SignInPageProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-muted/30 p-6',
        className,
      )}
      {...props}
    >
      <BackgroundDecor />
      <SignInForm />
    </div>
  )
}
