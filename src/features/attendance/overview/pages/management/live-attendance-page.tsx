import { IconMapPin, IconUserCheck } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'

const rows = [
  ['Rama Aditya', 'Product', '08:45', 'Jakarta HQ', 'Hadir'],
  ['Sinta Maharani', 'Design', '08:47', 'Jakarta HQ', 'Hadir'],
  ['Budi Setiawan', 'Engineering', '09:02', 'Jakarta HQ', 'Terlambat'],
]

export function LiveAttendancePage() {
  return (
    <AppMain
      title='Live Attendance'
      subtitle='Monitoring real-time kehadiran berdasarkan kategori, lokasi, dan exception.'
      breadcrumbs={getAttendanceBreadcrumbs('Live Attendance')}
      className='gap-5 bg-muted/30'
    >
      <AttendanceTabs active='management' />
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          ['1,183', 'Checked In', 'Live'],
          ['65', 'Belum Hadir', 'Perlu perhatian'],
          ['6', 'Di luar Geofence', 'Security flag'],
          ['142', 'WFH / WFA', 'Remote'],
        ].map(([value, label, state]) => (
          <Card key={label}>
            <CardContent className='p-5'>
              <div className='flex items-start justify-between'>
                <IconUserCheck className='size-5 text-primary' />
                <Badge variant={state === 'Live' ? 'green' : 'amber'}>{state}</Badge>
              </div>
              <p className='mt-4 text-3xl font-bold'>{value}</p>
              <p className='text-xs text-muted-foreground'>{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_360px]'>
        <Card className='min-h-80'>
          <CardHeader>
            <CardTitle>Live Location Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex h-56 items-center justify-center rounded-xl bg-primary/10'>
              <IconMapPin className='size-12 text-primary' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            {rows.map(([name, , time, , status]) => (
              <div key={name} className='flex items-center justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold'>{name}</p>
                  <p className='text-xs text-muted-foreground'>{time}</p>
                </div>
                <Badge variant={status === 'Terlambat' ? 'amber' : 'green'}>{status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
