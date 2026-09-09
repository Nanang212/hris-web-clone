// demotion-detail-view.tsx — Before & After detail view + Actions menu
import { IconArrowRight, IconFileCheck } from '@tabler/icons-react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import type { DemotionStatus, EmployeeDemotion } from '@/features/employment/demotion/types'

const STATUS_CONFIG: Record<
  DemotionStatus,
  { label: string; variant: 'amber' | 'green' | 'red' | 'blue' }
> = {
  pending: { label: 'Pending', variant: 'amber' },
  approved: { label: 'Approved', variant: 'green' },
  rejected: { label: 'Rejected', variant: 'red' },
  scheduled: { label: 'Scheduled', variant: 'blue' },
}

interface DemotionDetailViewProps {
  demotion: EmployeeDemotion
  onBack: () => void
  onAction: (action: 'review' | 'edit') => void
}

interface AssignmentRowProps {
  label: string
  current: string
  proposed: string
}

function AssignmentRow({ label, current, proposed }: AssignmentRowProps) {
  return (
    <div className='grid grid-cols-[120px_1fr_1fr] items-center gap-4 border-b border-border/40 py-2.5 last:border-0'>
      <span className='text-xs font-medium text-muted-foreground'>{label}</span>
      <span className='text-xs font-semibold text-foreground'>{current}</span>
      <span className='text-xs font-semibold text-primary'>{proposed}</span>
    </div>
  )
}

function formatSalary(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function DemotionDetailView({ demotion, onBack, onAction }: DemotionDetailViewProps) {
  const status = STATUS_CONFIG[demotion.status]
  const isPending = demotion.status === 'pending'

  return (
    <>
      {/* Employee Header Info */}
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 p-5 text-xs'>
        <div>
          <h4 className='text-sm font-bold text-foreground'>{demotion.fullName}</h4>
          <p className='mt-0.5 text-muted-foreground'>
            {demotion.employeeCode} · {demotion.currentPosition}
          </p>
        </div>
        <Badge variant={status.variant} className='px-3 py-1 text-xs font-semibold'>
          {status.label}
        </Badge>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left: Before & After comparison */}
        <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:col-span-2'>
          <div className='border-b border-border/60 px-6 py-4'>
            <h3 className='text-sm font-bold text-foreground'>Demotion Proposal</h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Comparison of current and proposed position, grade, and compensation.
            </p>
          </div>

          <div className='p-6'>
            {/* Column headers */}
            <div className='mb-2 grid grid-cols-[120px_1fr_1fr] gap-4'>
              <span />
              <span className='text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
                Current
              </span>
              <span className='text-[11px] font-bold tracking-wider text-primary uppercase'>
                Proposed
              </span>
            </div>

            <div className='rounded-xl border border-border/40 bg-muted/20 px-4 py-1'>
              <AssignmentRow
                label='Position'
                current={demotion.currentPosition}
                proposed={demotion.newPosition}
              />
              <AssignmentRow
                label='Grade'
                current={demotion.currentGrade}
                proposed={demotion.newGrade}
              />
              <AssignmentRow
                label='Salary'
                current={formatSalary(demotion.currentSalary)}
                proposed={formatSalary(demotion.newSalary)}
              />
            </div>

            {/* Check success notice from the mockup design */}
            <div className='mt-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20'>
              <div className='text-emerald-600 dark:text-emerald-400'>✔</div>
              <p className='text-xs font-semibold text-emerald-800 dark:text-emerald-300'>
                Demotion is within grade range and approved headcount budget.
              </p>
            </div>
          </div>

          <Separator />

          {/* Meta info */}
          <div className='grid grid-cols-3 gap-6 px-6 py-4'>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
                Effective Date
              </p>
              <p className='text-sm font-semibold text-foreground'>{demotion.effectiveDate}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
                Reason
              </p>
              <p className='text-sm font-semibold text-foreground'>{demotion.reason}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
                Approval Route
              </p>
              <p className='text-sm font-semibold text-foreground'>{demotion.approvalRoute}</p>
            </div>
          </div>
        </div>

        {/* Right: Actions card */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <h3 className='border-b pb-3 text-sm font-bold text-foreground'>Demotion Actions</h3>
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
                  onClick={() => onAction('edit')}
                >
                  <IconFileCheck size={14} className='mr-2 text-indigo-600' />
                  Demotion Proposal
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='mt-8 flex items-center justify-end gap-3 border-t border-border pt-4'>
        <Button variant='outline' onClick={onBack}>
          Close
        </Button>
        {isPending && (
          <Button onClick={() => onAction('review')}>
            <IconArrowRight size={16} data-icon='inline-end' />
            Review Demotion
          </Button>
        )}
      </div>
    </>
  )
}
