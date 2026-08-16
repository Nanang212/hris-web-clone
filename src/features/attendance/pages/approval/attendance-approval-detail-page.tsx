import {
  IconCamera,
  IconCircleCheck,
  IconDeviceMobile,
  IconMapPin,
  IconX,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

const evidence = [
  [IconMapPin, 'GPS', '08:49 • Within Head Office geofence'],
  [IconDeviceMobile, 'Device', '08:48 • App opened on Pixel 7 Pro'],
  [IconCamera, 'Face', '08:53 • No face verification record'],
  [IconCircleCheck, 'Schedule', 'Shift starts 09:00 • 15 min tolerance'],
]

export function AttendanceApprovalDetailPage() {
  const navigate = useNavigate()
  return (
    <AppMain
      title='Attendance Approval Detail'
      subtitle='Compare evidence sebelum approve atau reject.'
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='approval' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,.85fr)]'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <h2 className='text-lg font-bold'>REQ-0241 • Forgot Clock In</h2>
            <span className='rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600'>
              Needs Action
            </span>
          </div>
          <dl className='mt-7 grid grid-cols-[180px_1fr] gap-x-4 gap-y-5 text-sm'>
            <dt className='text-muted-foreground'>Requester</dt>
            <dd className='font-semibold'>Rama Aditya</dd>
            <dt className='text-muted-foreground'>Tanggal</dt>
            <dd className='font-semibold'>16 Mei 2024</dd>
            <dt className='text-muted-foreground'>Requested Clock In</dt>
            <dd className='font-semibold'>08:52</dd>
            <dt className='text-muted-foreground'>Shift</dt>
            <dd className='font-semibold'>09:00–18:00</dd>
            <dt className='text-muted-foreground'>Reason</dt>
            <dd className='font-semibold'>Aplikasi tidak dapat dibuka saat tiba di kantor</dd>
          </dl>
          <h3 className='mt-10 text-sm font-bold'>Evidence</h3>
          <div className='mt-3 space-y-3'>
            {evidence.map(([Icon, title, description]) => (
              <div key={title as string} className='flex items-center gap-3 text-xs'>
                <span className='rounded-xl bg-blue-50 p-2 text-primary'>
                  <Icon className='size-4' />
                </span>
                <span className='w-12 font-semibold'>{title}</span>
                <span className='text-muted-foreground'>{description}</span>
              </div>
            ))}
          </div>
        </section>
        <aside className='flex min-h-105 flex-col rounded-2xl border bg-card p-5 shadow-sm'>
          <h2 className='font-bold'>Decision</h2>
          <label className='mt-6 text-xs font-medium text-muted-foreground' htmlFor='approval-note'>
            Decision Note
          </label>
          <Input
            id='approval-note'
            className='mt-2 rounded-xl border bg-background'
            placeholder='Tambahkan catatan approval...'
          />
          <p className='mt-7 text-xs font-medium text-muted-foreground'>Impact</p>
          <div className='mt-2 rounded-xl bg-blue-50 p-4 text-xs text-muted-foreground'>
            <p className='font-semibold text-primary'>Jika disetujui:</p>
            <p className='mt-2'>
              Clock In 08:52 akan tercatat dan recap attendance akan dihitung ulang.
            </p>
          </div>
          <div className='mt-auto grid grid-cols-2 gap-3 pt-8'>
            <Button
              variant='outline'
              className='border-destructive text-destructive'
              onClick={() => navigate({ to: '/attendance/approval/REQ-0241/reject' })}
            >
              <IconX />
              Reject
            </Button>
            <Button>
              <IconCircleCheck />
              Approve
            </Button>
          </div>
        </aside>
      </div>
    </AppMain>
  )
}
