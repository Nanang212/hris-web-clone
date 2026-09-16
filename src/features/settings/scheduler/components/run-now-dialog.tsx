import {
  IconCheck,
  IconLoader2,
  IconPlayerPlay,
  IconRotateClockwise,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'

import type { ScheduledJob } from '../types'

interface RunNowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: ScheduledJob | null
  onSuccess?: () => void
  onViewLog?: () => void
}

type Step = 'confirm' | 'running' | 'completed'

export function RunNowDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
  onViewLog,
}: Readonly<RunNowDialogProps>) {
  const [step, setStep] = useState<Step>('confirm')
  const [progress, setProgress] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)
  const totalEmployees = 1248

  useEffect(() => {
    if (open) {
      setStep('confirm')
      setProgress(0)
      setProcessedCount(0)
    }
  }, [open])

  // Progress animation when running
  useEffect(() => {
    if (step !== 'running') return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStep('completed')
          onSuccess?.()
          return 100
        }
        const next = prev + 15
        const currentProcessed = Math.min(
          totalEmployees,
          Math.round((next / 100) * totalEmployees),
        )
        setProcessedCount(currentProcessed)
        return next
      })
    }, 450)

    return () => clearInterval(interval)
  }, [step, onSuccess])

  if (!job) return null

  const handleStartRun = () => {
    setStep('running')
    setProgress(10)
    setProcessedCount(120)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleViewLog = () => {
    onOpenChange(false)
    onViewLog?.()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size='md' className='sm:max-w-[480px] p-6'>
        {/* ── STEP 1: CONFIRM ── */}
        {step === 'confirm' && (
          <>
            <AlertDialogHeader className='flex flex-col items-center text-center'>
              <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'>
                <IconPlayerPlay size={24} className='fill-blue-600 dark:fill-blue-400 ml-0.5' />
              </div>
              <AlertDialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                Run scheduler now?
              </AlertDialogTitle>
              <p className='text-xs font-semibold text-foreground mt-0.5'>{job.name}</p>
              <AlertDialogDescription className='mt-1 text-center text-xs leading-relaxed text-muted-foreground'>
                Job akan dijalankan segera di luar jadwal reguler. Jadwal berikutnya tetap{' '}
                <span className='font-semibold text-foreground'>{job.nextRun}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Info Box */}
            <div className='my-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-xs space-y-2.5'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Module</span>
                <span className='font-semibold text-foreground'>{job.module}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Trigger</span>
                <span className='font-semibold text-foreground'>Manual run</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Retry policy</span>
                <span className='font-semibold text-foreground'>
                  {job.retryPolicy ?? '3 attempts'}
                </span>
              </div>
            </div>

            <AlertDialogFooter className='flex gap-2 sm:justify-end'>
              <button
                type='button'
                onClick={handleClose}
                className='rounded-xl border border-border px-5 py-2 text-xs font-semibold transition-colors hover:bg-muted'
              >
                Cancel
              </button>
              <Button
                type='button'
                className='bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
                onClick={handleStartRun}
              >
                Run Now
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {/* ── STEP 2: RUNNING ── */}
        {step === 'running' && (
          <>
            <AlertDialogHeader className='flex flex-col items-center text-center'>
              <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'>
                <IconRotateClockwise size={24} className='animate-spin' stroke={2.5} />
              </div>
              <AlertDialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                Scheduler is running
              </AlertDialogTitle>
              <AlertDialogDescription className='mt-0.5 text-center text-xs text-muted-foreground'>
                {job.name} · started just now
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Progress Section */}
            <div className='my-3 space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='font-medium text-foreground'>
                  {processedCount.toLocaleString()} of {totalEmployees.toLocaleString()} employees processed
                </span>
                <span className='font-bold text-amber-600 dark:text-amber-400'>{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className='h-2.5 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full bg-amber-500 transition-all duration-300 ease-out'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current Step Box */}
            <div className='my-2 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs dark:border-amber-900/50 dark:bg-amber-950/30'>
              <p className='text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide'>
                Current step
              </p>
              <p className='mt-1 font-bold text-foreground'>Calculate attendance status</p>
              <p className='mt-0.5 text-[11px] text-muted-foreground'>
                Elapsed 00:01:08 · no errors detected
              </p>
            </div>

            <AlertDialogFooter className='flex gap-2 sm:justify-end'>
              <button
                type='button'
                onClick={handleClose}
                className='rounded-xl border border-border px-5 py-2 text-xs font-semibold transition-colors hover:bg-muted'
              >
                Close
              </button>
              <Button
                type='button'
                className='bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
                onClick={handleClose}
              >
                View Execution
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {/* ── STEP 3: COMPLETED ── */}
        {step === 'completed' && (
          <>
            <AlertDialogHeader className='flex flex-col items-center text-center'>
              <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'>
                <IconCheck size={26} stroke={2.5} />
              </div>
              <AlertDialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                Scheduler completed
              </AlertDialogTitle>
              <AlertDialogDescription className='mt-0.5 text-center text-xs text-muted-foreground'>
                {job.name} finished successfully.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Metrics 4-grid Box */}
            <div className='my-3 grid grid-cols-2 gap-4 rounded-2xl border border-border/70 bg-card p-4 text-xs'>
              <div>
                <p className='text-muted-foreground'>Processed</p>
                <p className='mt-0.5 text-xl font-bold text-foreground'>
                  {totalEmployees.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground'>Warnings</p>
                <p className='mt-0.5 text-xl font-bold text-foreground'>6</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Failed</p>
                <p className='mt-0.5 text-xl font-bold text-emerald-600 dark:text-emerald-400'>0</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Duration</p>
                <p className='mt-0.5 text-xl font-bold text-foreground'>1m 52s</p>
              </div>
            </div>

            {/* Next scheduled run reminder box */}
            <div className='my-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 font-medium text-center'>
              Next scheduled run remains {job.nextRun}
            </div>

            <AlertDialogFooter className='flex gap-2 sm:justify-end'>
              <button
                type='button'
                onClick={handleClose}
                className='rounded-xl border border-border px-5 py-2 text-xs font-semibold transition-colors hover:bg-muted'
              >
                Done
              </button>
              <Button
                type='button'
                className='bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
                onClick={handleViewLog}
              >
                View Log
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
