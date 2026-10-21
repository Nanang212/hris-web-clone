import { IconCircleCheck, IconX } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { ApprovalActionDialog } from '@/shared/components/approval/approval-action-dialog'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import { Textarea } from '@/shared/components/ui/textarea'
import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import { getLeaveTypeLabel } from '@/features/leave/components/leave-utils'
import { m } from '@/i18n/paraglide/messages'

import { LeaveDocumentPreview } from '@/shared/components/documents/leave-document-preview'

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
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/leave', label: m.app_layout_nav_leave() },
        { to: '/leave/approval', label: m.leave_tab_approval() },
        { label: m.leave_approval_detail_title() },
      ]}
      backTo='/leave/approval'
      className='gap-5 bg-muted/30'
    >
      <LeaveTabs active='overview' />
      <div className='grid gap-6 xl:grid-cols-[minmax(0,1.9fr)_340px]'>
        <div className='space-y-6'>
          {/* Live Official Leave Document Sheet Preview */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between px-1'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
                <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
                Dokumen Resmi Pengajuan Cuti / Izin Sakit
              </h3>
            </div>
            <LeaveDocumentPreview
              documentNumber={`CUTI/BFP/2026/VIII/${request.id.replace(/\D/g, '').slice(-3) || '042'}`}
              employeeName={request.employee}
              nip='20261600475'
              position={request.employeeRole}
              department='Operations & Logistics'
              location='AFT Tambolaka'
              leaveType={request.leaveType}
              startDate={request.startDate}
              endDate={request.endDate}
              durationDays={request.duration}
              reason={request.reason}
              status={request.status}
              approverName='Oktavianus Taufan Juwa'
              approverTitle='HO AFT Tambolaka'
              divHeadName='Joko Priyambodo'
              divHeadTitle='Direktur Pemasaran & Operasi'
            />
          </div>

          <section className='rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4'>
            <Field>
              <FieldLabel htmlFor='approval-note'>{m.leave_approval_note_label()}</FieldLabel>
              <Textarea
                id='approval-note'
                className='mt-2'
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={m.leave_approval_note_placeholder()}
              />
            </Field>
            <div className='flex justify-end gap-3'>
              <Button variant='destructive' onClick={() => handleOpenConfirm('reject')}>
                <IconX size={15} />
                {m.leave_reject()}
              </Button>
              <Button onClick={() => handleOpenConfirm('approve')}>
                <IconCircleCheck size={15} />
                {m.leave_approve_request()}
              </Button>
            </div>
          </section>
        </div>
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
