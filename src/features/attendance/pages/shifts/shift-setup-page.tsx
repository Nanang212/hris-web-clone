import { IconCircleCheck } from '@tabler/icons-react'

import { ShiftTabs } from '@/features/attendance/components/shift-tabs'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'

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
      breadcrumbs={getAttendanceBreadcrumbs('Shift Setup')}
      backTo='/attendance/management/shifts'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='setup' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <Card className='min-w-0 shadow-sm'>
          <CardHeader>
            <CardTitle>Shift Information</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-5 pt-0 md:grid-cols-2'>
            {fields.map(([label, value]) => (
              <label className='text-xs text-muted-foreground' key={label}>
                {label}
                <Input className='mt-2 bg-background' defaultValue={value} />
              </label>
            ))}
            <Alert variant='info' className='md:col-span-2'>
              <AlertIcon>
                <IconCircleCheck />
              </AlertIcon>
              <div className='min-w-0'>
                <AlertTitle>Preview</AlertTitle>
            <p className='mt-2'>08:00 window open → 09:00 shift start → 18:00 shift end</p>
              </div>
            </Alert>
          </CardContent>
        </Card>
        <Card className='h-fit min-w-0 shadow-sm'>
          <CardHeader>
            <CardTitle>Validation</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-6 pt-0'>
            {[
              ['Schedule duration', '8 hours'],
              ['Break duration', '1 hour'],
              ['Cross-day', 'No'],
              ['Conflict check', 'No conflict'],
            ].map(([title, value]) => (
              <p key={title} className='flex items-center justify-between text-xs'>
                <span className='flex items-center gap-3 text-muted-foreground'>
                  <IconCircleCheck className='size-4 shrink-0 text-primary' />
                  {title}
                </span>
                <b>{value}</b>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
