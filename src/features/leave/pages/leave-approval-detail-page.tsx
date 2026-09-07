import { IconCircleCheck, IconX } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import { Textarea } from '@/shared/components/ui/textarea'
import { ApprovalActionDialog } from '@/shared/components/approval/approval-action-dialog'
import { snackbar } from '@/shared/lib/snackbar'
import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import { getLeaveTypeLabel } from '@/features/leave/components/leave-utils'
import { m } from '@/i18n/paraglide/messages'
import { cn } from '@/shared/lib/utils'

export function LeaveApprovalDetailPage({ requestId }: Readonly<{ requestId: string }>) {
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: 'approve' | 'reject'
  }>({
    open: false,
    action: 'approve',
  })

  const { leaves, approve: syncApprove, reject: syncReject } = useApprovalSyncStore()
  const request = leaves.find((item) => item.id === requestId) ?? leaves[0]

  const handleOpenConfirm = (action: 'approve' | 'reject') => {
    setConfirmDialog({
      open: true,
      action,
    })
  }

  const handleExecuteAction = (actionNote: string) => {
    const finalNote = actionNote || note
    if (confirmDialog.action === 'approve') {
      syncApprove(request.id, finalNote || 'Disetujui dari menu Leave Approval.')
      snackbar.success(m.leave_approval_toast_success())
    } else {
      syncReject(request.id, finalNote || 'Ditolak dari menu Leave Approval.')
      snackbar.error('Pengajuan cuti ditolak.')
    }
    navigate({ to: '/leave/approval' })
  }

  return (
    <AppMain
      title={m.leave_approval_detail_title()}
      subtitle={m.leave_approval_detail_subtitle()}
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='approval' />
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_320px]'>
        <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-xs text-muted-foreground'>{m.leave_table_employee()}</p>
              <h3 className='mt-1 text-xl font-bold'>{request.employee}</h3>
              <p className='text-xs text-muted-foreground'>{request.employeeRole}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-5 py-1.5 text-xs font-semibold uppercase',
                request.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-600'
                  : request.status === 'rejected'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-orange-50 text-orange-600',
              )}
            >
              {request.status}
            </span>
          </div>
          <dl className='mt-7 grid gap-5 text-sm sm:grid-cols-[180px_1fr]'>
            <dt className='text-muted-foreground'>{m.leave_table_type()}</dt>
            <dd className='font-medium'>{getLeaveTypeLabel(request.leaveType)}</dd>
            <dt className='text-muted-foreground'>{m.leave_table_period()}</dt>
            <dd className='font-medium'>{request.startDate} s.d {request.endDate}</dd>
            <dt className='text-muted-foreground'>{m.leave_table_duration()}</dt>
            <dd className='font-medium'>{m.leave_days({ count: request.duration })}</dd>
            <dt className='text-muted-foreground'>{m.leave_create_reason_label()}</dt>
            <dd className='font-medium'>{request.reason}</dd>
            <dt className='text-muted-foreground'>{m.leave_approval_balance_after()}</dt>
            <dd className='font-medium'>{m.leave_days({ count: '9' })}</dd>
            <dt className='text-muted-foreground'>{m.leave_balance_expiry_date()}</dt>
            <dd className='font-medium text-rose-500'>31 Dec 2026</dd>
          </dl>
          <Field className='mt-7'>
            <FieldLabel htmlFor='approval-note'>{m.leave_approval_note_label()}</FieldLabel>
            <Textarea
              id='approval-note'
              className='mt-2'
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={m.leave_approval_note_placeholder()}
            />
          </Field>
          <div className='mt-4 flex justify-end gap-4'>
            <Button variant='destructive' onClick={() => handleOpenConfirm('reject')}>
              <IconX />
              {m.leave_reject()}
            </Button>
            <Button onClick={() => handleOpenConfirm('approve')}>
              <IconCircleCheck />
              {m.leave_approve_request()}
            </Button>
          </div>
        </section>
        <aside className='h-fit rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='font-semibold'>{m.leave_coverage_check_title()}</h3>
          <div className='mt-5 space-y-4 text-sm'>
            {[
              [m.leave_coverage_date_overlap(), m.leave_coverage_no_conflict(), 'text-emerald-600'],
              [m.leave_coverage_team(), m.leave_coverage_safe_percent(), 'text-emerald-600'],
              [m.leave_coverage_same_role(), m.leave_coverage_one_employee(), 'text-orange-500'],
              [m.leave_coverage_manager(), m.leave_coverage_available(), 'text-emerald-600'],
            ].map(([label, value, tone]) => (
              <div key={label}>
                <p className='text-xs text-muted-foreground'>{label}</p>
                <p className={tone}>{value}</p>
              </div>
            ))}
          </div>
          <div className='mt-6 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-600'>
            {m.leave_coverage_notice()}
          </div>
        </aside>
      </div>

      {/* Confirmation Dialog */}
      <ApprovalActionDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        action={confirmDialog.action}
        itemName={`Cuti ${getLeaveTypeLabel(request.leaveType)} - ${request.employee}`}
        itemDetail={`${request.startDate} s.d ${request.endDate} (${request.duration} hari)`}
        onConfirm={handleExecuteAction}
      />
    </AppMain>
  )
}
