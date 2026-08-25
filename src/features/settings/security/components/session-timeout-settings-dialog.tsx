import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
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
import { useUpdateSessionTimeoutSettings } from '@/features/settings/security/hooks'
import type {
  SessionTimeoutSettings,
  UpdateSessionTimeoutSettingsPayload,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

interface SessionTimeoutSettingsDialogProps {
  open: boolean
  settings: SessionTimeoutSettings
  onOpenChange: (open: boolean) => void
}

const idleTimeoutOptions = [15, 20, 30, 60] as const
const timeoutWarningOptions = [5, 10, 15] as const
const sessionLifetimeOptions = [8, 12, 24] as const
const concurrentSessionOptions = [1, 2, 3, 4, 5] as const

function getSettingsValues(settings: SessionTimeoutSettings): UpdateSessionTimeoutSettingsPayload {
  return {
    idleTimeoutMinutes: settings.idleTimeoutMinutes,
    timeoutWarningMinutes: settings.timeoutWarningMinutes,
    absoluteSessionLifetimeHours: settings.absoluteSessionLifetimeHours,
    maxConcurrentSessions: settings.maxConcurrentSessions,
    revokeOnPasswordChange: settings.revokeOnPasswordChange,
  }
}

export function SessionTimeoutSettingsDialog({
  open,
  settings,
  onOpenChange,
}: Readonly<SessionTimeoutSettingsDialogProps>) {
  const updateMutation = useUpdateSessionTimeoutSettings()
  const formSchema = useSchema((z) => ({
    idleTimeoutMinutes: z.number().refine((value) => idleTimeoutOptions.includes(value), {
      message: m.security_session_timeout_idle_invalid(),
    }),
    timeoutWarningMinutes: z.number().refine((value) => timeoutWarningOptions.includes(value), {
      message: m.security_session_timeout_warning_invalid(),
    }),
    absoluteSessionLifetimeHours: z
      .number()
      .refine((value) => sessionLifetimeOptions.includes(value), {
        message: m.security_session_timeout_lifetime_invalid(),
      }),
    maxConcurrentSessions: z
      .number()
      .int()
      .min(1, { message: m.security_session_timeout_concurrent_invalid() })
      .max(5, { message: m.security_session_timeout_concurrent_invalid() }),
    revokeOnPasswordChange: z.boolean(),
  }))
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getSettingsValues(settings),
  })

  useEffect(() => {
    reset(getSettingsValues(settings))
  }, [reset, settings])

  const handleSave = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        snackbar.success(m.security_session_timeout_success())
        onOpenChange(false)
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !updateMutation.isPending && onOpenChange(nextOpen)}
    >
      <DialogContent
        className='max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-x-hidden overflow-y-auto sm:max-w-2xl'
        showCloseButton={!updateMutation.isPending}
      >
        <DialogHeader>
          <DialogTitle>{m.security_session_timeout_title()}</DialogTitle>
          <DialogDescription>{m.security_session_timeout_description()}</DialogDescription>
        </DialogHeader>

        <form id='session-timeout-settings-form' onSubmit={handleSubmit(handleSave)} noValidate>
          <FieldGroup>
            <FieldGroup className='grid sm:grid-cols-2'>
              <Controller
                name='idleTimeoutMinutes'
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!errors.idleTimeoutMinutes}>
                    <FieldLabel htmlFor='session-idle-timeout'>
                      {m.security_session_timeout_idle_label()}
                    </FieldLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        id='session-idle-timeout'
                        className='w-full'
                        aria-invalid={!!errors.idleTimeoutMinutes}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {idleTimeoutOptions.map((value) => (
                            <SelectItem key={value} value={String(value)}>
                              {m.security_session_timeout_minutes({ count: value })}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>{m.security_session_timeout_idle_help()}</FieldDescription>
                    <FieldError
                      errors={errors.idleTimeoutMinutes ? [errors.idleTimeoutMinutes] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name='timeoutWarningMinutes'
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!errors.timeoutWarningMinutes}>
                    <FieldLabel htmlFor='session-timeout-warning'>
                      {m.security_session_timeout_warning_label()}
                    </FieldLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        id='session-timeout-warning'
                        className='w-full'
                        aria-invalid={!!errors.timeoutWarningMinutes}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {timeoutWarningOptions.map((value) => (
                            <SelectItem key={value} value={String(value)}>
                              {m.security_session_timeout_minutes({ count: value })}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>{m.security_session_timeout_warning_help()}</FieldDescription>
                    <FieldError
                      errors={
                        errors.timeoutWarningMinutes ? [errors.timeoutWarningMinutes] : undefined
                      }
                    />
                  </Field>
                )}
              />

              <Controller
                name='absoluteSessionLifetimeHours'
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!errors.absoluteSessionLifetimeHours}>
                    <FieldLabel htmlFor='session-maximum-lifetime'>
                      {m.security_session_timeout_lifetime_label()}
                    </FieldLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        id='session-maximum-lifetime'
                        className='w-full'
                        aria-invalid={!!errors.absoluteSessionLifetimeHours}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {sessionLifetimeOptions.map((value) => (
                            <SelectItem key={value} value={String(value)}>
                              {m.security_session_timeout_hours({ count: value })}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      {m.security_session_timeout_lifetime_help()}
                    </FieldDescription>
                    <FieldError
                      errors={
                        errors.absoluteSessionLifetimeHours
                          ? [errors.absoluteSessionLifetimeHours]
                          : undefined
                      }
                    />
                  </Field>
                )}
              />

              <Controller
                name='maxConcurrentSessions'
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!errors.maxConcurrentSessions}>
                    <FieldLabel htmlFor='session-maximum-concurrent'>
                      {m.security_session_timeout_concurrent_label()}
                    </FieldLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        id='session-maximum-concurrent'
                        className='w-full'
                        aria-invalid={!!errors.maxConcurrentSessions}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {concurrentSessionOptions.map((value) => (
                            <SelectItem key={value} value={String(value)}>
                              {m.security_session_timeout_sessions({ count: value })}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      {m.security_session_timeout_concurrent_help()}
                    </FieldDescription>
                    <FieldError
                      errors={
                        errors.maxConcurrentSessions ? [errors.maxConcurrentSessions] : undefined
                      }
                    />
                  </Field>
                )}
              />
            </FieldGroup>

            <Controller
              name='revokeOnPasswordChange'
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.revokeOnPasswordChange} orientation='horizontal'>
                  <FieldLabel htmlFor='session-revoke-password-change'>
                    {m.security_session_timeout_revoke_password_label()}
                  </FieldLabel>
                  <Switch
                    id='session-revoke-password-change'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={m.security_session_timeout_revoke_password_label()}
                    aria-invalid={!!errors.revokeOnPasswordChange}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline' disabled={updateMutation.isPending}>
              {m.security_session_timeout_cancel()}
            </Button>
          </DialogClose>
          <Button
            type='submit'
            form='session-timeout-settings-form'
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Spinner data-icon='inline-start' />}
            {m.security_session_timeout_save()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
