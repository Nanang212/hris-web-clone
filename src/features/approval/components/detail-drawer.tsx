import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconDownload,
  IconFileText,
  IconLoader2,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'

import { moduleColors } from '@/features/settings/approval-workflow/data'
import { cn } from '@/shared/lib/utils'

import type { ApprovalRequest } from '../types'

interface ApprovalDetailDrawerProps {
  request: ApprovalRequest
  onClose: () => void
  onAction: (id: string, action: 'approve' | 'reject', note: string) => Promise<void>
}

export function ApprovalDetailDrawer({ request, onClose, onAction }: ApprovalDetailDrawerProps) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setSubmitting(action)
    try {
      await onAction(request.id, action, note)
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
    if (request.requestType === 'reimbursement') {
      content = `========================================\nINVOICE / RECEIPT MOCKUP\n========================================\n`
      content += `Karyawan: ${request.employeeName}\n`
      content += `Departemen: ${request.department}\n`
      content += `Tanggal: ${request.requestDate}\n`
      content += `Rincian: ${request.details}\n`
      content += `Alasan: ${request.reason || '-'}\n\n`
      content += `Items:\n`
      content += `1. Buku Analisis Finansial  Rp 250,000\n`
      content += `2. Langganan Software       Rp 500,000\n`
      content += `----------------------------------------\n`
      content += `Total:                      Rp 750,000\n`
      content += `========================================\n`
      filename = 'bukti_reimbursement.txt'
    } else {
      content = `========================================\nSURAT KETERANGAN DOKTER (MOCKUP)\n========================================\n`
      content += `Klinik: Medika Sehat\n`
      content += `Dokter: dr. Andi Wijaya, Sp.PD\n\n`
      content += `Menyatakan bahwa:\n`
      content += `Nama Pasien: ${request.employeeName}\n`
      content += `Memerlukan istirahat selama ${request.days || 2} hari\n`
      content += `Terhitung mulai tanggal: 11 Juni 2025 s.d 12 Juni 2025\n`
      content += `Diagnosis: Demam Tinggi\n`
      content += `========================================\n`
      filename = 'surat_keterangan_dokter.txt'
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const moduleCls = moduleColors[request.requestType] ?? 'bg-muted text-muted-foreground'

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300'
        onClick={onClose}
      />

      {/* Drawer */}
      <div className='relative flex h-full w-full max-w-lg flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border/60 p-5'>
          <div>
            <h3 className='text-sm font-semibold'>Detail Pengajuan Persetujuan</h3>
            <p className='text-xs text-muted-foreground'>ID Pengajuan: {request.id}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground'
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 space-y-6 overflow-y-auto p-5'>
          {/* Employee Profile */}
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

          {/* Request details */}
          <div className='space-y-4'>
            <div className='flex items-start justify-between'>
              <h4 className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                Keterangan Pengajuan
              </h4>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', moduleCls)}>
                {moduleLabels[request.requestType]}
              </span>
            </div>

            <div className='grid grid-cols-2 gap-4 space-y-1.5 rounded-2xl border border-border/50 bg-background/50 p-4'>
              <div className='col-span-2 text-sm font-semibold text-foreground'>
                {request.details}
              </div>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <IconCalendar size={13} />
                Diajukan pada:
              </div>
              <div className='text-right text-xs font-medium text-foreground'>
                {request.requestDate}
              </div>

              {request.amount && (
                <>
                  <div className='text-xs text-muted-foreground'>Jumlah Klaim:</div>
                  <div className='text-right text-xs font-bold text-emerald-600 dark:text-emerald-400'>
                    Rp {request.amount.toLocaleString('id-ID')}
                  </div>
                </>
              )}

              {request.days && (
                <>
                  <div className='text-xs text-muted-foreground'>Durasi:</div>
                  <div className='text-right text-xs font-medium text-foreground'>
                    {request.days} {request.requestType === 'overtime' ? 'Jam' : 'Hari'}
                  </div>
                </>
              )}
            </div>

            {request.reason && (
              <div className='space-y-1.5'>
                <p className='text-xs font-semibold text-muted-foreground'>Alasan:</p>
                <div className='rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-foreground'>
                  {request.reason}
                </div>
              </div>
            )}

            {request.attachmentUrl && (
              <div className='space-y-1.5'>
                <p className='text-xs font-semibold text-muted-foreground'>Lampiran / Bukti:</p>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setShowPreview(true)}
                    className='flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted'
                  >
                    <IconFileText size={14} className='text-primary' />
                    <span>attachment_doc.pdf</span>
                  </button>
                  <button
                    type='button'
                    onClick={handleDownload}
                    className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground'
                    title='Download file'
                  >
                    <IconDownload size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Workflow Timeline Progress */}
          <div className='space-y-4'>
            <h4 className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
              Alur Persetujuan & Riwayat
            </h4>

            <div className='relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-border/60'>
              {[...request.timeline].reverse().map((step) => {
                const isPassed = step.status === 'approved'
                const isCurrent = step.status === 'pending'
                const isRejected = step.status === 'rejected'

                return (
                  <div key={step.level} className='relative space-y-1'>
                    {/* Circle icon marker */}
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
                          ? 'Disetujui'
                          : isRejected
                            ? 'Ditolak'
                            : isCurrent
                              ? 'Menunggu Anda'
                              : 'Menunggu'}
                      </span>
                    </div>

                    <p className='pl-2 text-[11px] text-muted-foreground'>{step.approverName}</p>

                    {step.note && (
                      <div className='mt-1 ml-2 rounded-lg border-l-2 border-border/80 bg-muted/40 p-2 text-[11px] text-foreground italic'>
                        "{step.note}"
                      </div>
                    )}
                    {step.approvedAt && (
                      <p className='mt-0.5 flex items-center gap-1 pl-2 text-[9px] text-muted-foreground'>
                        <IconClock size={10} />
                        {step.approvedAt}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Action Form Footer */}
        {request.status === 'pending' && (
          <div className='space-y-4 border-t border-border/60 bg-muted/20 p-5'>
            <div>
              <label className='mb-1.5 block text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                Catatan Persetujuan (Opsional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder='Masukkan alasan atau instruksi jika ada...'
                rows={2}
                className='w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none'
              />
            </div>

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={() => handleAction('approve')}
                disabled={submitting !== null}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-primary-foreground transition-all',
                  submitting === 'approve'
                    ? 'cursor-not-allowed bg-primary/70'
                    : 'bg-primary hover:bg-primary/95 active:scale-[0.98]',
                )}
              >
                {submitting === 'approve' ? (
                  <>
                    <IconLoader2 size={13} className='animate-spin' />
                    Memproses...
                  </>
                ) : (
                  <>
                    <IconCheck size={14} stroke={2.5} />
                    Setujui Pengajuan
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
                    Memproses...
                  </>
                ) : (
                  <>
                    <IconX size={14} stroke={2.5} />
                    Tolak Pengajuan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
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

// ─── Document Preview Modal Component ──────────────────────────────────────────

interface DocumentPreviewModalProps {
  request: ApprovalRequest
  onClose: () => void
  onDownload: (e: React.MouseEvent) => void
}

function DocumentPreviewModal({ request, onClose, onDownload }: DocumentPreviewModalProps) {
  const isReimbursement = request.requestType === 'reimbursement'
  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

      {/* Modal Card */}
      <div className='relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border bg-muted/30 p-4'>
          <div>
            <h4 className='text-sm font-bold text-foreground'>Preview Dokumen Lampiran</h4>
            <p className='text-xs text-muted-foreground'>attachment_doc.pdf</p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={onDownload}
              className='flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted'
              title='Unduh Dokumen'
            >
              <IconDownload size={13} />
              <span>Unduh</span>
            </button>
            <button
              onClick={onClose}
              className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:text-foreground'
            >
              <IconX size={15} />
            </button>
          </div>
        </div>

        {/* Document Content View */}
        <div className='flex flex-1 items-center justify-center overflow-y-auto bg-muted/10 p-6'>
          <div className='flex aspect-[1/1.4] w-full max-w-sm flex-col justify-between rounded-xl border border-gray-200 bg-white p-8 font-mono text-[10px] leading-relaxed text-black shadow-lg select-text'>
            {isReimbursement ? (
              <>
                {/* Invoice Mock */}
                <div>
                  <div className='mb-4 border-b border-dashed border-gray-400 pb-3 text-center'>
                    <p className='text-xs font-bold tracking-wide uppercase'>
                      Toko Buku & Langganan Software
                    </p>
                    <p className='mt-0.5 text-[8px] text-gray-500'>
                      Jl. Jenderal Sudirman No. 45, Jakarta
                    </p>
                  </div>
                  <div className='mb-4 space-y-1 text-[9px]'>
                    <div className='flex justify-between'>
                      <span>TANGGAL:</span>
                      <span>11 Juni 2025</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>KASIR:</span>
                      <span>Santi</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>PELANGGAN:</span>
                      <span className='font-bold'>{request.employeeName}</span>
                    </div>
                  </div>
                  <div className='mb-2 border-b border-dashed border-gray-400 pb-2 font-bold'>
                    <div className='flex justify-between'>
                      <span>DESKRIPSI BARANG</span>
                      <span>SUBTOTAL</span>
                    </div>
                  </div>
                  <div className='mb-3 space-y-1.5 border-b border-dashed border-gray-400 pb-3'>
                    <div className='flex justify-between'>
                      <span>1x Buku Finansial Analysis</span>
                      <span>Rp 250.000</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>1x Langganan Software Charting</span>
                      <span>Rp 500.000</span>
                    </div>
                  </div>
                  <div className='flex justify-between text-[11px] font-bold'>
                    <span>TOTAL:</span>
                    <span>Rp 750.000</span>
                  </div>
                </div>
                <div className='mt-4 border-t border-dashed border-gray-400 pt-3 text-center text-[8px] text-gray-500'>
                  <p>Terima kasih atas kunjungan Anda</p>
                  <p className='mt-0.5'>Pembayaran Valid via Credit Card</p>
                </div>
              </>
            ) : (
              <>
                {/* Medical Note Mock */}
                <div>
                  <div className='mb-4 border-b border-gray-300 pb-3 text-center'>
                    <p className='text-xs font-bold tracking-wide text-blue-800 uppercase'>
                      Klinik Medika Sehat
                    </p>
                    <p className='mt-0.5 font-sans text-[7px] text-gray-500'>
                      Izin Operasional Dinkes No: 440/12/Dinkes/2023
                    </p>
                  </div>
                  <div className='mb-4 text-center text-[9px] font-bold uppercase underline'>
                    Surat Keterangan Sakit
                  </div>
                  <div className='space-y-3 font-sans text-[8px] leading-relaxed text-gray-800'>
                    <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
                    <div className='space-y-1 pl-3 font-bold text-black'>
                      <div className='flex'>
                        <span className='w-20'>Nama Pasien</span>
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
                    <p>
                      Berdasarkan hasil pemeriksaan medis, pasien tersebut dalam keadaan kurang
                      sehat dan memerlukan istirahat selama{' '}
                      <span className='font-bold text-black'>{request.days || 2} hari</span>.
                    </p>
                    <p>
                      Terhitung mulai tanggal{' '}
                      <span className='font-bold text-black'>11 Juni 2025</span> sampai dengan
                      tanggal <span className='font-bold text-black'>12 Juni 2025</span>.
                    </p>
                  </div>
                </div>
                <div className='mt-8 flex items-end justify-between font-sans text-[8px] text-gray-600'>
                  <div>
                    <p>Diagnosa: Demam Tinggi</p>
                  </div>
                  <div className='w-28 text-center'>
                    <p>Jakarta, 10 Juni 2025</p>
                    <p className='mt-10 font-bold text-black underline'>dr. Andi Wijaya, Sp.PD</p>
                    <p className='text-[7px]'>NIP. 198503122010121002</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
