import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/components/ui/empty'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
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
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import {
  useCreateDeviceBindingException,
  useDeleteDeviceBindingException,
  useGetDeviceBindingExceptionOptions,
} from '@/features/settings/security/hooks'
import type {
  DeviceBindingException,
  DeviceBindingExceptionTargetType,
} from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

interface BindingPolicyExceptionsDialogProps {
  open: boolean
  exceptions: DeviceBindingException[]
  onOpenChange: (open: boolean) => void
}

function getTargetTypeLabel(type: DeviceBindingExceptionTargetType) {
  const labels = {
    User: m.security_binding_exception_type_user(),
    ServiceAccount: m.security_binding_exception_type_service_account(),
    KioskDevice: m.security_binding_exception_type_kiosk(),
  }
  return labels[type]
}

function getTargetTypeVariant(type: DeviceBindingExceptionTargetType) {
  const variants = {
    User: 'blue',
    ServiceAccount: 'violet',
    KioskDevice: 'emerald',
  } as const
  return variants[type]
}

export function BindingPolicyExceptionsDialog({
  open,
  exceptions,
  onOpenChange,
}: Readonly<BindingPolicyExceptionsDialogProps>) {
  const [search, setSearch] = useState('')
  const [exceptionToRemove, setExceptionToRemove] = useState<DeviceBindingException | null>(null)
  const optionsQuery = useGetDeviceBindingExceptionOptions(open)
  const createMutation = useCreateDeviceBindingException()
  const deleteMutation = useDeleteDeviceBindingException()
  const formSchema = useSchema((z) => ({
    targetId: z.string().min(1, { message: m.security_binding_exception_target_required() }),
    reason: z
      .string()
      .trim()
      .min(1, { message: m.security_binding_exception_reason_required() })
      .min(10, { message: m.security_binding_exception_reason_invalid() })
      .max(250, { message: m.security_binding_exception_reason_invalid() }),
  }))
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetId: '',
      reason: '',
    },
  })

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const existingTargetIds = new Set(exceptions.map((exception) => exception.targetId))

    return (optionsQuery.data?.candidates ?? []).filter((candidate) => {
      if (existingTargetIds.has(candidate.id)) return false
      if (!normalizedSearch) return true

      return `${candidate.name} ${candidate.identifier}`.toLowerCase().includes(normalizedSearch)
    })
  }, [exceptions, optionsQuery.data?.candidates, search])

  const isActionPending = createMutation.isPending || deleteMutation.isPending

  const handleAddException = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        snackbar.success(m.security_binding_exception_add_success())
        reset()
        setSearch('')
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  const handleRemoveException = () => {
    if (!exceptionToRemove) return

    deleteMutation.mutate(exceptionToRemove.id, {
      onSuccess: () => {
        snackbar.success(m.security_binding_exception_remove_success())
        setExceptionToRemove(null)
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !isActionPending && onOpenChange(nextOpen)}>
        <DialogContent
          className='max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-x-hidden overflow-y-auto sm:max-w-5xl'
          showCloseButton={!isActionPending}
        >
          <DialogHeader>
            <DialogTitle>{m.security_binding_exceptions_dialog_title()}</DialogTitle>
            <DialogDescription>
              {m.security_binding_exceptions_dialog_description()}
            </DialogDescription>
          </DialogHeader>

          <div className='grid min-w-0 items-start gap-4 lg:grid-cols-2'>
            <Card className='min-w-0 gap-0 py-0'>
              <form
                id='binding-exception-form'
                onSubmit={handleSubmit(handleAddException)}
                noValidate
              >
                <CardHeader className='border-b p-5'>
                  <CardTitle>{m.security_binding_exception_form_title()}</CardTitle>
                  <CardDescription>
                    {m.security_binding_exception_form_description()}
                  </CardDescription>
                </CardHeader>
                <CardContent className='p-5'>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor='binding-exception-search'>
                        {m.security_binding_exception_search_label()}
                      </FieldLabel>
                      <div className='relative'>
                        <IconSearch
                          size={16}
                          className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                        />
                        <Input
                          id='binding-exception-search'
                          value={search}
                          className='pl-9'
                          placeholder={m.security_binding_exception_search_placeholder()}
                          onChange={(event) => setSearch(event.target.value)}
                        />
                      </div>
                    </Field>

                    <Controller
                      name='targetId'
                      control={control}
                      render={({ field }) => (
                        <Field data-invalid={!!errors.targetId}>
                          <FieldLabel htmlFor='binding-exception-target'>
                            {m.security_binding_exception_target_label()}
                          </FieldLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={optionsQuery.isPending || optionsQuery.isError}
                          >
                            <SelectTrigger
                              id='binding-exception-target'
                              className='w-full'
                              aria-invalid={!!errors.targetId}
                            >
                              <SelectValue
                                placeholder={m.security_binding_exception_target_placeholder()}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {filteredCandidates.map((candidate) => (
                                  <SelectItem key={candidate.id} value={candidate.id}>
                                    {candidate.name} · {candidate.identifier}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {optionsQuery.isError && (
                            <FieldError>
                              {m.security_binding_exception_candidates_error()}
                            </FieldError>
                          )}
                          {!optionsQuery.isPending &&
                            !optionsQuery.isError &&
                            filteredCandidates.length === 0 && (
                              <FieldError>
                                {m.security_binding_exception_candidates_empty()}
                              </FieldError>
                            )}
                          <FieldError errors={errors.targetId ? [errors.targetId] : undefined} />
                        </Field>
                      )}
                    />

                    <Field data-invalid={!!errors.reason}>
                      <FieldLabel htmlFor='binding-exception-reason'>
                        {m.security_binding_exception_reason_label()}
                      </FieldLabel>
                      <Textarea
                        id='binding-exception-reason'
                        placeholder={m.security_binding_exception_reason_placeholder()}
                        aria-invalid={!!errors.reason}
                        {...register('reason')}
                      />
                      <FieldError errors={errors.reason ? [errors.reason] : undefined} />
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className='justify-end border-t p-5'>
                  <Button
                    type='submit'
                    className='w-full sm:w-auto'
                    disabled={isActionPending || optionsQuery.isPending}
                  >
                    {createMutation.isPending ? (
                      <Spinner data-icon='inline-start' />
                    ) : (
                      <IconPlus data-icon='inline-start' />
                    )}
                    {m.security_binding_exception_add_button()}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className='min-w-0 gap-0 py-0'>
              <CardHeader className='border-b p-5'>
                <CardTitle>{m.security_binding_exception_current_title()}</CardTitle>
                <CardDescription>
                  {m.security_binding_exceptions_count({ count: exceptions.length })}
                </CardDescription>
              </CardHeader>
              <CardContent className='flex max-h-112 flex-col gap-3 overflow-y-auto p-5'>
                {exceptions.map((exception) => (
                  <Card key={exception.id} size='sm' className='min-w-0'>
                    <CardHeader className='grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3'>
                      <div className='flex min-w-0 flex-col gap-1'>
                        <CardTitle className='truncate' title={exception.targetName}>
                          {exception.targetName}
                        </CardTitle>
                        <CardDescription className='truncate' title={exception.targetIdentifier}>
                          {exception.targetIdentifier}
                        </CardDescription>
                      </div>
                      <Badge variant={getTargetTypeVariant(exception.targetType)}>
                        {getTargetTypeLabel(exception.targetType)}
                      </Badge>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-2'>
                      <p className='text-sm break-words'>{exception.reason}</p>
                      <CardDescription>
                        {m.security_binding_exception_created_by({
                          name: exception.createdBy,
                          date: dayjs(exception.createdAt).format('DD MMM YYYY'),
                        })}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className='justify-end'>
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon-sm'
                        aria-label={m.security_binding_exception_remove_label({
                          name: exception.targetName,
                        })}
                        disabled={isActionPending}
                        onClick={() => setExceptionToRemove(exception)}
                      >
                        <IconTrash data-icon='inline-start' />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                {exceptions.length === 0 && (
                  <Empty className='border-0 py-10'>
                    <EmptyHeader>
                      <EmptyTitle>{m.security_binding_exception_current_empty()}</EmptyTitle>
                      <EmptyDescription>
                        {m.security_binding_exceptions_description()}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={exceptionToRemove !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleteMutation.isPending) setExceptionToRemove(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.security_binding_exception_remove_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.security_binding_exception_remove_description({
                name: exceptionToRemove?.targetName ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {m.security_binding_exception_remove_cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                handleRemoveException()
              }}
            >
              {deleteMutation.isPending && <Spinner data-icon='inline-start' />}
              {m.security_binding_exception_remove_confirm()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
