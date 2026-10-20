import { IconCheck, IconCircleCheck, IconFaceId, IconNumber3 } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { cn } from '@/shared/lib/utils'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'

interface VerificationStepProps {
  icon: typeof IconCheck
  title: string
  description: string
  completed?: boolean
}

function VerificationStep({
  icon: Icon,
  title,
  description,
  completed = false,
}: Readonly<VerificationStepProps>) {
  return (
    <div className='flex items-center gap-3'>
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          completed ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className='size-4' />
      </span>
      <div>
        <p className='text-sm font-semibold'>{title}</p>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}

export function ClockInOutPage() {
  const [attendanceType, setAttendanceType] = useState<'regular' | 'overtime' | 'business-trip'>(
    'regular',
  )
  const attendanceTypes = [
    {
      value: 'regular' as const,
      label: m.attendance_clock_type_regular(),
      description: m.attendance_clock_type_regular_description(),
    },
    {
      value: 'overtime' as const,
      label: m.attendance_clock_type_overtime(),
      description: m.attendance_clock_type_overtime_description(),
    },
    {
      value: 'business-trip' as const,
      label: m.attendance_clock_type_business_trip(),
      description: m.attendance_clock_type_business_trip_description(),
    },
  ]
  const requirements = [
    { label: m.attendance_clock_gps_active(), value: m.attendance_clock_gps_accuracy() },
    { label: m.attendance_clock_location(), value: m.attendance_zone(), success: true },
    { label: m.attendance_clock_face_recognition(), value: m.attendance_clock_face_verified() },
    { label: m.attendance_clock_work_mode(), value: m.attendance_clock_wfo() },
  ]

  return (
    <AppMain
      title={m.attendance_clock_title()}
      subtitle={m.attendance_clock_subtitle()}
      breadcrumbs={getAttendanceBreadcrumbs(m.attendance_clock_title())}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='clock' />

      <Card>
        <CardContent className='p-4'>
        <div className='flex flex-wrap items-center gap-x-6 gap-y-1'>
          <h3 className='text-base font-semibold'>{m.attendance_clock_type_title()}</h3>
          <p className='text-xs text-muted-foreground'>{m.attendance_clock_type_description()}</p>
        </div>
        <RadioGroup
          value={attendanceType}
          onValueChange={(value) => setAttendanceType(value as typeof attendanceType)}
          className='mt-3 grid gap-3 md:grid-cols-3'
          aria-label={m.attendance_clock_type_title()}
        >
          {attendanceTypes.map((type) => (
            <label
              key={type.value}
              htmlFor={`attendance-type-${type.value}`}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                attendanceType === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <span className='min-w-0'>
                <span className='block text-sm font-semibold'>{type.label}</span>
                <span className='block truncate text-xs text-muted-foreground'>
                  {type.description}
                </span>
              </span>
              <RadioGroupItem id={`attendance-type-${type.value}`} value={type.value} />
            </label>
          ))}
        </RadioGroup>
        </CardContent>
      </Card>

      <div className='grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.75fr)_340px]'>
        <Card>
          <CardContent className='p-5'>
          <h3 className='text-lg font-semibold'>{m.attendance_clock_face_verification_title()}</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            {m.attendance_clock_face_verification_subtitle()}
          </p>

          <div className='mt-5 flex min-h-88 flex-col items-center justify-center rounded-xl bg-slate-950 px-6 text-center text-white'>
            <IconFaceId className='size-32 text-blue-400' stroke={1.35} />
            <span className='mt-7 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-600'>
              {m.attendance_clock_face_detected()}
            </span>
            <p className='mt-4 text-xs text-slate-300'>{m.attendance_clock_face_hint()}</p>
          </div>

          <div className='mt-5 grid gap-4 sm:grid-cols-3'>
            <VerificationStep
              icon={IconCheck}
              completed
              title={m.attendance_clock_step_gps()}
              description={m.attendance_clock_step_gps_description()}
            />
            <VerificationStep
              icon={IconCheck}
              completed
              title={m.attendance_clock_step_face()}
              description={m.attendance_clock_step_face_description()}
            />
            <VerificationStep
              icon={IconNumber3}
              title={m.attendance_clock_step_record()}
              description={m.attendance_clock_step_record_description()}
            />
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='flex flex-1 flex-col p-5'>
          <h3 className='text-lg font-semibold'>{m.attendance_clock_requirements_title()}</h3>
          <span className='mt-3 w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600'>
            {m.attendance_clock_requirements_complete()}
          </span>

          <div className='mt-6'>
            <p className='text-xs text-muted-foreground'>{m.attendance_clock_schedule_label()}</p>
            <p className='mt-1 text-2xl font-bold tracking-tight'>
              {m.attendance_clock_schedule_time()}
            </p>
            <p className='mt-1 text-sm font-medium'>{m.attendance_office_location()}</p>
          </div>

          <dl className='mt-7 space-y-7'>
            {requirements.map((requirement) => (
              <div
                key={requirement.label}
                className='flex items-start justify-between gap-3 text-xs'
              >
                <dt className='text-muted-foreground'>{requirement.label}</dt>
                <dd
                  className={cn(
                    'text-right font-semibold',
                    requirement.success && 'text-emerald-600',
                  )}
                >
                  {requirement.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className='mt-auto grid gap-2'>
            <Button className='w-full rounded-lg' size='lg' asChild>
              <Link to='/attendance/clock-in-success'>
                <IconCircleCheck />
                {m.attendance_clock_submit_button()}
              </Link>
            </Button>
            <Button variant='link' size='sm' className='h-auto' asChild>
              <Link to='/attendance/clock-out'>Already clocked in? Clock Out</Link>
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
