import { IconCheck, IconFileDescription } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

export function AttendanceRequestDetailPage() {
  return (
    <AppMain
      title='Request Detail'
      subtitle='Status, approval timeline, attachment, dan audit request.'
      breadcrumbs={getAttendanceBreadcrumbs('Request Detail')}
      backTo='/attendance/requests'
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='requests' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <Card>
          <CardHeader className='flex-row items-start justify-between'>
            <div>
              <CardTitle>REQ-0241 • Forgot Clock In</CardTitle>
              <p className='mt-1 text-xs text-muted-foreground'>Submitted 16 Mei 2024, 09:10</p>
            </div>
            <Badge variant='amber'>Pending</Badge>
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            <dl className='grid gap-4 text-sm sm:grid-cols-2'>
              {[
                ['Employee', 'Rama Aditya'],
                ['Tanggal', '16 Mei 2024'],
                ['Requested Clock In', '08:52'],
                ['Mode Kerja', 'WFO'],
                ['Lokasi', 'Head Office – Jakarta'],
                ['Alasan', 'Aplikasi tidak dapat dibuka saat tiba di kantor'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className='text-xs text-muted-foreground'>{label}</dt>
                  <dd className='mt-1 font-medium'>{value}</dd>
                </div>
              ))}
            </dl>
            <div className='rounded-xl border bg-muted/30 p-4'>
              <div className='flex items-center gap-3'>
                <IconFileDescription className='size-5 text-primary' />
                <div>
                  <p className='text-sm font-semibold'>attendance_error.jpg</p>
                  <p className='text-xs text-muted-foreground'>1.2 MB</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className='font-semibold'>Request Timeline</h3>
              <div className='mt-4 flex flex-col gap-4 text-sm'>
                {[
                  ['09:10', 'Request submitted'],
                  ['09:12', 'Manager notified'],
                  ['–', 'Waiting Manager approval'],
                ].map(([time, label], index) => (
                  <div key={label} className='flex items-center gap-3'>
                    <IconCheck
                      className={index === 2 ? 'size-4 text-amber-500' : 'size-4 text-primary'}
                    />
                    <span className='w-12 text-xs text-muted-foreground'>{time}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='h-fit'>
          <CardHeader>
            <CardTitle>Approval</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            <div>
              <p className='font-medium'>Manager Approval</p>
              <p className='text-xs text-muted-foreground'>Rama Aditya</p>
              <Badge className='mt-2' variant='amber'>
                Pending
              </Badge>
            </div>
            <div>
              <p className='font-medium'>HR Approval</p>
              <p className='text-xs text-muted-foreground'>Dewi Kartika</p>
              <Badge className='mt-2' variant='blue'>
                Waiting
              </Badge>
            </div>
            <Button variant='outline'>Cancel Request</Button>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
