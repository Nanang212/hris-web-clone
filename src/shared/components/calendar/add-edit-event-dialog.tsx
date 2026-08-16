import { zodResolver } from '@hookform/resolvers/zod'
import { addMinutes, format, set } from 'date-fns'
import { useEffect, useMemo, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useCalendar } from '@/shared/components/calendar/calendar-context'
import { COLORS } from '@/shared/components/calendar/constants'
import { useDisclosure } from '@/shared/components/calendar/hooks'
import type { IEvent } from '@/shared/components/calendar/interfaces'
import { eventSchema, type TEventFormData } from '@/shared/components/calendar/schemas'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/shared/components/ui/responsive-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

interface IProps {
  children: ReactNode
  startDate?: Date
  startTime?: { hour: number; minute: number }
  event?: IEvent
}

export function AddEditEventDialog({ children, startDate, startTime, event }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure()
  const { addEvent, updateEvent } = useCalendar()
  const isEditing = !!event

  const initialDates = useMemo(() => {
    if (!isEditing && !event) {
      if (!startDate) {
        const now = new Date()
        return { startDate: now, endDate: addMinutes(now, 30) }
      }
      const start = startTime
        ? set(new Date(startDate), {
            hours: startTime.hour,
            minutes: startTime.minute,
            seconds: 0,
          })
        : new Date(startDate)
      const end = addMinutes(start, 30)
      return { startDate: start, endDate: end }
    }

    return {
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
    }
  }, [startDate, startTime, event, isEditing])

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      startDate: initialDates.startDate,
      endDate: initialDates.endDate,
      color: event?.color ?? 'blue',
    },
  })

  useEffect(() => {
    form.reset({
      title: event?.title ?? '',
      description: event?.description ?? '',
      startDate: initialDates.startDate,
      endDate: initialDates.endDate,
      color: event?.color ?? 'blue',
    })
  }, [event, initialDates, form])

  const onSubmit = (values: TEventFormData) => {
    try {
      const formattedEvent: IEvent = {
        ...values,
        startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
        id: isEditing ? event.id : Math.floor(Math.random() * 1000000),
        user: isEditing
          ? event.user
          : {
              id: Math.floor(Math.random() * 1000000).toString(),
              name: 'Jeraidi Yassir',
              picturePath: null,
            },
        color: values.color,
      }

      if (isEditing) {
        updateEvent(formattedEvent)
        toast.success('Event updated successfully')
      } else {
        addEvent(formattedEvent)
        toast.success('Event created successfully')
      }

      onClose()
      form.reset()
    } catch (error) {
      console.error(`Error ${isEditing ? 'editing' : 'adding'} event:`, error)
      toast.error(`Failed to ${isEditing ? 'edit' : 'add'} event`)
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={onToggle} modal={false}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</ModalTitle>
          <ModalDescription>
            {isEditing ? 'Modify your existing event.' : 'Create a new event for your calendar.'}
          </ModalDescription>
        </ModalHeader>

        <form id='event-form' onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4 py-4'>
          <Controller
            control={form.control}
            name='title'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='title' className='required'>
                  Title
                </FieldLabel>
                <Input
                  id='title'
                  placeholder='Enter a title'
                  {...field}
                  className={fieldState.invalid ? 'border-red-500' : ''}
                />
                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name='startDate'
            render={({ field, fieldState }) => (
              <DateTimeField
                id='start-date'
                label='Start Date'
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error}
              />
            )}
          />
          <Controller
            control={form.control}
            name='endDate'
            render={({ field, fieldState }) => (
              <DateTimeField
                id='end-date'
                label='End Date'
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error}
              />
            )}
          />
          <Controller
            control={form.control}
            name='color'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className='required'>Variant</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={`w-full ${fieldState.invalid ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder='Select a variant' />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem value={color} key={color}>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`size-3.5 rounded-full bg-${color}-600 dark:bg-${color}-700`}
                          />
                          {color}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name='description'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className='required'>Description</FieldLabel>
                <Textarea
                  {...field}
                  placeholder='Enter a description'
                  className={fieldState.invalid ? 'border-red-500' : ''}
                />
                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
              </Field>
            )}
          />
        </form>
        <ModalFooter className='flex justify-end gap-2'>
          <ModalClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </ModalClose>
          <Button form='event-form' type='submit'>
            {isEditing ? 'Save Changes' : 'Create Event'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function DateTimeField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  value: Date
  onChange: (value: Date) => void
  error?: { message?: string }
}) {
  const formattedValue = format(value, "yyyy-MM-dd'T'HH:mm")
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type='datetime-local'
        value={formattedValue}
        aria-invalid={!!error}
        onChange={(event) => onChange(new Date(event.target.value))}
      />
      <FieldError errors={error ? [error] : undefined} />
    </Field>
  )
}
