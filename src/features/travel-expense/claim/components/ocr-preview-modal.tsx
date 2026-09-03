// src/features/travel-expense/claim/components/ocr-preview-modal.tsx
import {
  IconCheck,
  IconReceipt,
  IconSparkles,
} from '@tabler/icons-react'
import type { OCRReceiptData } from '../../types'
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

interface OCRPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: OCRReceiptData | null
  onApply: (data: OCRReceiptData) => void
}

export function OCRPreviewModal({
  open,
  onOpenChange,
  data,
  onApply,
}: OCRPreviewModalProps) {
  if (!data) return null

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[620px] p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-linear-to-r from-blue-500/10 via-primary/5 to-purple-500/10'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs'>
              <IconSparkles size={22} />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <DialogTitle className='text-base font-bold text-foreground'>
                  AI Smart OCR Scanner Preview
                </DialogTitle>
                <Badge
                  variant='outline'
                  className='text-[10px] font-bold border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                >
                  {Math.round(data.confidenceScore * 100)}% Accuracy
                </Badge>
              </div>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Sistem berhasil memindai dan mengekstrak rincian struk transaksi secara otomatis.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6 space-y-5 max-h-[70vh] overflow-y-auto'>
          {/* Scanned Receipt Summary Card */}
          <div className='p-4 rounded-xl border border-border/80 bg-amber-50/40 dark:bg-amber-950/10 space-y-3 font-mono text-xs'>
            <div className='flex items-start justify-between border-b border-border/70 pb-3'>
              <div>
                <p className='text-[10px] uppercase font-bold text-muted-foreground'>Merchant / Toko</p>
                <p className='text-sm font-bold text-foreground'>{data.merchantName}</p>
                {data.taxId && (
                  <p className='text-[10px] text-muted-foreground mt-0.5'>NPWP: {data.taxId}</p>
                )}
              </div>
              <div className='text-right'>
                <p className='text-[10px] uppercase font-bold text-muted-foreground'>Invoice / Tanggal</p>
                <p className='text-xs font-bold text-foreground'>{data.invoiceNumber}</p>
                <p className='text-[11px] text-muted-foreground mt-0.5'>{data.receiptDate}</p>
              </div>
            </div>

            {/* Line items table */}
            <div className='space-y-1.5 pt-1'>
              <div className='flex justify-between text-[11px] font-bold text-muted-foreground border-b border-border/50 pb-1'>
                <span>Item Transaksi</span>
                <span>Jumlah (IDR)</span>
              </div>
              {data.items.map((item, idx) => (
                <div key={idx} className='flex items-center justify-between text-xs text-foreground'>
                  <span className='truncate mr-4'>{item.description}</span>
                  <span className='font-bold shrink-0'>{formatIdr(item.amount)}</span>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div className='border-t border-border/70 pt-2.5 space-y-1 text-xs'>
              <div className='flex justify-between text-muted-foreground text-[11px]'>
                <span>Subtotal</span>
                <span>{formatIdr(data.subtotal)}</span>
              </div>
              {data.taxAmount > 0 && (
                <div className='flex justify-between text-muted-foreground text-[11px]'>
                  <span>PB1 / PPN 11%</span>
                  <span>{formatIdr(data.taxAmount)}</span>
                </div>
              )}
              {data.serviceCharge && (
                <div className='flex justify-between text-muted-foreground text-[11px]'>
                  <span>Service Charge</span>
                  <span>{formatIdr(data.serviceCharge)}</span>
                </div>
              )}
              <div className='flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-dashed border-border/80'>
                <span className='flex items-center gap-1.5'>
                  <IconReceipt size={16} className='text-primary' />
                  Total Nominal Klaim
                </span>
                <span className='text-primary'>{formatIdr(data.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className='p-3 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2'>
            <IconSparkles size={16} className='shrink-0 text-blue-600' />
            <span>
              Klik tombol di bawah untuk otomatis mengisi formulir klaim dengan data merchant, tanggal, dan nominal di atas.
            </span>
          </div>
        </div>

        <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='rounded-xl h-9 text-xs'
          >
            Tutup
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={() => {
              onApply(data)
              onOpenChange(false)
            }}
            className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs'
          >
            <IconCheck size={14} />
            Terapkan ke Formulir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
