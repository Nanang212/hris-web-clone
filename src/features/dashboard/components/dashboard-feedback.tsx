import { IconAlertTriangle } from '@tabler/icons-react'

export function DashboardLoading() {
  return (
    <div className='flex min-h-125 flex-col items-center justify-center gap-3 p-8'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      <p className='text-sm text-muted-foreground'>Loading dashboard data...</p>
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
      <div className='rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/40 dark:text-red-400'>
        <IconAlertTriangle size={32} />
      </div>
      <div>
        <h3 className='font-semibold text-foreground'>Failed to load dashboard</h3>
        <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
          {error?.message || 'Something went wrong'}
        </p>
      </div>
      <button
        type='button'
        onClick={reset}
        className='cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
      >
        Try Again
      </button>
    </div>
  )
}
