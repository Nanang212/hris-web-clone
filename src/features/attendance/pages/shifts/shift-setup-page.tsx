import { IconCircleCheck } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Input } from '@/shared/components/ui/input'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

const fields = [
  ['Shift Code', 'SFT-REG'],
  ['Shift Name', 'Regular'],
  ['Start Time', '09:00'],
  ['End Time', '18:00'],
  ['Break Start', '12:00'],
  ['Break End', '13:00'],
  ['Late Tolerance', '15 minutes'],
  ['Early Leave Tolerance', '15 minutes'],
  ['Clock In Window', '08:00 – 09:15'],
  ['Clock Out Window', '17:45 – 23:59'],
]
export function ShiftSetupPage() {
  return (
    <AppMain
      title='Create / Edit Shift'
      subtitle='Detail form shift lengkap dengan validation dan preview.'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='setup' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Shift Information</h2>
          <div className='mt-6 grid gap-x-5 gap-y-5 md:grid-cols-2'>
            {fields.map(([label, value]) => (
              <label className='text-xs text-muted-foreground' key={label}>
                {label}
                <Input className='mt-2 rounded-xl border bg-background' defaultValue={value} />
              </label>
            ))}
          </div>
          <div className='mt-7 rounded-xl bg-blue-50 p-4 text-xs'>
            <b className='text-primary'>Preview</b>
            <p className='mt-2'>08:00 window open → 09:00 shift start → 18:00 shift end</p>
          </div>
        </section>
        <aside className='h-fit rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Validation</h2>
          <div className='mt-6 space-y-7'>
            {[
              ['Schedule duration', '8 hours'],
              ['Break duration', '1 hour'],
              ['Cross-day', 'No'],
              ['Conflict check', 'No conflict'],
            ].map(([title, value]) => (
              <p key={title} className='flex items-center justify-between text-xs'>
                <span className='flex items-center gap-3 text-muted-foreground'>
                  <IconCircleCheck className='size-4 text-emerald-500' />
                  {title}
                </span>
                <b>{value}</b>
              </p>
            ))}
          </div>
        </aside>
      </div>
    </AppMain>
  )
}
