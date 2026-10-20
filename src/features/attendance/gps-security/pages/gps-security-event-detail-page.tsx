import { IconAlertTriangle, IconMapPin } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'

export function GpsSecurityEventDetailPage() {
  return (
    <AppMain
      title='GPS Security Event Detail'
      subtitle='Detail evidence, coordinates, device signals, dan resolution.'
      breadcrumbs={getAttendanceBreadcrumbs('GPS Security Event Detail')}
      backTo='/attendance/gps-security'
      className='gap-5 bg-muted/30'
    >
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <Card>
          <CardHeader className='flex-row items-center justify-between'>
            <CardTitle>Fake GPS Detected</CardTitle>
            <Badge variant='red'>Critical</Badge>
          </CardHeader>
          <CardContent className='flex flex-col gap-5'>
            <div className='flex items-center gap-3'>
              <IconMapPin className='size-5 text-primary' />
              <div>
                <p className='font-semibold'>Budi Setiawan</p>
                <p className='text-xs text-muted-foreground'>16 May 2024 • 09:02</p>
              </div>
            </div>
            <dl className='grid gap-4 text-sm sm:grid-cols-2'>
              {[
                ['Action', 'Clock In'],
                ['Coordinates', '-6.2089, 106.8454'],
                ['Geofence', 'Jakarta HQ'],
                ['Accuracy', '3 meters'],
                ['Mock Location API', 'Detected'],
                ['Device', 'Android 13 • Samsung S22'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className='text-xs text-muted-foreground'>{label}</dt>
                  <dd className='mt-1 font-medium'>{value}</dd>
                </div>
              ))}
            </dl>
            <div className='flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600'>
              <IconAlertTriangle className='size-5 shrink-0' />
              <p>
                <b>Attendance blocked automatically.</b>
                <br />
                <span className='text-xs'>
                  Event dikirim ke security log dan membutuhkan review.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className='h-fit'>
          <CardHeader>
            <CardTitle>Resolution</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Button variant='outline'>Dismiss</Button>
            <Button variant='destructive'>Confirm Violation</Button>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
