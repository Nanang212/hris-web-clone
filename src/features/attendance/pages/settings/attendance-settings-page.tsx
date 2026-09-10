import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

const policy = [
  ['Missing Clock Reminder', 'Kirim reminder saat belum Clock In/Out', true],
  ['Auto Clock Out', 'Otomatis menutup attendance pada waktu tertentu', true],
  ['Face Verification', 'Wajib untuk Clock In dan Clock Out', true],
  ['GPS Validation', 'Wajib untuk WFO dan WFA', true],
] as const

export function AttendanceSettingsPage() {
  const [workModes, setWorkModes] = useState<Record<string, boolean>>({
    WFO: true,
    WFH: true,
    'Hybrid / WFA': false,
  })
  const [policyValues, setPolicyValues] = useState<Record<string, boolean>>(
    Object.fromEntries(policy.map(([title, , checked]) => [title, checked])),
  )
  const hybrid = false
  return (
    <AppMain
      title='Edit Attendance Settings'
      subtitle='Ubah mode kerja, tolerance, automation, dan validation policy.'
      breadcrumbs={getAttendanceBreadcrumbs('Attendance Settings')}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='settings' />
      <section className='rounded-2xl border bg-card p-5 shadow-sm'>
        <h2 className='font-bold'>Work Modes</h2>
        <div className='mt-5 grid gap-6 md:grid-cols-3'>
          {[
            ['WFO', 'Office · Geofence + Face', true],
            ['WFH', 'Home · Face + Location', true],
            ['Hybrid / WFA', 'Flexible · Allowed area', hybrid],
          ].map(([name, desc, value]) => (
            <div key={name as string} className='flex items-start justify-between'>
              <div>
                <p className='text-sm font-semibold'>{name}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{desc}</p>
              </div>
              <Switch
                checked={workModes[name] ?? (value as boolean)}
                onCheckedChange={(checked) =>
                  setWorkModes((current) => ({ ...current, [name]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </section>
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_305px]'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Attendance Policy</h2>
          <p className='mt-1 text-xs text-muted-foreground'>
            Semua perubahan wajib memiliki audit reason.
          </p>
          <div className='mt-5 grid gap-5 md:grid-cols-2'>
            {[
              ['Late tolerance', '15 minutes'],
              ['Early leave tolerance', '15 minutes'],
              ['Clock In window', '60 minutes before shift'],
              ['Clock Out window', '4 hours after shift'],
            ].map(([label, value]) => (
              <label key={label} className='text-xs text-muted-foreground'>
                {label}
                <Input className='mt-2 rounded-xl border bg-background' defaultValue={value} />
              </label>
            ))}
          </div>
          <div className='mt-7 grid gap-7 md:grid-cols-2'>
            {policy.map(([title, desc]) => (
              <div key={title} className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold'>{title}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>{desc}</p>
                  {title === 'Auto Clock Out' && (
                    <label className='mt-3 block text-xs text-muted-foreground'>
                      Auto Clock Out time
                      <Input
                        className='mt-2 rounded-xl border bg-background'
                        defaultValue='18:30'
                      />
                    </label>
                  )}
                </div>
                <Switch
                  checked={policyValues[title] ?? false}
                  onCheckedChange={(checked) =>
                    setPolicyValues((current) => ({ ...current, [title]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </section>
        <aside className='h-fit rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Change Summary</h2>
          <span className='mt-5 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600'>
            3 unsaved changes
          </span>
          <div className='mt-6 space-y-5 text-xs'>
            <p className='text-muted-foreground'>
              Hybrid / WFA
              <br />
              <b className='mt-2 block text-foreground'>Enabled → Disabled</b>
            </p>
            <p className='text-muted-foreground'>
              Auto Clock Out
              <br />
              <b className='mt-2 block text-foreground'>Disabled → Enabled</b>
            </p>
            <p className='text-muted-foreground'>
              Clock Out time
              <br />
              <b className='mt-2 block text-foreground'>— → 18:30</b>
            </p>
          </div>
          <div className='mt-6 rounded-xl bg-blue-50 p-4 text-xs text-muted-foreground'>
            <b className='text-primary'>Impact preview</b>
            <p className='mt-2'>1,248 employees · 4 branches</p>
          </div>
          <div className='mt-6 grid grid-cols-2 gap-3'>
            <Button variant='outline'>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </aside>
      </div>
    </AppMain>
  )
}
