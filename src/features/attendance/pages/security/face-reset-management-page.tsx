import { IconRefresh } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'

export function FaceResetManagementPage() {
  return (
    <AppMain
      title='Face Reset Management'
      subtitle='Reset biometric dengan alasan, approval, dan audit history.'
      breadcrumbs={getAttendanceBreadcrumbs('Face Reset Management')}
      backTo='/attendance/face-recognition'
      className='gap-5 bg-muted/30'
    >
      <Card>
        <CardHeader>
          <CardTitle>Employee Biometric Profiles</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          {[
            ['Rama Aditya', '12 May 2024', 'Enrolled'],
            ['Budi Setiawan', '03 May 2024', 'Re-enroll'],
          ].map(([name, date, status]) => (
            <div
              key={name}
              className='flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4'
            >
              <div>
                <p className='font-semibold'>{name}</p>
                <p className='text-xs text-muted-foreground'>Last enrollment: {date}</p>
              </div>
              <div className='flex items-center gap-3'>
                <Badge variant={status === 'Enrolled' ? 'green' : 'amber'}>{status}</Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-8 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600'
                      aria-label='Reset Profile'
                    >
                      <IconRefresh size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top'>
                    <p>Reset Profile</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppMain>
  )
}
