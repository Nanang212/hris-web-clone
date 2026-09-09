// resignation-review-view.tsx — Review & Confirm before submitting resignation
import { IconLoader2 } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import type { Employee } from '@/features/employment/resignation/types'

import type { ResignationFormData } from './resignation-create-view'

interface ResignationReviewViewProps {
  formData: ResignationFormData
  employees: Employee[]
  onBack: () => void
  onSubmit: () => void
  isPending?: boolean
}

interface ReviewRowProps {
  label: string
  value: string
}

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className='flex flex-col gap-0.5 border-b border-border/40 py-3.5 last:border-0 sm:flex-row sm:items-center'>
      <span className='w-48 flex-shrink-0 text-xs font-semibold text-primary'>{label}</span>
      <span className='text-sm text-foreground'>{value}</span>
    </div>
  )
}

export function ResignationReviewView({
  formData,
  employees,
  onBack,
  onSubmit,
  isPending = false,
}: ResignationReviewViewProps) {
  const employee = employees.find((e) => e.id === formData.employeeId)
  const accessLabel =
    formData.accessRevocation === 'On last working date'
      ? 'Disable on last working date'
      : formData.accessRevocation === 'Immediately'
        ? 'Disable immediately'
        : 'Disable after last working date'

  return (
    <div className='flex flex-col gap-6'>
      <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
        <div className='border-b border-border/60 px-6 py-4'>
          <h3 className='text-sm font-bold text-foreground'>Review &amp; Confirm</h3>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Review final working date and offboarding impact.
          </p>
        </div>

        <div className='px-6 py-2'>
          <ReviewRow
            label='Employee'
            value={`${employee?.fullName ?? '-'} · NIP ${employee?.employeeCode ?? '-'}`}
          />
          <ReviewRow label='Last Working Date' value={formData.lastWorkingDate} />
          <ReviewRow
            label='Reason'
            value={`${formData.resignationType} resignation · ${formData.reason}`}
          />
          <ReviewRow label='Handover Owner' value={formData.handoverOwner} />
          <ReviewRow label='Exit Interview' value={formData.exitInterviewDate || 'Not scheduled'} />
          <ReviewRow label='Account Access' value={accessLabel} />
        </div>

        {/* Warning notice */}
        <div className='mx-6 mt-2 mb-6 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 dark:border-rose-800/40 dark:bg-rose-950/20'>
          <p className='text-xs text-rose-700 dark:text-rose-300'>
            Submitting resignation schedules access revocation and marks the employee inactive after
            the last working date.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className='flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isPending}>
          {isPending && <IconLoader2 size={14} className='animate-spin' data-icon='inline-start' />}
          Submit Resignation
        </Button>
      </div>
    </div>
  )
}
