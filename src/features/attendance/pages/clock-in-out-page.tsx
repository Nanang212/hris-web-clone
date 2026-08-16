import {
  IconCheck,
  IconCircleCheck,
  IconFaceId,
  IconMapPin,
  IconNumber3,
} from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
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
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='clock' />

      <div className='grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.75fr)_340px]'>
        <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
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
        </section>

        <aside className='flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm'>
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

          <Button className='mt-auto w-full rounded-lg' size='lg'>
            <IconCircleCheck />
            {m.attendance_clock_submit_button()}
          </Button>
        </aside>
      </div>
    </AppMain>
  )
}
