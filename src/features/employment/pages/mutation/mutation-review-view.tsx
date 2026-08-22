// mutation-review-view.tsx — Review & Confirm page before submitting mutation
import { IconLoader2 } from '@tabler/icons-react'
import type { Employee } from '@/features/employment/types'
import type { MutationFormData } from './mutation-create-view'
import { Button } from '@/shared/components/ui/button'

interface MutationReviewViewProps {
  formData: MutationFormData
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
    <div className='flex flex-col gap-0.5 py-3.5 border-b border-border/40 last:border-0 sm:flex-row sm:items-center'>
      <span className='w-48 flex-shrink-0 text-xs font-semibold text-primary'>{label}</span>
      <span className='text-sm text-foreground'>{value}</span>
    </div>
  )
}

export function MutationReviewView({
  formData,
  employees,
  onBack,
  onSubmit,
  isPending = false,
}: MutationReviewViewProps) {
  const employee = employees.find((e) => e.id === formData.employeeId)

  const currentOrg = [
    employee?.divisionName,
    employee?.departmentName,
    employee?.positionName,
  ]
    .filter(Boolean)
    .join(' / ')

  const newOrg = [formData.newDivision, formData.newDepartment, formData.newPosition]
    .filter(Boolean)
    .join(' / ')

  return (
    <div className='flex flex-col gap-6'>
      <div className='rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden'>
        <div className='border-b border-border/60 px-6 py-4'>
          <h3 className='text-sm font-bold text-foreground'>Review &amp; Confirm</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Verify all details before submitting the mutation request.
          </p>
        </div>

        <div className='px-6 py-2'>
          <ReviewRow
            label='Employee'
            value={`${employee?.fullName ?? '-'} · ${employee?.employeeCode ?? '-'}`}
          />
          <ReviewRow label='Current Organization' value={currentOrg || '-'} />
          <ReviewRow label='New Organization' value={newOrg || '-'} />
          <ReviewRow label='New Location' value={formData.newLocation} />
          <ReviewRow label='New Supervisor' value={formData.newSupervisor} />
          <ReviewRow label='Effective Date' value={formData.effectiveDate} />
          <ReviewRow label='Reason' value={formData.reason} />
          <ReviewRow label='Approval Route' value={formData.approvalRoute} />
        </div>

        {/* Warning notice */}
        <div className='mx-6 mb-6 mt-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/20'>
          <p className='text-xs text-amber-800 dark:text-amber-300'>
            Submitting starts the configured approval route. Assignment updates on the effective date after approval.
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
          Submit Mutation
        </Button>
      </div>
    </div>
  )
}
