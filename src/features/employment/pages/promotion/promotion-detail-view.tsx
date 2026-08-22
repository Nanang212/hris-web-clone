// promotion-detail-view.tsx — Before & After detail view + Actions menu
import { IconArrowRight, IconFileCheck } from '@tabler/icons-react'
import type { EmployeePromotion, PromotionStatus } from '@/features/employment/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'

const STATUS_CONFIG: Record<PromotionStatus, { label: string; variant: 'amber' | 'green' | 'red' | 'blue' }> = {
  pending:   { label: 'Pending',   variant: 'amber' },
  approved:  { label: 'Approved',  variant: 'green' },
  rejected:  { label: 'Rejected',  variant: 'red' },
  scheduled: { label: 'Scheduled', variant: 'blue' },
}

interface PromotionDetailViewProps {
  promotion: EmployeePromotion
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
    <div className='grid grid-cols-[120px_1fr_1fr] items-center gap-4 py-2.5 border-b border-border/40 last:border-0'>
      <span className='text-xs text-muted-foreground font-medium'>{label}</span>
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

export function PromotionDetailView({ promotion, onBack, onAction }: PromotionDetailViewProps) {
  const status = STATUS_CONFIG[promotion.status]
  const isPending = promotion.status === 'pending'

  return (
    <>
      {/* Employee Header Info */}
      <div className='flex flex-wrap items-center justify-between gap-4 bg-muted/20 border border-border/60 rounded-2xl p-5 mb-6 text-xs'>
        <div>
          <h4 className='font-bold text-foreground text-sm'>{promotion.fullName}</h4>
          <p className='text-muted-foreground mt-0.5'>
            {promotion.employeeCode} · {promotion.currentPosition}
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
            <h3 className='text-sm font-bold text-foreground'>Promotion Proposal</h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Comparison of current and proposed position, grade, and compensation.
            </p>
          </div>

          <div className='p-6'>
            {/* Column headers */}
            <div className='grid grid-cols-[120px_1fr_1fr] gap-4 mb-2'>
              <span />
              <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                Current
              </span>
              <span className='text-[11px] font-bold uppercase tracking-wider text-primary'>
                Proposed
              </span>
            </div>

            <div className='rounded-xl border border-border/40 bg-muted/20 px-4 py-1'>
              <AssignmentRow label='Position' current={promotion.currentPosition} proposed={promotion.newPosition} />
              <AssignmentRow label='Grade'    current={promotion.currentGrade}    proposed={promotion.newGrade} />
              <AssignmentRow label='Salary'   current={formatSalary(promotion.currentSalary)} proposed={formatSalary(promotion.newSalary)} />
            </div>

            {/* Check success notice from the mockup design */}
            <div className='mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20 flex items-center gap-3'>
              <div className='text-emerald-600 dark:text-emerald-400'>✔</div>
              <p className='text-xs text-emerald-800 dark:text-emerald-300 font-semibold'>
                Promotion is within grade range and approved headcount budget.
              </p>
            </div>
          </div>

          <Separator />

          {/* Meta info */}
          <div className='grid grid-cols-3 gap-6 px-6 py-4'>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] text-muted-foreground font-semibold uppercase tracking-wide'>Effective Date</p>
              <p className='text-sm font-semibold text-foreground'>{promotion.effectiveDate}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] text-muted-foreground font-semibold uppercase tracking-wide'>Reason</p>
              <p className='text-sm font-semibold text-foreground'>{promotion.reason}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-[11px] text-muted-foreground font-semibold uppercase tracking-wide'>Approval Route</p>
              <p className='text-sm font-semibold text-foreground'>{promotion.approvalRoute}</p>
            </div>
          </div>
        </div>

        {/* Right: Actions card */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <h3 className='text-sm font-bold text-foreground border-b pb-3'>Promotion Actions</h3>
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
                  Promotion Proposal
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
            Review Promotion
          </Button>
        )}
      </div>
    </>
  )
}
