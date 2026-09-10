import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { LeaveSelect } from '@/features/leave/components/leave-select'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import { m } from '@/i18n/paraglide/messages'

export function CreateLeaveRequestPage() {
  const navigate = useNavigate()
  const formSchema = useSchema(() =>
    z.object({
      leaveType: z.string().min(1, m.leave_create_type_required()),
      period: z.object({ from: z.date(), to: z.date() }).optional(),
      reason: z.string().min(1, m.leave_create_reason_required()),
    }),
  )
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveType: 'annual',
      period: { from: dayjs('2026-08-07').toDate(), to: dayjs('2026-08-09').toDate() },
      reason: '',
    },
  })
  const onSubmit = () => {
    snackbar.success(m.leave_create_toast_success())
    navigate({ to: '/leave/requests' })
  }

  return (
    <AppMain
      title={m.leave_create_title()}
      subtitle={m.leave_create_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/leave', label: m.app_layout_nav_leave() },
        { to: '/leave/requests', label: m.leave_tab_requests() },
        { label: m.leave_create_title() },
      ]}
      backTo='/leave/requests'
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='requests' />
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className='rounded-2xl border border-border bg-card p-5 shadow-sm'
        >
          <h3 className='font-semibold'>{m.leave_create_details_title()}</h3>
          <p className='mt-1 text-xs text-muted-foreground'>{m.leave_create_details_subtitle()}</p>
          <FieldGroup className='mt-5'>
            <Field data-invalid={!!errors.leaveType}>
              <FieldLabel htmlFor='leave-type'>{m.leave_create_type_label()}</FieldLabel>
              <Controller
                name='leaveType'
                control={control}
                render={({ field }) => (
                  <LeaveSelect
                    id='leave-type'
                    value={field.value}
                    onValueChange={field.onChange}
                    className='w-full'
                  />
                )}
              />
              <FieldError errors={errors.leaveType ? [errors.leaveType] : undefined} />
            </Field>
            <Field data-invalid={!!errors.period}>
              <FieldLabel>{m.leave_create_period_label()}</FieldLabel>
              <Controller
                name='period'
                control={control}
                render={({ field }) => (
                  <DatePicker
                    mode='range'
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder={m.leave_create_period_placeholder()}
                    className='w-full'
                    aria-invalid={!!errors.period}
                  />
                )}
              />
              <FieldError errors={errors.period ? [errors.period] : undefined} />
            </Field>
            <div className='grid gap-5 sm:grid-cols-2'>
              <Field>
                <FieldLabel htmlFor='duration'>{m.leave_create_duration_label()}</FieldLabel>
                <Input id='duration' value={m.leave_days({ count: '3' })} readOnly />
              </Field>
              <Field>
                <FieldLabel htmlFor='half-day'>{m.leave_create_half_day_label()}</FieldLabel>
                <Select defaultValue='no'>
                  <SelectTrigger id='half-day' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='no'>{m.leave_create_half_day_no()}</SelectItem>
                    <SelectItem value='yes'>{m.leave_create_half_day_yes()}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field data-invalid={!!errors.reason}>
              <FieldLabel htmlFor='reason'>{m.leave_create_reason_label()}</FieldLabel>
              <Textarea
                id='reason'
                placeholder={m.leave_create_reason_placeholder()}
                aria-invalid={!!errors.reason}
                {...register('reason')}
              />
              <FieldError errors={errors.reason ? [errors.reason] : undefined} />
            </Field>
            <Field>
              <FieldLabel htmlFor='attachment'>{m.leave_create_attachment_label()}</FieldLabel>
              <Input id='attachment' type='file' />
            </Field>
          </FieldGroup>
          <div className='mt-6 flex justify-end gap-2'>
            <Button variant='outline' asChild>
              <Link to='/leave/requests'>{m.leave_cancel()}</Link>
            </Button>
            <Button type='submit'>{m.leave_create_submit()}</Button>
          </div>
        </form>
        <aside className='h-fit rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='font-semibold'>{m.leave_create_entitlement_title()}</h3>
          <span className='mt-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
            {m.leave_type_annual()}
          </span>
          <dl className='mt-5 space-y-4 text-sm'>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>{m.leave_balance_available()}</dt>
              <dd className='text-xl font-bold text-emerald-600'>
                {m.leave_days({ count: '12' })}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>{m.leave_stat_pending()}</dt>
              <dd className='text-orange-500'>{m.leave_days({ count: '1' })}</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>{m.leave_create_after_request()}</dt>
              <dd className='text-xl font-bold'>{m.leave_days({ count: '9' })}</dd>
            </div>
          </dl>
          <div className='mt-5 border-t pt-4 text-sm text-rose-500'>
            {m.leave_expiry({ date: '31 Dec 2026' })}
          </div>
        </aside>
      </div>
    </AppMain>
  )
}
