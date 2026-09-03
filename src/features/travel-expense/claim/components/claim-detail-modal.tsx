// src/features/travel-expense/claim/components/claim-detail-modal.tsx
import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconDownload,
  IconFileText,
  IconMail,
  IconReceipt,
  IconUser,
  IconX,
} from '@tabler/icons-react'
import type { ClaimRecord } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface ClaimDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: ClaimRecord | null
  onApprove?: (claim: ClaimRecord) => void
  onReject?: (claim: ClaimRecord) => void
}

export function ClaimDetailModal({
  open,
  onOpenChange,
  claim,
  onApprove,
  onReject,
}: ClaimDetailModalProps) {
  if (!claim) return null

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[760px] p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-muted/20'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconReceipt size={24} />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <DialogTitle className='text-base font-bold text-foreground'>
                    {claim.claimNumber}
                  </DialogTitle>
                  <Badge
                    variant='outline'
                    className={`text-[10px] font-bold ${
                      claim.status === 'paid'
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : claim.status === 'approved'
                        ? 'border-blue-500/30 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                        : claim.status === 'pending'
                        ? 'border-amber-500/30 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-rose-500/30 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
                    }`}
                  >
                    {claim.status === 'paid'
                      ? 'Sudah Dibayarkan (Paid)'
                      : claim.status === 'approved'
                      ? 'Disetujui (Approved)'
                      : claim.status === 'pending'
                      ? 'Menunggu Persetujuan'
                      : 'Ditolak (Rejected)'}
                  </Badge>
                </div>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  Diajukan pada {claim.createdAt} • Kategori: <strong>{claim.categoryLabel}</strong>
                </DialogDescription>
              </div>
            </div>
            <div className='text-right hidden sm:block'>
              <p className='text-[10px] text-muted-foreground font-semibold uppercase tracking-wider'>
                Total Pengajuan
              </p>
              <p className='text-lg font-bold text-primary font-mono'>{formatIdr(claim.amount)}</p>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6 space-y-6 max-h-[72vh] overflow-y-auto'>
          {/* Rejection Alert if rejected */}
          {claim.status === 'rejected' && claim.rejectionReason && (
            <div className='p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-300 space-y-1'>
              <p className='font-bold flex items-center gap-1.5'>
                <IconX size={14} />
                Alasan Penolakan Klaim:
              </p>
              <p className='leading-relaxed'>{claim.rejectionReason}</p>
            </div>
          )}

          {/* Grid Layout: Left Receipt & Right Info */}
          <div className='grid grid-cols-1 md:grid-cols-12 gap-5'>
            {/* Left 5 cols: Receipt Preview Card */}
            <div className='md:col-span-5 space-y-2'>
              <h5 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
                <IconFileText size={14} className='text-primary' />
                Lampiran Bukti Struk
              </h5>
              <div className='p-3 rounded-2xl border border-border/80 bg-muted/20 space-y-3'>
                {claim.receiptUrl ? (
                  <div className='relative group rounded-xl overflow-hidden border border-border/70 bg-card aspect-4/3 flex items-center justify-center'>
                    <img
                      src={claim.receiptUrl}
                      alt={claim.receiptFilename || 'Struk'}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                      <a
                        href={claim.receiptUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='px-3 py-1.5 rounded-lg bg-white/90 text-black text-xs font-bold flex items-center gap-1 shadow-md hover:bg-white'
                      >
                        <IconDownload size={13} />
                        Lihat Asli
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className='aspect-4/3 rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground italic text-center p-4'>
                    Tidak ada lampiran gambar struk.
                  </div>
                )}
                {claim.receiptMerchant && (
                  <div className='p-2.5 rounded-xl border border-border/70 bg-card text-xs space-y-0.5'>
                    <p className='text-[10px] text-muted-foreground font-semibold uppercase'>
                      Merchant Terbaca
                    </p>
                    <p className='font-bold text-foreground truncate'>{claim.receiptMerchant}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 7 cols: Claim Information Breakdown */}
            <div className='md:col-span-7 space-y-4'>
              <h5 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
                <IconUser size={14} className='text-primary' />
                Informasi Pengaju & Pembayaran
              </h5>

              {/* Employee Card */}
              <div className='p-3.5 rounded-xl border border-border/80 bg-card flex items-center gap-3'>
                {claim.employeeAvatar ? (
                  <img
                    src={claim.employeeAvatar}
                    alt={claim.employeeName}
                    className='size-10 rounded-xl object-cover border border-border shrink-0'
                  />
                ) : (
                  <div className='size-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0'>
                    {claim.employeeName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5'>
                    <p className='text-xs font-bold text-foreground truncate'>{claim.employeeName}</p>
                    <span className='text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground shrink-0'>
                      {claim.employeeNik}
                    </span>
                  </div>
                  <p className='text-[11px] text-muted-foreground truncate'>{claim.departmentName}</p>
                </div>
              </div>

              {/* Quick Details Grid */}
              <div className='grid grid-cols-2 gap-2.5 text-xs'>
                <div className='p-2.5 rounded-xl border border-border/80 bg-card'>
                  <p className='text-[10px] text-muted-foreground font-semibold flex items-center gap-1'>
                    <IconCalendar size={12} />
                    Tanggal Transaksi
                  </p>
                  <p className='font-bold text-foreground mt-0.5'>{claim.claimDate}</p>
                </div>
                <div className='p-2.5 rounded-xl border border-border/80 bg-card'>
                  <p className='text-[10px] text-muted-foreground font-semibold flex items-center gap-1'>
                    <IconBuilding size={12} />
                    Cost Center
                  </p>
                  <p className='font-mono font-bold text-foreground mt-0.5'>{claim.costCenter}</p>
                </div>
                <div className='p-2.5 rounded-xl border border-border/80 bg-card col-span-2'>
                  <p className='text-[10px] text-muted-foreground font-semibold flex items-center gap-1'>
                    <IconCreditCard size={12} />
                    Rekening Pencairan Reimbursement
                  </p>
                  <p className='font-bold text-foreground mt-0.5'>{claim.bankAccount}</p>
                  <p className='text-[10px] text-muted-foreground'>{claim.paymentMethod}</p>
                </div>
              </div>

              {/* Description */}
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20 text-xs text-foreground leading-relaxed'>
                <p className='text-[10px] font-bold text-muted-foreground uppercase mb-1'>
                  Keperluan & Deskripsi Klaim
                </p>
                {claim.description}
              </div>
            </div>
          </div>

          {/* Bottom Approval Flow Timeline */}
          <div className='space-y-3 pt-3 border-t border-border/80'>
            <h5 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
              <IconClock size={14} className='text-primary' />
              Alur Persetujuan Bertingkat (Approval Flow)
            </h5>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {claim.approvalFlow.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs relative ${
                    step.status === 'approved'
                      ? 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : step.status === 'pending'
                      ? 'border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20'
                  }`}
                >
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-[10px] font-bold uppercase text-muted-foreground'>
                      Tahap {idx + 1}: {step.role}
                    </span>
                    <Badge
                      variant='outline'
                      className={`text-[8px] font-bold px-1.5 py-0 ${
                        step.status === 'approved'
                          ? 'border-emerald-500/30 text-emerald-600'
                          : step.status === 'pending'
                          ? 'border-amber-500/30 text-amber-600'
                          : 'border-rose-500/30 text-rose-600'
                      }`}
                    >
                      {step.status}
                    </Badge>
                  </div>
                  <p className='font-bold text-foreground truncate'>{step.approverName}</p>
                  {step.date && (
                    <p className='text-[10px] text-muted-foreground mt-0.5'>{step.date}</p>
                  )}
                  {step.notes && (
                    <p className='text-[10px] italic text-foreground/80 mt-1 border-t border-border/50 pt-1'>
                      "{step.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-between'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs'
          >
            Tutup
          </Button>

          <div className='flex items-center gap-2'>
            {claim.status === 'pending' && onReject && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  onOpenChange(false)
                  onReject(claim)
                }}
                className='rounded-xl h-9 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold'
              >
                <IconX size={14} className='mr-1' />
                Tolak Klaim
              </Button>
            )}
            {claim.status === 'pending' && onApprove && (
              <Button
                type='button'
                size='sm'
                onClick={() => {
                  onOpenChange(false)
                  onApprove(claim)
                }}
                className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white'
              >
                <IconCheck size={14} />
                Setujui Klaim
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
