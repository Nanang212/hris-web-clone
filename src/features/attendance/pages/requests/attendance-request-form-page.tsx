import { IconCalendarEvent, IconFileUpload, IconMapPin } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import { m } from '@/i18n/paraglide/messages'

function ReadOnlyField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <label className='block text-xs font-medium text-muted-foreground'>
      {label}
      <Input className='mt-1.5 bg-muted/30 text-foreground' value={value} readOnly />
    </label>
  )
}

export function AttendanceRequestFormPage() {
  return (
    <AppMain
      title={m.attendance_request_form_title()}
      subtitle={m.attendance_request_form_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='requests' />
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='text-lg font-semibold'>{m.attendance_request_form_type()}</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            {m.attendance_request_form_type_description()}
          </p>
          <div className='mt-6 grid gap-5 sm:grid-cols-2'>
            <ReadOnlyField
              label={m.attendance_history_employee()}
              value='Rama Aditya • EMP-2023-00128'
            />
            <ReadOnlyField label={m.attendance_table_date()} value='16 Mei 2024' />
            <ReadOnlyField label={m.attendance_request_form_time()} value='08:52' />
            <ReadOnlyField label={m.attendance_clock_work_mode()} value='WFO' />
            <ReadOnlyField
              label={m.attendance_clock_location()}
              value={m.attendance_office_location()}
            />
            <ReadOnlyField
              label={m.attendance_requests_reason()}
              value={m.attendance_request_form_reason_value()}
            />
          </div>
          <div className='mt-6'>
            <p className='text-xs font-medium text-muted-foreground'>
              {m.attendance_request_form_attachment()}
            </p>
            <button
              type='button'
              className='mt-1.5 flex h-25 w-full items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-5 text-left'
            >
              <span className='rounded-lg bg-blue-50 p-3 text-blue-600'>
                <IconFileUpload className='size-5' />
              </span>
              <span>
                <span className='block text-sm font-medium'>
                  {m.attendance_request_form_upload()}
                </span>
                <span className='mt-1 block text-xs text-muted-foreground'>
                  {m.attendance_request_form_upload_hint()}
                </span>
              </span>
            </button>
          </div>
          <div className='mt-5 flex gap-2 rounded-xl bg-blue-50 p-4 text-sm text-blue-600'>
            <IconMapPin className='size-5 shrink-0' />
            <div>
              <p className='font-semibold'>{m.attendance_request_form_notice()}</p>
              <p className='mt-1 text-xs text-blue-500'>
                {m.attendance_request_form_notice_description()}
              </p>
            </div>
          </div>
          <div className='mt-6 flex justify-end gap-2'>
            <Button variant='outline' asChild>
              <Link to='/attendance/requests'>{m.attendance_request_form_cancel()}</Link>
            </Button>
            <Button>{m.attendance_request_form_submit()}</Button>
          </div>
        </section>
        <aside className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='font-semibold'>{m.attendance_request_form_approval()}</h3>
          <div className='mt-5 space-y-5 text-sm'>
            <div className='flex gap-3'>
              <IconCalendarEvent className='size-5 text-blue-600' />
              <div>
                <p className='font-semibold'>{m.attendance_request_form_manager()}</p>
                <p className='text-xs text-muted-foreground'>Rama Aditya</p>
              </div>
            </div>
            <div className='flex gap-3'>
              <IconCalendarEvent className='size-5 text-blue-600' />
              <div>
                <p className='font-semibold'>HR</p>
                <p className='text-xs text-muted-foreground'>Dewi Kartika</p>
              </div>
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>{m.attendance_request_form_sla()}</p>
              <p className='mt-2 font-semibold'>{m.attendance_request_form_sla_value()}</p>
            </div>
          </div>
        </aside>
      </div>
    </AppMain>
  )
}
