import { IconAlertTriangle, IconPlus } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

const fields = [
  ['Employee', 'Rama Aditya • EMP-2023-00128'],
  ['Tanggal', '16 Mei 2024'],
  ['Clock In', '08:52'],
  ['Clock Out', '17:30'],
  ['Mode Kerja', 'WFO'],
  ['Lokasi', 'Head Office – Jakarta'],
  ['Reason Category', 'System / Device Issue'],
  ['Catatan', 'Aplikasi error saat employee tiba di kantor'],
]

export function ManualAttendancePage() {
  return (
    <AppMain
      title='Manual Attendance'
      subtitle='HR dapat menambahkan atau memperbaiki attendance dengan audit trail.'
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='management' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='flex justify-between'>
            <h2 className='font-bold'>Input Manual Attendance</h2>
            <span className='rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600'>
              HR Only
            </span>
          </div>
          <div className='mt-7 grid gap-x-5 gap-y-5 md:grid-cols-2'>
            {fields.map(([label, value]) => (
              <label key={label} className='text-xs font-medium text-muted-foreground'>
                {label}
                <Input
                  defaultValue={value}
                  className='mt-2 rounded-xl border bg-background text-foreground'
                />
              </label>
            ))}
          </div>
          <div className='mt-7 text-xs font-medium text-muted-foreground'>
            Supporting Evidence
            <button
              type='button'
              className='mt-2 flex w-full items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-5 text-left text-foreground'
            >
              <span className='rounded-lg bg-blue-50 p-2 text-primary'>
                <IconPlus />
              </span>
              <span>
                <b className='block'>Upload bukti pendukung</b>
                <span className='text-muted-foreground'>PDF, JPG, PNG • max 5 MB</span>
              </span>
            </button>
          </div>
          <div className='mt-4 flex items-center gap-3 rounded-xl bg-orange-50 p-4 text-xs text-orange-600'>
            <IconAlertTriangle className='size-5 shrink-0' />
            Perubahan manual akan tercatat di Audit Trail dan membutuhkan alasan.
          </div>
          <div className='mt-4 flex justify-end gap-3'>
            <Button variant='outline'>Batal</Button>
            <Button>Review</Button>
          </div>
        </section>
        <aside className='h-fit rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Existing Record</h2>
          <dl className='mt-6 space-y-6 text-xs'>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Status</dt>
              <dd className='font-semibold'>Belum Clock In</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Shift</dt>
              <dd className='font-semibold'>09:00–18:00</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Attendance</dt>
              <dd className='font-semibold'>Belum ada record</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Request Pending</dt>
              <dd className='font-semibold'>Tidak ada</dd>
            </div>
          </dl>
        </aside>
      </div>
    </AppMain>
  )
}
