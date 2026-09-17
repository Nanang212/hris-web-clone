import { IconCircleCheck } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

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
      actions={<Button>Save Shift</Button>}
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='setup' />
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <Card className='min-w-0 shadow-sm'>
          <CardHeader className='border-b'>
            <CardTitle>Shift Information</CardTitle>
            <CardDescription>Configure the schedule rules used by attendance.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-5 pt-0 md:grid-cols-2'>
            {fields.map(([label, value]) => (
              <div className='grid gap-1.5' key={label}>
                <Label
                  htmlFor={label.toLowerCase().replaceAll(' ', '-')}
                  className='text-xs text-muted-foreground'
                >
                  {label}
                </Label>
                <Input
                  id={label.toLowerCase().replaceAll(' ', '-')}
                  className='bg-background'
                  defaultValue={value}
                />
              </div>
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
          <CardHeader className='border-b'>
            <CardTitle>Validation</CardTitle>
            <CardDescription>Live checks for this shift master.</CardDescription>
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
