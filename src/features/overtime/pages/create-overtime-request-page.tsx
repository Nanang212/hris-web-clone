import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

export function CreateOvertimeRequestPage() {
  const navigate = useNavigate()
  const formSchema = useSchema(() => ({
    reason: z.string().min(1, m.overtime_reason_required()),
  }))
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: 'Maintenance server and backup validation' },
  })
  const onSubmit = () => {
    snackbar.success(m.overtime_submit_success())
    navigate({ to: '/overtime' })
  }

  return (
    <AppMain
      title={m.overtime_create_title()}
      subtitle={m.overtime_create_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/overtime', label: m.app_layout_nav_overtime() },
        { label: m.overtime_create_title() },
      ]}
      backTo='/overtime'
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='requests' />
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_300px]'>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card>
            <CardHeader>
              <CardTitle>{m.overtime_request_details()}</CardTitle>
            </CardHeader>
            <CardContent className='px-4'>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor='employee'>{m.overtime_employee()}</FieldLabel>
                  <Input id='employee' defaultValue='Rama Aditya · EMP-2023-00128' readOnly />
                </Field>
                <div className='grid gap-5 sm:grid-cols-2'>
                  <Field>
                    <FieldLabel htmlFor='date'>{m.overtime_date()}</FieldLabel>
                    <Input id='date' type='date' defaultValue='2026-08-15' />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='schedule'>{m.overtime_work_schedule()}</FieldLabel>
                    <Input id='schedule' defaultValue='09:00–17:00' readOnly />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='start'>{m.overtime_start_time()}</FieldLabel>
                    <Input id='start' type='time' defaultValue='18:00' />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='end'>{m.overtime_end_time()}</FieldLabel>
                    <Input id='end' type='time' defaultValue='21:30' />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='break'>{m.overtime_break_duration()}</FieldLabel>
                    <Input id='break' defaultValue='30 minutes' />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='day-type'>{m.overtime_day_type()}</FieldLabel>
                    <Input id='day-type' defaultValue='Workday' readOnly />
                  </Field>
                </div>
                <Field data-invalid={!!errors.reason}>
                  <FieldLabel htmlFor='reason'>{m.overtime_reason()}</FieldLabel>
                  <Textarea id='reason' aria-invalid={!!errors.reason} {...register('reason')} />
                  <FieldError errors={errors.reason ? [errors.reason] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor='project'>{m.overtime_project()}</FieldLabel>
                  <Input id='project' defaultValue='Payroll System · Infrastructure' />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </form>
        <div className='flex flex-col gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>{m.overtime_request_summary()}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4 px-4 text-sm'>
              <Badge variant='green'>{m.overtime_policy_passed()}</Badge>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{m.overtime_requested_hours()}</span>
                <strong>3.5 h</strong>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{m.overtime_break()}</span>
                <strong>0.5 h</strong>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{m.overtime_eligible_hours()}</span>
                <strong className='text-green-700'>3.0 h</strong>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{m.overtime_estimated_compensation()}</span>
                <strong className='text-primary'>Rp 112.500</strong>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{m.overtime_approval_route()}</CardTitle>
            </CardHeader>
            <CardContent className='px-4 text-sm'>
              <ol className='flex flex-col gap-3'>
                <li>1 · Direct Manager</li>
                <li>2 · HR Manager</li>
              </ol>
            </CardContent>
          </Card>
          <div className='flex gap-2'>
            <Button variant='outline' className='flex-1' asChild>
              <Link to='/overtime'>{m.overtime_cancel()}</Link>
            </Button>
            <Button className='flex-1' type='submit' onClick={handleSubmit(onSubmit)}>
              {m.overtime_submit()}
            </Button>
          </div>
        </div>
      </div>
    </AppMain>
  )
}
