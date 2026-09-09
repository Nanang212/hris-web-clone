// demotion-review-view.tsx — Review & Confirm page before submitting demotion
import { IconLoader2 } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import type { Employee } from '@/features/employment/demotion/types'

import type { DemotionFormData } from './demotion-create-view'

interface DemotionReviewViewProps {
  formData: DemotionFormData
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

export function DemotionReviewView({
  formData,
  employees,
  onBack,
  onSubmit,
  isPending = false,
}: DemotionReviewViewProps) {
  const employee = employees.find((e) => e.id === formData.employeeId)

  const currentDetails = [employee?.positionName, employee?.gradeName || 'G3']
    .filter(Boolean)
    .join(' · ')

  const proposedDetails = [formData.newPosition, formData.newGrade].filter(Boolean).join(' · ')

  return (
    <div className='flex flex-col gap-6'>
      <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
        <div className='border-b border-border/60 px-6 py-4'>
          <h3 className='text-sm font-bold text-foreground'>Review &amp; Confirm</h3>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Confirm new position and grade before submitting.
          </p>
        </div>

        <div className='px-6 py-2'>
          <ReviewRow
            label='Employee'
            value={`${employee?.fullName ?? '-'} · NIP ${employee?.employeeCode ?? '-'}`}
          />
          <ReviewRow label='Current Position' value={currentDetails || '-'} />
          <ReviewRow label='New Position' value={proposedDetails || '-'} />
          <ReviewRow label='Effective Date' value={formData.effectiveDate} />
          <ReviewRow label='Reason' value={formData.reason} />
          <ReviewRow label='Approver' value={formData.approvalRoute} />
        </div>

        {/* Warning notice */}
        <div className='mx-6 mt-2 mb-6 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/20'>
          <p className='text-xs text-amber-800 dark:text-amber-300'>
            Submitting starts the approval route. Position, grade, and salary changes become
            effective after approval.
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
          Submit Demotion
        </Button>
      </div>
    </div>
  )
}
