import { IconInfoCircle, IconShieldCheck } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { BackgroundDecor, BrandMark } from '@/features/auth/components/background'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/shared/components/ui/input-otp'
import { cn } from '@/shared/lib/utils'

export type ActivationPageProps = React.ComponentProps<'div'>

type ActivationStep = 'activate' | 'otp'

const OTP_LENGTH = 6
const OTP_DURATION_SECONDS = 5 * 60

function InfoBox({
  tone,
  icon,
  title,
  description,
}: Readonly<{
  tone: 'success' | 'info' | 'muted'
  icon: React.ReactNode
  title: string
  description: string
}>) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg p-3',
        tone === 'success' && 'bg-emerald-50 dark:bg-emerald-950/30',
        tone === 'info' && 'bg-primary/5',
        tone === 'muted' && 'bg-muted/60',
      )}
    >
      <span
        className={cn(
          'mt-0.5 shrink-0',
          tone === 'success' && 'text-emerald-600 dark:text-emerald-400',
          tone === 'info' && 'text-primary',
          tone === 'muted' && 'text-primary',
        )}
      >
        {icon}
      </span>
      <div className='space-y-0.5'>
        <p
          className={cn(
            'text-xs font-semibold',
            tone === 'success' && 'text-emerald-700 dark:text-emerald-400',
          )}
        >
          {title}
        </p>
        <p className='text-[0.7rem] text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}

function useOtpCountdown(active: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS)

  useEffect(() => {
    if (!active) return

    setSecondsLeft(OTP_DURATION_SECONDS)
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [active])

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return { secondsLeft, label: `${minutes}:${seconds}` }
}

function ActivateStep({ onContinue }: Readonly<{ onContinue: () => void }>) {
  return (
    <div className='space-y-6'>
      <div className='space-y-1.5 text-center'>
        <h1 className='text-2xl font-bold tracking-tight'>{m.auth_activation_activate_title()}</h1>
        <p className='text-sm text-muted-foreground'>{m.auth_activation_activate_subtitle()}</p>
      </div>

      <div className='space-y-3'>
        <InfoBox
          tone='info'
          icon={<IconInfoCircle size={16} />}
          title={m.auth_activation_next_step_title()}
          description={m.auth_activation_next_step_desc()}
        />
      </div>

      <div className='space-y-3'>
        <Button type='button' className='w-full' onClick={onContinue}>
          {m.auth_activation_continue_button()}
        </Button>
        <p className='text-center text-sm'>
          <button type='button' className='text-primary underline-offset-4 hover:underline'>
            {m.auth_activation_resend_email_link()}
          </button>
        </p>
      </div>

      <InfoBox
        tone='muted'
        icon={<IconShieldCheck size={16} />}
        title={m.auth_activation_secure_notice_title()}
        description={m.auth_activation_secure_notice_desc()}
      />
    </div>
  )
}

function OtpStep() {
  const [code, setCode] = useState('')
  const { secondsLeft, label } = useOtpCountdown(true)

  const isComplete = code.length === OTP_LENGTH

  return (
    <div className='space-y-6'>
      <div className='space-y-1.5 text-center'>
        <h1 className='text-2xl font-bold tracking-tight'>{m.auth_activation_otp_title()}</h1>
        <p className='text-sm text-muted-foreground'>{m.auth_activation_otp_subtitle()}</p>
      </div>

      <div className='space-y-2'>
        <div>
          <p className='text-sm font-medium'>{m.auth_activation_otp_field_label()}</p>
          <p className='text-xs text-muted-foreground'>{m.auth_activation_otp_field_desc()}</p>
        </div>

        <InputOTP maxLength={OTP_LENGTH} value={code} onChange={setCode}>
          <InputOTPGroup className='w-full justify-center gap-4'>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className='h-11 w-11 rounded! border text-base font-semibold'
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className='flex items-center justify-between text-xs'>
          <span
            className={cn(
              secondsLeft > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-destructive',
            )}
          >
            {secondsLeft > 0
              ? m.auth_activation_otp_expires_in({ time: label })
              : m.auth_activation_otp_expired()}
          </span>
          <button type='button' className='text-primary underline-offset-4 hover:underline'>
            {m.auth_activation_resend_code_link()}
          </button>
        </div>
      </div>

      <Button type='submit' className='w-full' disabled={!isComplete}>
        {m.auth_activation_verify_button()}
      </Button>

      <InfoBox
        tone='muted'
        icon={<IconShieldCheck size={16} />}
        title={m.auth_activation_otp_security_title()}
        description={m.auth_activation_otp_security_desc()}
      />
    </div>
  )
}

export function VerificationPage({ className, ...props }: ActivationPageProps) {
  const [step, setStep] = useState<ActivationStep>('activate')

  return (
    <main
      className={cn(
        'relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-muted/30 p-6',
        className,
      )}
      {...props}
    >
      <BackgroundDecor />

      <div className='w-full max-w-lg space-y-6 rounded-2xl border bg-background p-8 shadow-sm'>
        <BrandMark />

        {step === 'activate' ? <ActivateStep onContinue={() => setStep('otp')} /> : <OtpStep />}
      </div>
    </main>
  )
}
