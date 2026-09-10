import { Link } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Calendar } from '@/shared/components/calendar/calendar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { CalendarTabs } from '@/features/attendance/components/calendar-tabs'

export function WorkingCalendarPage() {
  return (
    <AppMain
      title='Working Calendar'
      subtitle='Kelola hari kerja, libur, dan special workday.'
      breadcrumbs={getAttendanceBreadcrumbs('Working Calendar')}
      backTo='/attendance'
      className='gap-5 bg-muted/30'
    >
      <CalendarTabs active='overview' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <Card className='min-w-0'>
          <CardContent className='p-3'>
            <Calendar />
          </CardContent>
        </Card>
        <Card className='h-fit'>
          <CardHeader>
            <CardTitle>Calendar Rules</CardTitle>
          </CardHeader>
          <CardContent>
          <dl className='grid gap-6 text-xs'>
            <div className='flex justify-between gap-4'>
              <dt className='text-muted-foreground'>Work Week</dt>
              <dd className='text-right font-semibold'>Monday - Friday</dd>
            </div>
            <div className='flex justify-between gap-4'>
              <dt className='text-muted-foreground'>Weekend</dt>
              <dd className='text-right font-semibold'>Saturday - Sunday</dd>
            </div>
            <div className='flex justify-between gap-4'>
              <dt className='text-muted-foreground'>Public Holidays</dt>
              <dd className='text-right font-semibold'>14 days</dd>
            </div>
            <div className='flex justify-between gap-4'>
              <dt className='text-muted-foreground'>Special Workdays</dt>
              <dd className='text-right font-semibold'>2 days</dd>
            </div>
          </dl>
          <Button variant='outline' className='mt-12 w-full' asChild>
            <Link to='/attendance/calendar/holidays'>Manage Holiday</Link>
          </Button>
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
