import { IconAlertTriangle } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { m } from '@/i18n/paraglide/messages'

export function DashboardLoading() {
  return (
    <div className='flex min-h-125 flex-col items-center justify-center gap-3 p-8'>
      <Spinner className='size-8' />
      <p className='text-sm text-muted-foreground'>{m.dashboard_loading()}</p>
    </div>
  )
}

interface DashboardErrorProps {
  error: Error
  reset?: () => void
}

export function DashboardError({ error, reset }: Readonly<DashboardErrorProps>) {
  return (
    <div className='flex min-h-125 flex-col items-center justify-center gap-4 p-8 text-center'>
      <div className='rounded-full bg-destructive/10 p-3 text-destructive'>
        <IconAlertTriangle size={32} />
      </div>
      <div>
        <h3 className='font-semibold text-foreground'>{m.dashboard_error_title()}</h3>
        <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
          {error?.message || m.dashboard_error_description()}
        </p>
      </div>
      <Button type='button' onClick={reset}>
        {m.dashboard_error_retry()}
      </Button>
    </div>
  )
}
