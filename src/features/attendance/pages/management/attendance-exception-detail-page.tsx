import { IconCircle, IconMapPin } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

const details = [
  ['Clock In', '08:55'],
  ['Clock Out', '–'],
  ['Last App Activity', '17:10'],
  ['Last GPS', '17:12 • Head Office'],
  ['Device', 'Pixel 7 Pro'],
  ['Pending Request', 'Tidak ada'],
]
export function AttendanceExceptionDetailPage() {
  return (
    <AppMain
      title='Exception Detail'
      subtitle='Investigasi dan resolve attendance exception.'
      breadcrumbs={getAttendanceBreadcrumbs('Exception Detail')}
      backTo='/attendance/management'
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='management' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='flex justify-between'>
            <h2 className='text-lg font-bold'>Missing Clock Out</h2>
            <span className='rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600'>
              High Risk
            </span>
          </div>
          <div className='mt-6 flex gap-3'>
            <span className='rounded-xl bg-blue-50 p-2 text-primary'>
              <IconMapPin />
            </span>
            <div>
              <b className='text-sm'>Rama Aditya</b>
              <p className='text-xs text-muted-foreground'>10 Mei 2024 • Shift 09:00–18:00</p>
            </div>
          </div>
          <dl className='mt-9 grid grid-cols-[180px_1fr] gap-y-6 text-sm'>
            {details.map(([label, value]) => (
              <>
                <dt key={`${label}-dt`} className='text-muted-foreground'>
                  {label}
                </dt>
                <dd key={`${label}-dd`} className='font-semibold'>
                  {value}
                </dd>
              </>
            ))}
          </dl>
          <h3 className='mt-10 text-sm font-bold'>Evidence Timeline</h3>
          <div className='mt-4 space-y-4'>
            {[
              '08:55     Clock In recorded',
              '12:06     App opened',
              '17:10     Last app activity',
              '17:12     Last GPS inside office',
            ].map((event) => (
              <p key={event} className='flex items-center gap-3 text-xs'>
                <IconCircle className='size-2 fill-primary text-primary' />
                {event}
              </p>
            ))}
          </div>
        </section>
        <aside className='flex min-h-120 flex-col rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Resolve Exception</h2>
          <label className='mt-6 text-xs text-muted-foreground'>
            Resolution
            <Input
              className='mt-2 rounded-xl border bg-background'
              placeholder='Pilih resolution'
            />
          </label>
          <label className='mt-6 text-xs text-muted-foreground'>
            Clock Out Time
            <Input className='mt-2 rounded-xl border bg-background' defaultValue='17:30' />
          </label>
          <label className='mt-6 text-xs text-muted-foreground'>
            Reason
            <Input
              className='mt-2 rounded-xl border bg-background'
              defaultValue='Confirmed by manager'
            />
          </label>
          <div className='mt-9 rounded-xl bg-blue-50 p-4 text-xs text-muted-foreground'>
            <p className='font-semibold text-primary'>Tidak ada Auto Clock Out.</p>
            <p className='mt-2'>Resolution harus manual melalui request atau HR.</p>
          </div>
          <div className='mt-auto grid grid-cols-2 gap-3 pt-8'>
            <Button variant='outline'>Mark Unresolved</Button>
            <Button>Resolve</Button>
          </div>
        </aside>
      </div>
    </AppMain>
  )
}
