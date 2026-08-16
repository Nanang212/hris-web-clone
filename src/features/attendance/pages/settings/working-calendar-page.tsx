import { AppMain } from '@/shared/components/app-layout/app-main'
import { Calendar } from '@/shared/components/calendar/calendar'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

export function WorkingCalendarPage() {
  return (
    <AppMain
      title='Working Calendar'
      subtitle='Kelola hari kerja, libur, dan special workday.'
      className='gap-5 bg-muted/30'
    >
      <div className='flex gap-2'>
        <Button size='sm'>Overview</Button>
        <Button size='sm' variant='outline'>
          Public Holidays
        </Button>
        <Button size='sm' variant='outline'>
          Settings
        </Button>
      </div>
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='min-w-0 rounded-2xl border bg-card p-3 shadow-sm'>
          <Calendar />
        </section>
        <aside className='h-fit rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Calendar Rules</h2>
          <dl className='mt-6 space-y-6 text-xs'>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Work Week</dt>
              <dd className='font-semibold'>Monday – Friday</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Weekend</dt>
              <dd className='font-semibold'>Saturday – Sunday</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Public Holidays</dt>
              <dd className='font-semibold'>14 days</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Special Workdays</dt>
              <dd className='font-semibold'>2 days</dd>
            </div>
          </dl>
          <Button variant='outline' className='mt-12'>
            Manage Holiday
          </Button>
        </aside>
      </div>
    </AppMain>
  )
}

export function CalendarSettingsPage() {
  const inputs = [
    ['Work Week', 'Monday – Friday'],
    ['Weekend', 'Saturday – Sunday'],
    ['Timezone', 'Asia/Jakarta (GMT+7)'],
    ['Default Calendar Year', 'January – December'],
    ['Holiday Observance', 'Move to next workday'],
    ['Half-day Duration', '4 hours'],
  ]
  return (
    <AppMain
      title='Calendar Settings'
      subtitle='Atur work week, weekend, timezone, dan kebijakan hari libur.'
      className='gap-5 bg-muted/30'
    >
      <div className='flex gap-2'>
        <Button size='sm' variant='outline'>
          Overview
        </Button>
        <Button size='sm' variant='outline'>
          Public Holidays
        </Button>
        <Button size='sm'>Settings</Button>
      </div>
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Calendar Configuration</h2>
          <p className='mt-1 text-xs text-muted-foreground'>
            Pengaturan berlaku untuk seluruh organisasi.
          </p>
          <div className='mt-6 grid gap-5 md:grid-cols-2'>
            {inputs.map(([label, value]) => (
              <label key={label} className='text-xs text-muted-foreground'>
                {label}
                <Input className='mt-2 rounded-xl border bg-background' defaultValue={value} />
              </label>
            ))}
          </div>
          <div className='mt-8 rounded-xl bg-blue-50 p-4 text-xs text-muted-foreground'>
            <b className='text-primary'>Auto-sync national public holidays</b>
            <p className='mt-2'>
              Tambahkan kalender hari libur nasional secara otomatis setiap tahun.
            </p>
          </div>
          <div className='mt-8 flex justify-end'>
            <Button>Save Calendar Settings</Button>
          </div>
        </section>
        <aside className='rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Holiday Policies</h2>
          <div className='mt-7 space-y-6 text-xs'>
            {[
              ['Public Holiday', 'Paid day off'],
              ['Regional Holiday', 'Based on office location'],
              ['Special Workday', 'Requires HR approval'],
              ['Replacement Day', 'Next available workday'],
            ].map(([label, value]) => (
              <p key={label} className='text-muted-foreground'>
                {label}
                <b className='mt-2 block text-foreground'>{value}</b>
              </p>
            ))}
          </div>
        </aside>
      </div>
    </AppMain>
  )
}
