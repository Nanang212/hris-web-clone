import {
  IconCalendar,
  IconCheck,
  IconDownload,
  IconEye,
  IconFileText,
  IconLoader2,
  IconPrinter,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'
import { ApprovalActionDialog } from '@/shared/components/approval/approval-action-dialog'
import { moduleColors, moduleLabels } from '@/features/settings/approval-workflow/data'
import { useApprovalSyncStore } from '@/shared/lib/approval-sync-store'
import { SpklDocumentPreview } from '@/shared/components/documents/spkl-document-preview'
import { LeaveDocumentPreview } from '@/shared/components/documents/leave-document-preview'
import type { ApprovalRequest } from '../types'

export interface ApprovalDetailDrawerProps {
  request: ApprovalRequest
  onClose: () => void
  onAction: (id: string, action: 'approve' | 'reject', note: string) => Promise<void>
}

export function ApprovalDetailDrawer({ request, onClose, onAction }: ApprovalDetailDrawerProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: 'approve' | 'reject'
  }>({
    open: false,
    action: 'approve',
  })
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const isPendingApproval = request.status === 'pending'

  const handleAction = (action: 'approve' | 'reject') => {
    setConfirmDialog({
      open: true,
      action,
    })
  }

  const handleExecuteAction = async (actionNote: string) => {
    const act = confirmDialog.action
    setSubmitting(act)
    try {
      await onAction(request.id, act, actionNote)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(null)
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    let content: string
    let filename: string
    if (request.requestType === 'reimbursement' || request.requestType === 'claim') {
      content = `========================================\nINVOICE / RECEIPT MOCKUP\n========================================\n`
      content += `Employee: ${request.employeeName}\n`
      content += `Department: ${request.department}\n`
      content += `Date: ${request.requestDate}\n`
      content += `Details: ${request.details}\n`
      content += `Reason: ${request.reason || '-'}\n\n`
      content += `Items:\n`
      content += `1. Business Expense Item    Rp ${request.amount ? request.amount.toLocaleString('id-ID') : '0'}\n`
      content += `----------------------------------------\n`
      content += `Total:                      Rp ${request.amount ? request.amount.toLocaleString('id-ID') : '0'}\n`
      content += `========================================\n`
      filename = 'receipt_claim_document.txt'
    } else {
      content = `========================================\nSUPPORTING DOCUMENT (MOCKUP)\n========================================\n`
      content += `Employee: ${request.employeeName}\n`
      content += `Department: ${request.department}\n`
      content += `Request ID: ${request.id}\n`
      content += `Details: ${request.details}\n`
      content += `Reason: ${request.reason || '-'}\n`
      content += `========================================\n`
      filename = 'supporting_document.txt'
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const moduleCls = moduleColors[request.requestType] ?? 'bg-muted text-muted-foreground'

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300'
        onClick={onClose}
      />

      <div className='relative flex h-full w-full max-w-lg flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out'>
        <div className='flex items-center justify-between border-b border-border/60 p-5'>
          <div>
            <h3 className='text-sm font-semibold'>{m.approval_drawer_title()}</h3>
            <p className='text-xs text-muted-foreground'>ID: {request.id}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground'
          >
            <IconX size={16} />
          </button>
        </div>

        <div className='flex-1 space-y-6 overflow-y-auto p-5'>
          <div className='flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4'>
            <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary'>
              {request.employeeName.charAt(0)}
            </div>
            <div>
              <p className='text-sm font-bold text-foreground'>{request.employeeName}</p>
              <p className='text-xs text-muted-foreground'>
                {request.department} · {request.position}
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-start justify-between'>
              <h4 className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                {m.approval_drawer_request_info()}
              </h4>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium uppercase', moduleCls)}>
                {moduleLabels[request.requestType] || request.requestType}
              </span>
            </div>
            <div className='rounded-2xl border border-border/50 bg-background/50 p-4 space-y-3'>
              <div className='text-sm font-semibold text-foreground leading-snug'>
                {request.details}
              </div>

              <div className='grid grid-cols-2 gap-2.5 pt-2 border-t border-border/40 text-xs'>
                <div className='text-muted-foreground flex items-center gap-1.5'>
                  <IconCalendar size={13} />
                  {m.approval_drawer_request_date()}:
                </div>
                <div className='text-right font-medium text-foreground'>
                  {request.requestDate}
                </div>

                {request.requestType === 'business_trip' && (
                  <>
                    {request.destination && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_destination()}:</div>
                        <div className='text-right font-semibold text-foreground'>{request.destination}</div>
                      </>
                    )}
                    {request.travelDates && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_travel_dates()}:</div>
                        <div className='text-right font-medium text-foreground'>{request.travelDates}</div>
                      </>
                    )}
                    {request.transportType && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_transportation()}:</div>
                        <div className='text-right font-medium text-foreground'>{request.transportType}</div>
                      </>
                    )}
                    {request.amount && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_estimated_cost()}:</div>
                        <div className='text-right font-bold text-foreground'>
                          Rp {request.amount.toLocaleString('id-ID')}
                        </div>
                      </>
                    )}
                    {request.advanceMoney && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_advance_money()}:</div>
                        <div className='text-right font-bold text-purple-600 dark:text-purple-400'>
                          Rp {request.advanceMoney.toLocaleString('id-ID')}
                        </div>
                      </>
                    )}
                  </>
                )}

                {(request.requestType === 'claim' || request.requestType === 'reimbursement') && (
                  <>
                    {request.categoryLabel && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_claim_category()}:</div>
                        <div className='text-right font-medium text-foreground'>{request.categoryLabel}</div>
                      </>
                    )}
                    {request.amount && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_claim_amount()}:</div>
                        <div className='text-right font-bold text-emerald-600 dark:text-emerald-400'>
                          Rp {request.amount.toLocaleString('id-ID')}
                        </div>
                      </>
                    )}
                    {request.costCenter && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_cost_center()}:</div>
                        <div className='text-right font-medium text-foreground'>{request.costCenter}</div>
                      </>
                    )}
                    {request.bankAccount && (
                      <>
                        <div className='text-muted-foreground'>{m.approval_drawer_disbursement_account()}:</div>
                        <div className='text-right font-medium text-foreground'>{request.bankAccount}</div>
                      </>
                    )}
                  </>
                )}

                {request.reason && (
                  <>
                    <div className='text-muted-foreground'>{m.approval_drawer_reason()}:</div>
                    <div className='text-right font-medium text-foreground'>{request.reason}</div>
                  </>
                )}
              </div>
            </div>

            {/* Banner Preview Dokumen Resmi SPKL / Formulir Cuti */}
            {(request.requestType === 'overtime' || request.requestType === 'leave') && (
              <div className='rounded-2xl border border-primary/25 bg-primary/5 p-3.5 space-y-2.5'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                      <IconFileText size={16} />
                    </div>
                    <div>
                      <h4 className='text-xs font-bold text-foreground'>
                        {request.requestType === 'overtime'
                          ? 'Dokumen SPKL Resmi'
                          : 'Dokumen Formulir Cuti Resmi'}
                      </h4>
                      <p className='text-[10px] text-muted-foreground'>
                        Format fisik PT. Bintang Fajar Persada
                      </p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => setShowPreview(true)}
                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all cursor-pointer'
                  >
                    <IconEye size={13} />
                    <span>Lihat Dokumen</span>
                  </button>
                </div>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  Tinjau lembar formulir fisik resmi sebelum memberikan persetujuan atau penolakan.
                </p>
              </div>
            )}

            {request.attachmentUrl && (
              <div className='space-y-2'>
                <h4 className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  {m.approval_drawer_attachment()}
                </h4>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setShowPreview(true)}
                    className='flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted'
                  >
                    <IconFileText size={14} className='text-primary' />
                    <span className='truncate'>Document_Attachment.pdf</span>
                  </button>
                  <button
                    type='button'
                    onClick={handleDownload}
                    className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground'
                    title={m.approval_drawer_download_doc()}
                  >
                    <IconDownload size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className='space-y-4'>
            <h4 className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
              {m.approval_drawer_approval_flow()} ({request.workflowName})
            </h4>

            <div className='relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-border/60'>
              {[...request.timeline].reverse().map((step) => {
                const isPassed = step.status === 'approved'
                const isCurrent = step.status === 'pending'
                const isRejected = step.status === 'rejected'

                return (
                  <div key={step.level} className='relative space-y-1'>
                    <div
                      className={cn(
                        'absolute top-1.5 -left-[22px] flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 bg-card text-[9px] font-bold transition-all',
                        isPassed
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isRejected
                            ? 'border-red-500 bg-red-500 text-white'
                            : isCurrent
                              ? 'animate-pulse border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground text-muted-foreground',
                      )}
                    >
                      {isPassed ? (
                        <IconCheck size={9} stroke={4} />
                      ) : isRejected ? (
                        <IconX size={9} stroke={4} />
                      ) : (
                        step.level
                      )}
                    </div>

                    <div className='flex items-center justify-between gap-2 pl-2'>
                      <p className='text-xs font-semibold text-foreground'>{step.name}</p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase',
                          isPassed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : isRejected
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                              : isCurrent
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {isPassed
                          ? m.approval_status_badge_approved()
                          : isRejected
                            ? m.approval_status_badge_rejected()
                            : isCurrent
                              ? m.approval_status_badge_pending()
                              : m.approval_status_badge_waiting()}
                      </span>
                    </div>

                    <p className='pl-2 text-xs text-muted-foreground'>
                      {m.approval_drawer_approver()}: <span className='font-medium text-foreground'>{step.approverName}</span>
                    </p>

                    {step.approvedAt && (
                      <p className='pl-2 text-[10px] text-muted-foreground'>{step.approvedAt}</p>
                    )}

                    {step.note && (
                      <div className='mt-1.5 ml-2 rounded-xl border border-border/50 bg-background/50 p-2.5 text-xs text-foreground'>
                        <span className='font-medium text-muted-foreground'>{m.approval_drawer_note_label()}: </span>
                        {step.note}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {isPendingApproval && (
          <div className='border-t border-border/50 bg-background p-4'>
            <div className='flex gap-2.5'>
              <button
                type='button'
                onClick={() => handleAction('approve')}
                disabled={submitting !== null}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white transition-all shadow-sm',
                  submitting === 'approve'
                    ? 'cursor-not-allowed bg-emerald-600/70'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]',
                )}
              >
                {submitting === 'approve' ? (
                  <>
                    <IconLoader2 size={13} className='animate-spin' />
                    {m.approval_drawer_processing()}
                  </>
                ) : (
                  <>
                    <IconCheck size={14} stroke={2.5} />
                    {m.approval_action_approve()}
                  </>
                )}
              </button>
              <button
                type='button'
                onClick={() => handleAction('reject')}
                disabled={submitting !== null}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400',
                  submitting === 'reject'
                    ? 'cursor-not-allowed bg-red-100/50 dark:bg-red-950/10'
                    : 'active:scale-[0.98]',
                )}
              >
                {submitting === 'reject' ? (
                  <>
                    <IconLoader2 size={13} className='animate-spin' />
                    {m.approval_drawer_processing()}
                  </>
                ) : (
                  <>
                    <IconX size={14} stroke={2.5} />
                    {m.approval_action_reject()}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ApprovalActionDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        action={confirmDialog.action}
        itemName={`${request.employeeName} - ${request.department}`}
        itemDetail={request.details}
        onConfirm={handleExecuteAction}
      />

      {showPreview && (
        <DocumentPreviewModal
          request={request}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}

interface DocumentPreviewModalProps {
  request: ApprovalRequest
  onClose: () => void
  onDownload: (e: React.MouseEvent) => void
}

function DocumentPreviewModal({ request, onClose, onDownload }: DocumentPreviewModalProps) {
  const isEn = getLocale() === 'en'
  const isOvertime = request.requestType === 'overtime'
  const isLeave = request.requestType === 'leave'
  const isTrip = request.requestType === 'business_trip'
  const isClaim = request.requestType === 'claim' || request.requestType === 'reimbursement'

  const docTitle = isOvertime
    ? `Surat_Perintah_Kerja_Lembur_${request.employeeName.replace(/\s+/g, '_')}.pdf`
    : isLeave
      ? `Formulir_Cuti_${request.employeeName.replace(/\s+/g, '_')}.pdf`
      : isTrip
        ? 'Surat_Perintah_Perjalanan_Dinas_SPPD.pdf'
        : isClaim
          ? 'Kwitansi_Resmi_Reimbursement.pdf'
          : 'Dokumen_Lampiran.pdf'

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

      <div
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl transition-all',
          isOvertime || isLeave ? 'max-w-3xl' : 'max-w-lg',
        )}
      >
        <div className='flex items-center justify-between border-b border-border bg-muted/30 p-4'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>
              {isOvertime
                ? 'Preview Surat Perintah Kerja Lembur (SPKL)'
                : isLeave
                  ? 'Preview Formulir Cuti / Izin Sakit'
                  : isEn
                    ? 'Supporting Document Preview'
                    : 'Preview Dokumen Lampiran'}
            </h4>
            <p className='text-xs text-muted-foreground'>{docTitle}</p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={handlePrint}
              className='flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted'
              title='Cetak Dokumen'
            >
              <IconPrinter size={13} />
              <span>Cetak</span>
            </button>
            <button
              onClick={onDownload}
              className='flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted'
              title={isEn ? 'Download Document' : 'Unduh Dokumen'}
            >
              <IconDownload size={13} />
              <span>{isEn ? 'Download' : 'Unduh'}</span>
            </button>
            <button
              onClick={onClose}
              className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:text-foreground'
            >
              <IconX size={15} />
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6'>
          {isOvertime ? (
            <SpklDocumentPreview
              orderNumber={`SPKL/BFP/2026/VIII/${request.id.replace(/\D/g, '').slice(-3) || '042'}`}
              employeeName={request.employeeName}
              nip='20261600475'
              position={request.position}
              department={request.department}
              location='AFT Tambolaka'
              periodLabel='Agustus 2026'
              isHoliday={true}
              date={request.requestDate}
              eventDescription={request.details || 'Penugasan Lembur Operasional'}
              taskDescription={request.reason || 'PATROLI & PENGAMANAN AREA KERJA'}
              startTime='07:00'
              endTime='19:00'
              actualStartTime='07:00'
              actualEndTime='19:00'
              totalHours={request.days || 4}
              status={request.status}
              approverName={request.timeline[0]?.approverName || 'Oktavianus Taufan Juwa'}
              approverTitle='HO AFT Tambolaka'
            />
          ) : isLeave ? (
            <LeaveDocumentPreview
              documentNumber={`CUTI/BFP/2026/VIII/${request.id.replace(/\D/g, '').slice(-3) || '012'}`}
              employeeName={request.employeeName}
              nip='20261600475'
              position={request.position}
              department={request.department}
              location='AFT Tambolaka'
              leaveType={request.details.toLowerCase().includes('sakit') ? 'sick' : 'annual'}
              startDate={request.requestDate}
              endDate={dayjs(request.requestDate).add((request.days || 2) - 1, 'day').format('YYYY-MM-DD')}
              durationDays={request.days || 2}
              reason={request.reason || request.details}
              status={request.status}
              approverName={request.timeline[0]?.approverName || 'Oktavianus Taufan Juwa'}
              approverTitle='Head Departemen'
              divHeadName={request.timeline[1]?.approverName || 'Joko Priyambodo'}
              divHeadTitle='Direktur Pemasaran & Operasi'
            />
          ) : isTrip ? (
            <div className='flex aspect-[1/1.4] w-full max-w-sm mx-auto flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 font-mono text-[10px] leading-relaxed text-black shadow-lg select-text'>
              <div>
                <div className='mb-3 border-b border-gray-300 pb-2 text-center font-sans'>
                  <p className='text-xs font-bold tracking-wide text-indigo-900 uppercase'>
                    PT. BINTANG FAJAR PERSADA
                  </p>
                  <p className='text-[7px] text-gray-500'>
                    Headquarter BFP · Manpower Supply & Facility Support Services
                  </p>
                </div>
                <div className='mb-3 text-center text-[9px] font-bold uppercase underline font-sans'>
                  SURAT PERINTAH PERJALANAN DINAS (SPPD)
                </div>
                <div className='space-y-2 font-sans text-[8px] leading-relaxed text-gray-800'>
                  <div className='flex justify-between border-b border-dashed border-gray-200 pb-1'>
                    <span className='font-semibold text-gray-600'>No. SPPD:</span>
                    <span className='font-bold text-black'>SPPD/2026/04/{request.id}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-semibold text-gray-600'>Nama Pegawai:</span>
                    <span className='font-bold text-black'>{request.employeeName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-semibold text-gray-600'>Jabatan / Dept:</span>
                    <span>{request.position} ({request.department})</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-semibold text-gray-600'>Kota Tujuan:</span>
                    <span className='font-bold text-indigo-800'>{request.destination || 'Surabaya'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-semibold text-gray-600'>Periode Dinas:</span>
                    <span className='font-bold text-black'>{request.travelDates || '3 Hari'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-semibold text-gray-600'>Moda Transportasi:</span>
                    <span>{request.transportType || 'Pesawat'}</span>
                  </div>
                  <div className='flex justify-between border-t border-dashed border-gray-200 pt-1'>
                    <span className='font-semibold text-gray-600'>Estimasi Biaya:</span>
                    <span className='font-bold text-black'>Rp {(request.amount || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className='flex justify-between font-bold text-indigo-900'>
                    <span>Uang Muka (Advance):</span>
                    <span>Rp {(request.advanceMoney || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
              <div className='mt-4 border-t border-dashed border-gray-300 pt-3 text-center text-[8px] text-gray-500 font-sans'>
                <p className='font-bold text-black'>Telah Diverifikasi oleh Travel & GA Desk</p>
                <p className='mt-0.5'>Dokumen sah diterbitkan secara elektronik oleh Sistem HRIS</p>
              </div>
            </div>
          ) : isClaim ? (
            <div className='flex aspect-[1/1.4] w-full max-w-sm mx-auto flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 font-mono text-[10px] leading-relaxed text-black shadow-lg select-text'>
              <div>
                <div className='mb-4 border-b border-dashed border-gray-400 pb-3 text-center'>
                  <p className='text-xs font-bold tracking-wide uppercase'>
                    RECEIPT / STRUK TRANSAKSI
                  </p>
                  <p className='mt-0.5 text-[8px] text-gray-500'>
                    Merchant: {request.categoryLabel || 'Operational & Business Claim'}
                  </p>
                </div>
                <div className='mb-4 space-y-1 text-[9px]'>
                  <div className='flex justify-between'>
                    <span>TANGGAL:</span>
                    <span>{request.requestDate}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>KLAIM OLEH:</span>
                    <span className='font-bold'>{request.employeeName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>REK. PENCAIRAN:</span>
                    <span>{request.bankAccount || 'BCA Transfer'}</span>
                  </div>
                </div>
                <div className='mb-2 border-b border-dashed border-gray-400 pb-2 font-bold'>
                  <div className='flex justify-between'>
                    <span>DESKRIPSI ITEM</span>
                    <span>NOMINAL</span>
                  </div>
                </div>
                <div className='mb-3 space-y-1.5 border-b border-dashed border-gray-400 pb-3'>
                  <div className='flex justify-between'>
                    <span>1x {request.details}</span>
                    <span>Rp {(request.amount || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className='flex justify-between text-[11px] font-bold text-emerald-800'>
                  <span>TOTAL KLAIM:</span>
                  <span>Rp {(request.amount || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className='mt-4 border-t border-dashed border-gray-400 pt-3 text-center text-[8px] text-gray-500'>
                <p>OCR Scan Validated ✓ 99.8% Match</p>
                <p className='mt-0.5'>Siap untuk diproses oleh Tim Keuangan</p>
              </div>
            </div>
          ) : (
            <div className='flex aspect-[1/1.4] w-full max-w-sm mx-auto flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 font-mono text-[10px] leading-relaxed text-black shadow-lg select-text'>
              <div>
                <div className='mb-4 border-b border-gray-300 pb-3 text-center'>
                  <p className='text-xs font-bold tracking-wide text-blue-800 uppercase font-sans'>
                    PT. BINTANG FAJAR PERSADA
                  </p>
                  <p className='mt-0.5 font-sans text-[7px] text-gray-500'>
                    Dokumen Pendukung Lampiran Persetujuan
                  </p>
                </div>
                <div className='mb-4 text-center text-[9px] font-bold uppercase underline font-sans'>
                  Dokumen Permohonan
                </div>
                <div className='space-y-3 font-sans text-[8px] leading-relaxed text-gray-800'>
                  <div className='space-y-1 pl-3 font-bold text-black'>
                    <div className='flex'>
                      <span className='w-20'>Nama Pemohon</span>
                      <span>: {request.employeeName}</span>
                    </div>
                    <div className='flex'>
                      <span className='w-20'>Pekerjaan</span>
                      <span>: {request.position}</span>
                    </div>
                    <div className='flex'>
                      <span className='w-20'>Departemen</span>
                      <span>: {request.department}</span>
                    </div>
                  </div>
                  <p>{request.details}</p>
                  <p className='font-bold'>{request.reason || '-'}</p>
                </div>
              </div>
              <div className='mt-8 flex items-end justify-between font-sans text-[8px] text-gray-600'>
                <div>
                  <p>Status: {request.status.toUpperCase()}</p>
                </div>
                <div className='w-28 text-center'>
                  <p>{dayjs().format('DD MMMM YYYY')}</p>
                  <p className='mt-8 font-bold text-black underline'>{request.employeeName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
