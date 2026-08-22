// mutation-detail-view.tsx — Before & After detail view + Actions menu (same pattern as contract-detail-view)
import { IconArrowRight, IconFileCheck, IconCircleCheck } from '@tabler/icons-react'
import type { EmployeeMutation, MutationStatus } from '@/features/employment/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'

const STATUS_CONFIG: Record<MutationStatus, { label: string; variant: 'amber' | 'green' | 'red' | 'blue' }> = {
  pending:   { label: 'Pending',   variant: 'amber' },
  approved:  { label: 'Approved',  variant: 'green' },
  rejected:  { label: 'Rejected',  variant: 'red' },
  scheduled: { label: 'Scheduled', variant: 'blue' },
}

interface MutationDetailViewProps {
  mutation: EmployeeMutation
  onBack: () => void
  onAction: (action: 'review' | 'approve') => void
}

interface AssignmentRowProps {
  label: string
  current: string
  proposed: string
}

function AssignmentRow({ label, current, proposed }: AssignmentRowProps) {
  return (
    <div className='grid grid-cols-[120px_1fr_1fr] items-center gap-4 py-2.5 border-b border-border/40 last:border-0'>
      <span className='text-xs text-muted-foreground font-medium'>{label}</span>
      <span className='text-xs font-semibold text-foreground'>{current}</span>
      <span className='text-xs font-semibold text-primary'>{proposed}</span>
    </div>
  )
}

export function MutationDetailView({ mutation, onBack, onAction }: MutationDetailViewProps) {
  const status = STATUS_CONFIG[mutation.status]
  const isPending = mutation.status === 'pending'

  return (
    <>
      {/* Employee Header Info */}
      <div className='flex flex-wrap items-center justify-between gap-4 bg-muted/20 border border-border/60 rounded-2xl p-5 mb-6 text-xs'>
        <div>
          <h4 className='font-bold text-foreground text-sm'>{mutation.fullName}</h4>
          <p className='text-muted-foreground mt-0.5'>
            {mutation.employeeCode} · {mutation.currentPosition}
          </p>
        </div>
        <Badge variant={status.variant} className='text-xs px-3 py-1 font-semibold'>
          {status.label}
        </Badge>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left: Before & After comparison */}
        <div className='lg:col-span-2 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden'>
          <div className='border-b border-border/60 px-6 py-4'>
            <h3 className='text-sm font-bold text-foreground'>Mutation Detail · Before &amp; After</h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Comparison of current and proposed organization assignment.
            </p>
          </div>

          <div className='p-6'>
            {/* Column headers */}
            <div className='grid grid-cols-[120px_1fr_1fr] gap-4 mb-2'>
              <span />
              <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                Current Assignment
              </span>
              <span className='text-[11px] font-bold uppercase tracking-wider text-primary'>
                Proposed Assignment
              </span>
            </div>

            <div className='rounded-xl border border-border/40 bg-muted/20 px-4 py-1'>
              <AssignmentRow label='Division'   current={mutation.currentDivision}   proposed={mutation.newDivision} />
              <AssignmentRow label='Department' current={mutation.currentDepartment} proposed={mutation.newDepartment} />
              <AssignmentRow label='Position'   current={mutation.currentPosition}   proposed={mutation.newPosition} />
              <AssignmentRow label='Supervisor' current={mutation.currentSupervisor} proposed={mutation.newSupervisor} />
              <AssignmentRow label='Location'   current={mutation.currentLocation}   proposed={mutation.newLocation} />
            </div>
          </div>

          <Separator />

          {/* Meta info */}
          <div className='grid grid-cols-3 gap-6 px-6 py-4'>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] text-muted-foreground font-semibold uppercase tracking-wide'>Effective Date</p>
              <p className='text-sm font-semibold text-foreground'>{mutation.effectiveDate}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] text-muted-foreground font-semibold uppercase tracking-wide'>Reason</p>
              <p className='text-sm font-semibold text-foreground'>{mutation.reason}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] text-muted-foreground font-semibold uppercase tracking-wide'>Approval Route</p>
              <p className='text-sm font-semibold text-foreground'>{mutation.approvalRoute}</p>
            </div>
          </div>
        </div>

        {/* Right: Actions card */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <h3 className='text-sm font-bold text-foreground border-b pb-3'>Mutation Actions</h3>
            <div className='flex flex-col gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start text-xs font-semibold'
                onClick={() => onAction('review')}
              >
                <IconFileCheck size={14} className='mr-2 text-blue-600' />
                Review &amp; Confirm
              </Button>
              {isPending && (
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full justify-start text-xs font-semibold'
                  onClick={() => onAction('approve')}
                >
                  <IconCircleCheck size={14} className='mr-2 text-emerald-600' />
                  Approve Mutation
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='mt-8 border-t border-border pt-4 flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onBack}>
          Close
        </Button>
        {isPending && (
          <Button onClick={() => onAction('review')}>
            <IconArrowRight size={16} data-icon='inline-end' />
            Review Mutation
          </Button>
        )}
      </div>
    </>
  )
}
