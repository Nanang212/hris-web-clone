import { IconRefresh, IconUser } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'

export function FaceEnrollmentDetailPage() {
  return (
    <AppMain
      title='Face Enrollment Detail'
      subtitle='Detail biometric profile, samples, quality checks, dan reset.'
      breadcrumbs={getAttendanceBreadcrumbs('Face Enrollment Detail')}
      backTo='/attendance/face-recognition'
      className='gap-5 bg-muted/30'
    >
      <div className='grid gap-5 xl:grid-cols-[1fr_1.2fr]'>
        <Card>
          <CardHeader className='flex-row items-center justify-between'>
            <div className='flex items-center gap-3'>
              <IconUser className='size-6 text-primary' />
              <div>
                <CardTitle>Rama Aditya</CardTitle>
                <p className='text-xs text-muted-foreground'>EMP-2023-00128 • Product</p>
              </div>
            </div>
            <Badge variant='green'>Enrolled</Badge>
          </CardHeader>
          <CardContent>
            <div className='flex h-56 items-center justify-center rounded-full bg-primary/10'>
              <IconUser className='size-24 text-primary' />
            </div>
            <dl className='mt-6 grid gap-4 text-sm sm:grid-cols-2'>
              {[
                ['Quality', '96 / 100'],
                ['Samples', '3'],
                ['Similarity Baseline', '98.4%'],
                ['Enrollment Date', '12 May 2024'],
                ['Last Verified', '16 May 2024 08:45'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className='text-xs text-muted-foreground'>{label}</dt>
                  <dd className='mt-1 font-medium'>{value}</dd>
                </div>
              ))}
            </dl>
            <div className='mt-6 flex gap-2'>
              <Button variant='outline'>
                <IconRefresh />
                Reset Face
              </Button>
              <Button variant='outline'>Re-enroll</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quality Checks</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-5'>
            {[
              ['Face centered', 'Pass'],
              ['Lighting', 'Pass'],
              ['Sharpness', 'Pass'],
              ['Liveness baseline', 'Pass'],
              ['Occlusion', 'None'],
              ['Multiple face', 'None'],
            ].map(([label, value]) => (
              <div key={label} className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppMain>
  )
}
