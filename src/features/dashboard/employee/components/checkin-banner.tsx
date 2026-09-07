import { IconCalendarCheck } from '@tabler/icons-react'

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { m } from '@/i18n/paraglide/messages'

interface CheckInBannerProps {
  checkInTime: string
  workEndTime: string
}

export function CheckInBanner({ checkInTime, workEndTime }: Readonly<CheckInBannerProps>) {
  return (
    <Alert variant='blue-overlay'>
      <AlertIcon>
        <IconCalendarCheck size={18} stroke={2} />
      </AlertIcon>
      <div className='min-w-0 flex-1'>
        <AlertTitle>{m.dashboard_checkin_title({ time: checkInTime })}</AlertTitle>
        <AlertDescription>
          {m.dashboard_checkin_description({ time: workEndTime })}
        </AlertDescription>
      </div>
      <AlertAction>
        <Button type='button' variant='outline' size='xs'>
          {m.dashboard_view_attendance()}
        </Button>
      </AlertAction>
    </Alert>
  )
}
