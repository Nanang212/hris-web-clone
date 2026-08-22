// mutation-approve-view.tsx — Approval view: Before & After + Approve/Reject actions
import { IconCheck, IconX } from '@tabler/icons-react'
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

interface MutationApproveViewProps {
  mutation: EmployeeMutation
  onBack: () => void
  onApprove: () => void
  onReject: () => void
  isPending?: boolean
}

interface AssignmentCardProps {
  title: string
  highlight?: boolean
  items: { label: string; value: string }[]
}

function AssignmentCard({ title, highlight, items }: AssignmentCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 ${
        highlight
          ? 'border-primary/20 bg-primary/5'
          : 'border-border/60 bg-muted/20'
      }`}
    >
      <p
        className={`text-[11px] font-bold uppercase tracking-wider ${
          highlight ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {title}
      </p>
      <div className='flex flex-col gap-2'>
        {items.map(({ label, value }) => (
          <div key={label} className='flex flex-col gap-0.5'>
            <span className='text-[11px] text-muted-foreground'>{label}</span>
            <span className='text-xs font-semibold text-foreground'>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MutationApproveView({
  mutation,
  onBack,
  onApprove,
  onReject,
  isPending = false,
}: MutationApproveViewProps) {
  const status = STATUS_CONFIG[mutation.status]
  const canApprove = mutation.status === 'pending'

  return (
    <div className='flex flex-col gap-6'>
      {/* Employee header */}
      <div className='flex items-center justify-between rounded-2xl border border-border/60 bg-card px-6 py-4 shadow-sm'>
        <div className='flex flex-col gap-1'>
          <p className='text-xs text-muted-foreground'>Employee</p>
          <p className='text-sm font-bold text-foreground'>
            {mutation.fullName} · {mutation.employeeCode}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Before & After card */}
      <div className='rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden'>
        <div className='border-b border-border/60 px-6 py-4'>
          <h3 className='text-sm font-bold text-foreground'>Mutation Detail · Before &amp; After</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Review the organization movement before approving.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 p-6 sm:grid-cols-2'>
          <AssignmentCard
            title='Current Assignment'
            items={[
              { label: 'Division',    value: mutation.currentDivision },
              { label: 'Department',  value: mutation.currentDepartment },
              { label: 'Position',    value: mutation.currentPosition },
              { label: 'Supervisor',  value: mutation.currentSupervisor },
              { label: 'Location',    value: mutation.currentLocation },
            ]}
          />
          <AssignmentCard
            title='Proposed Assignment'
            highlight
            items={[
              { label: 'Division',    value: mutation.newDivision },
              { label: 'Department',  value: mutation.newDepartment },
              { label: 'Position',    value: mutation.newPosition },
              { label: 'Supervisor',  value: mutation.newSupervisor },
              { label: 'Location',    value: mutation.newLocation },
            ]}
          />
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

      {/* Action footer */}
      <div className='flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={onBack}>
          Back
        </Button>
        {canApprove && (
          <>
            <Button variant='outline' onClick={onReject} disabled={isPending} className='text-destructive border-destructive/40 hover:bg-destructive/10'>
              <IconX size={14} data-icon='inline-start' />
              Reject
            </Button>
            <Button onClick={onApprove} disabled={isPending}>
              <IconCheck size={14} data-icon='inline-start' />
              Approve
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
