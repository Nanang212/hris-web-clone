import { IconCheck } from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'

export function FaceVerificationSettingsPage() {
  return (
    <AppMain
      title='Face Verification Settings'
      subtitle='Atur matching, liveness, blink, head movement, quality, dan retention.'
      breadcrumbs={getAttendanceBreadcrumbs('Face Verification Settings')}
      backTo='/attendance/face-recognition'
      className='gap-5 bg-muted/30'
    >
      <Card>
        <CardHeader>
          <CardTitle>Verification Controls</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 md:grid-cols-2'>
          {[
            ['Face Matching', 'Similarity threshold: 85%'],
            ['Liveness Detection', 'Blink and look left & right'],
            ['Face Quality Validation', 'Minimum quality score: 75 / 100'],
            ['Attendance Photo Storage', 'Retention: 30 days'],
          ].map(([title, value]) => (
            <div key={title} className='flex items-center justify-between rounded-xl border p-4'>
              <div>
                <p className='font-semibold'>{title}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{value}</p>
              </div>
              <Badge variant='green'>
                <IconCheck />
                Enabled
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className='flex justify-end'>
        <Button>Save Changes</Button>
      </div>
    </AppMain>
  )
}
