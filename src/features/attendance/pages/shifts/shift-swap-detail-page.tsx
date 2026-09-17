import { IconCheck } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

export function ShiftSwapDetailPage() {
  return (
    <AppMain
      title='Shift Swap Detail'
      subtitle='Bandingkan shift, conflict, dan impact sebelum approval.'
      breadcrumbs={getAttendanceBreadcrumbs('Shift Swap Detail')}
      backTo='/attendance/management/shifts/swaps'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='swaps' />
      <div className='grid gap-5 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Swap Request</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            <div>
              <p className='text-xs text-muted-foreground'>Requester</p>
              <p className='mt-1 font-semibold'>Rama Aditya</p>
              <p className='text-xs text-muted-foreground'>Regular • 09:00–18:00</p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>Swap with</p>
              <p className='mt-1 font-semibold'>Budi Setiawan</p>
              <p className='text-xs text-muted-foreground'>Morning • 07:00–16:00</p>
            </div>
            <dl className='grid gap-4 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-xs text-muted-foreground'>Date</dt>
                <dd className='mt-1 font-medium'>20 Mei 2024</dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>Reason</dt>
                <dd className='mt-1 font-medium'>Personal appointment</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conflict Check</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-5'>
            {['Schedule overlap', 'Rest period', 'Working calendar', 'Attendance request'].map(
              (item) => (
                <div key={item} className='flex items-center justify-between text-sm'>
                  <span className='flex items-center gap-2'>
                    <IconCheck className='size-4 text-emerald-600' />
                    {item}
                  </span>
                  <b>
                    {item === 'Rest period'
                      ? '11 hours • OK'
                      : item === 'Working calendar'
                        ? 'Working day'
                        : 'No conflict'}
                  </b>
                </div>
              ),
            )}
            <div className='mt-3 flex gap-2'>
              <Button variant='destructive'>Reject</Button>
              <Button>Approve Swap</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
