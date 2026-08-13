// feedback.tsx — Loading dan Error states untuk Approval Workflow
// Mengikuti pola yang sama dengan dashboard/components/dashboard-feedback.tsx
import { IconAlertTriangle } from '@tabler/icons-react'

export function WorkflowLoading() {
  return (
    <div className='flex min-h-[500px] flex-col items-center justify-center gap-3 p-8'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      <p className='text-sm text-muted-foreground'>Memuat data...</p>
    </div>
  )
}

interface WorkflowErrorProps {
  error: Error
  reset: () => void
}

export function WorkflowError({ error, reset }: WorkflowErrorProps) {
  return (
    <div className='flex min-h-[500px] flex-col items-center justify-center gap-4 p-8 text-center'>
      <div className='rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/40 dark:text-red-400'>
        <IconAlertTriangle size={32} />
      </div>
      <div>
        <h3 className='font-semibold text-foreground'>Gagal memuat data</h3>
        <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
          {error?.message || 'Terjadi kesalahan yang tidak terduga'}
        </p>
      </div>
      <button
        type='button'
        onClick={reset}
        className='cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
      >
        Coba Lagi
      </button>
    </div>
  )
}
