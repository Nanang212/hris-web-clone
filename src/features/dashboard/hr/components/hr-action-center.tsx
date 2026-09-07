import { IconAlertCircle, IconArrowRight } from '@tabler/icons-react'

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { m } from '@/i18n/paraglide/messages'

interface ActionItem {
  id: string
  label: string
  sublabel: string
  count: number
  variant: 'info' | 'warning' | 'danger' | 'success'
}

const actionItems: ActionItem[] = [
  {
    id: 'leave-approvals',
    label: 'Leave approvals',
    sublabel: '12 waiting · 4 overdue',
    count: 12,
    variant: 'info',
  },
  {
    id: 'claim-reviews',
    label: 'Claim reviews',
    sublabel: '8 submissions',
    count: 8,
    variant: 'warning',
  },
  {
    id: 'contract-expiry',
    label: 'Contract expiry',
    sublabel: '5 within 30 days',
    count: 5,
    variant: 'danger',
  },
  {
    id: 'employee-changes',
    label: 'Employee changes',
    sublabel: '6 profile updates',
    count: 6,
    variant: 'success',
  },
]

const badgeVariants = {
  info: 'blue',
  warning: 'amber',
  danger: 'red',
  success: 'green',
} as const

export function HrActionCenter() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-semibold'>{m.dashboard_hr_action_center()}</h3>
          <p className='text-xs text-muted-foreground'>{m.dashboard_hr_action_center_sub()}</p>
        </div>
        <Button type='button' variant='link' size='xs'>
          {m.dashboard_view_all()}
          <IconArrowRight data-icon='inline-end' />
        </Button>
      </div>

      <div className='flex flex-col divide-y divide-border/50'>
        {actionItems.map((item) => {
          return (
            <div key={item.id} className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'>
              <div className='flex-1'>
                <p className='text-sm font-medium'>{item.label}</p>
                <p className='text-xs text-muted-foreground'>{item.sublabel}</p>
              </div>
              <Badge variant={badgeVariants[item.variant]}>{item.count}</Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface AlertBannerProps {
  title: string
  message: string
  actionLabel: string
}

export function AlertBanner({ title, message, actionLabel }: Readonly<AlertBannerProps>) {
  return (
    <Alert variant='amber-overlay'>
      <AlertIcon>
        <IconAlertCircle />
      </AlertIcon>
      <div className='min-w-0 flex-1'>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
      <AlertAction>
        <Button type='button' variant='outline' size='xs'>
          {actionLabel}
        </Button>
      </AlertAction>
    </Alert>
  )
}
