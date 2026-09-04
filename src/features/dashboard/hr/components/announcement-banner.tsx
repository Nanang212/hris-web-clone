import { IconSpeakerphone } from '@tabler/icons-react'

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { m } from '@/i18n/paraglide/messages'

export function AnnouncementBanner() {
  const announcements = [
    {
      id: 'ann-1',
      title: 'Town Hall',
      subtitle: 'System Maintenance · Updated Hybrid Work Policy',
    },
  ]

  return (
    <Alert variant='info'>
      <AlertIcon>
        <IconSpeakerphone />
      </AlertIcon>
      <div className='min-w-0 flex-1'>
        {announcements.map((announcement) => (
          <div key={announcement.id}>
            <AlertTitle>{announcement.title}</AlertTitle>
            <AlertDescription>{announcement.subtitle}</AlertDescription>
          </div>
        ))}
      </div>
      <AlertAction>
        <Button type='button' variant='outline' size='xs'>
          {m.dashboard_view_announcements()}
        </Button>
      </AlertAction>
    </Alert>
  )
}
