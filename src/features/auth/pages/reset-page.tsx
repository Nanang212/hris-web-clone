import {
  IconCheck,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'

import { BackgroundDecor, BrandMark } from '@/features/auth/components/background'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

export type ResetPasswordPageProps = React.ComponentProps<'div'> & {
  /** Previous password, only used to check the "different from previous" rule. */
  previousPassword?: string
  onSubmit?: (password: string) => void
}

type Requirement = {
  key: string
  label: string
  met: boolean
}

const STRENGTH_LABELS = [
  { min: 0, label: () => m.auth_reset_strength_very_weak(), tone: 'bg-destructive' },
  { min: 1, label: () => m.auth_reset_strength_weak(), tone: 'bg-destructive' },
  { min: 2, label: () => m.auth_reset_strength_fair(), tone: 'bg-amber-500' },
  { min: 3, label: () => m.auth_reset_strength_good(), tone: 'bg-amber-500' },
  { min: 4, label: () => m.auth_reset_strength_strong(), tone: 'bg-emerald-500' },
] as const

function InfoBox({
  tone,
  icon,
  title,
  description,
}: Readonly<{
  tone: 'info' | 'muted'
  icon: React.ReactNode
  title: string
  description: string
}>) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg p-3',
        tone === 'info' && 'bg-primary/5',
        tone === 'muted' && 'bg-muted/60',
      )}
    >
      <span className='mt-0.5 shrink-0 text-primary'>{icon}</span>
      <div className='space-y-0.5'>
        <p className='text-xs font-semibold'>{title}</p>
        <p className='text-[0.7rem] text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: Readonly<{
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className='relative'>
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className='pr-9'
        required
      />
      <button
        type='button'
        onClick={() => setVisible((prev) => !prev)}
        className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground'
        aria-label={
          visible ? m.auth_reset_password_hide_label() : m.auth_reset_password_show_label()
        }
      >
        {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  )
}

function StrengthMeter({ score }: Readonly<{ score: number }>) {
  const strength = [...STRENGTH_LABELS].reverse().find((s) => score >= s.min)!

  return (
    <div className='space-y-1.5'>
      <div className='flex gap-1.5'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn('h-1.5 flex-1 rounded-full bg-muted', index < score && strength.tone)}
          />
        ))}
      </div>
      <p
        className={cn(
          'text-xs font-medium',
          score === 0 && 'text-muted-foreground',
          score > 0 && score < 3 && 'text-amber-600 dark:text-amber-400',
          score >= 3 && 'text-emerald-600 dark:text-emerald-400',
        )}
      >
        {strength.label()}
      </p>
    </div>
  )
}

function RequirementChecklist({ requirements }: Readonly<{ requirements: Requirement[] }>) {
  return (
    <div className='space-y-2 rounded-lg bg-muted/60 p-3'>
      {requirements.map((requirement) => (
        <div key={requirement.key} className='flex items-center gap-2'>
          {requirement.met ? (
            <IconCheck size={14} className='shrink-0 text-emerald-600 dark:text-emerald-400' />
          ) : (
            <IconX size={14} className='shrink-0 text-muted-foreground' />
          )}
          <span
            className={cn(
              'text-xs',
              requirement.met ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground',
            )}
          >
            {requirement.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ResetPage({
  className,
  previousPassword,
  onSubmit,
  ...props
}: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const requirements = useMemo<Requirement[]>(
    () => [
      {
        key: 'length',
        label: m.auth_reset_requirement_length(),
        met: newPassword.length >= 8,
      },
      {
        key: 'case',
        label: m.auth_reset_requirement_case(),
        met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
      },
      {
        key: 'number',
        label: m.auth_reset_requirement_number(),
        met: /\d/.test(newPassword),
      },
      {
        key: 'symbol',
        label: m.auth_reset_requirement_symbol(),
        met: /[^A-Za-z0-9]/.test(newPassword),
      },
      {
        key: 'different',
        label: m.auth_reset_requirement_different(),
        met:
          newPassword.length > 0 &&
          (previousPassword === undefined || newPassword !== previousPassword),
      },
    ],
    [newPassword, previousPassword],
  )

  const score = requirements.filter((r) => r.met).length
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === newPassword
  const canSubmit = requirements.every((r) => r.met) && passwordsMatch

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit?.(newPassword)
  }

  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-muted/30 p-6',
        className,
      )}
      {...props}
    >
      <BackgroundDecor />

      <div className='w-full max-w-lg space-y-6 rounded-2xl border bg-background p-8 shadow-sm'>
        <BrandMark />

        <div className='space-y-1.5 text-center'>
          <h1 className='text-2xl font-bold tracking-tight'>{m.auth_reset_title()}</h1>
          <p className='text-sm text-muted-foreground'>{m.auth_reset_subtitle()}</p>
        </div>

        <InfoBox
          tone='info'
          icon={<IconInfoCircle size={16} />}
          title={m.auth_reset_requirement_notice_title()}
          description={m.auth_reset_requirement_notice_desc()}
        />

        <form className='space-y-5' onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='new-password'>{m.auth_reset_new_password_label()}</FieldLabel>
              <PasswordInput
                id='new-password'
                value={newPassword}
                onChange={setNewPassword}
                placeholder={m.auth_reset_new_password_placeholder()}
              />
              {newPassword.length > 0 && <StrengthMeter score={score} />}
            </Field>

            <Field>
              <FieldLabel htmlFor='confirm-password'>
                {m.auth_reset_confirm_password_label()}
              </FieldLabel>
              <PasswordInput
                id='confirm-password'
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder={m.auth_reset_confirm_password_placeholder()}
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className='text-xs text-destructive'>{m.auth_reset_password_mismatch()}</p>
              )}
            </Field>

            <RequirementChecklist requirements={requirements} />

            <Button type='submit' className='w-full' disabled={!canSubmit}>
              {m.auth_reset_submit_button()}
            </Button>
          </FieldGroup>
        </form>

        <InfoBox
          tone='muted'
          icon={<IconShieldCheck size={16} />}
          title={m.auth_reset_secure_notice_title()}
          description={m.auth_reset_secure_notice_desc()}
        />
      </div>
    </div>
  )
}
