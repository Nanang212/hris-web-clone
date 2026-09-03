// src/features/travel-expense/business-trip/components/trip-expenses-tab.tsx
import {
  IconArrowBackUp,
  IconBuilding,
  IconCash,
  IconCheck,
  IconCreditCard,
  IconDownload,
  IconEye,
  IconFileSpreadsheet,
  IconFileText,
  IconMapPin,
  IconPlus,
  IconReceipt,
  IconSparkles,
} from '@tabler/icons-react'
import { useState } from 'react'
import type { BusinessTripRecord, TripExpenseItem } from '../../types'
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
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

interface TripExpensesTabProps {
  trips: BusinessTripRecord[]
  selectedTripId?: string
  onUpdateExpenses?: (tripId: string, updatedExpenses: TripExpenseItem[]) => void
}

export function TripExpensesTab({
  trips,
  selectedTripId,
  onUpdateExpenses,
}: TripExpensesTabProps) {
  const [currentTripId, setCurrentTripId] = useState<string>(
    selectedTripId || trips[0]?.id || '',
  )
  const [receiptPreviewItem, setReceiptPreviewItem] = useState<TripExpenseItem | null>(null)

  const currentTrip = trips.find((t) => t.id === currentTripId) || trips[0]

  // Add expense modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [expenseCategory, setExpenseCategory] = useState<
    'flight' | 'hotel' | 'per_diem' | 'local_transport' | 'client_meeting' | 'other'
  >('local_transport')
  const [expenseDate, setExpenseDate] = useState('2024-05-08')
  const [expenseDesc, setExpenseDesc] = useState('')
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('')

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  if (!currentTrip) {
    return (
      <div className='p-12 text-center text-muted-foreground'>
        Tidak ada data perjalanan dinas yang dipilih.
      </div>
    )
  }

  // Calculate totals
  const totalAdvance = currentTrip.cashAdvanceRequested ? currentTrip.cashAdvanceAmount : 0
  const totalActual = currentTrip.expenses.reduce((acc, e) => acc + e.actualAmount, 0)
  const settlementBalance = totalAdvance - totalActual // > 0 = Refund to Company, < 0 = Reimburse to Employee

  const handleAddExpense = () => {
    if (!expenseDesc.trim() || !expenseAmount || Number(expenseAmount) <= 0) {
      snackbar.error('Deskripsi dan nominal pengeluaran wajib diisi dengan benar.')
      return
    }

    const categoryLabels: Record<string, string> = {
      flight: 'Tiket Penerbangan / Kereta',
      hotel: 'Akomodasi Hotel & Penginapan',
      per_diem: 'Uang Saku Harian (Per Diem)',
      local_transport: 'Taksi Lokal & Operasional',
      client_meeting: 'Jamuan Makan / Meeting Klien',
      other: 'Biaya Lain-lain',
    }

    const newItem: TripExpenseItem = {
      id: `exp-${Date.now()}`,
      category: expenseCategory,
      categoryLabel: categoryLabels[expenseCategory] || 'Pengeluaran',
      date: expenseDate,
      description: expenseDesc,
      estimatedAmount: Number(expenseAmount),
      actualAmount: Number(expenseAmount),
      isSettled: true,
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    }

    const updated = [...currentTrip.expenses, newItem]
    if (onUpdateExpenses) {
      onUpdateExpenses(currentTrip.id, updated)
    }

    snackbar.success('Item bukti pengeluaran dinas berhasil ditambahkan!')
    setAddModalOpen(false)
    setExpenseDesc('')
    setExpenseAmount('')
  }

  const handleSubmitSettlement = () => {
    snackbar.success(
      `Formulir Penyelesaian Realisasi Biaya (${currentTrip.tripNumber}) berhasil dikirimkan ke Tim Finance untuk proses verifikasi!`,
    )
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Add Expense Modal ──────────────────────────────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className='sm:max-w-[480px] p-0 overflow-hidden rounded-2xl'>
          <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-muted/20'>
            <DialogTitle className='text-base font-bold text-foreground'>
              Tambah Item Realisasi Pengeluaran
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
              {currentTrip.title} • {currentTrip.destinationCity}
            </DialogDescription>
          </DialogHeader>

          <div className='p-6 space-y-4 text-xs'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='font-bold text-foreground'>Kategori Pengeluaran</label>
                <Select
                  value={expenseCategory}
                  onValueChange={(val) => setExpenseCategory(val as any)}
                >
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='local_transport'>Taksi Lokal & Operasional</SelectItem>
                    <SelectItem value='hotel'>Akomodasi Hotel</SelectItem>
                    <SelectItem value='client_meeting'>Jamuan / Meeting Klien</SelectItem>
                    <SelectItem value='flight'>Tiket Transportasi</SelectItem>
                    <SelectItem value='other'>Biaya Lain-lain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='font-bold text-foreground'>Tanggal Transaksi</label>
                <Input
                  type='date'
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className='h-9 text-xs rounded-xl bg-background'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='font-bold text-foreground'>
                Nominal Aktual (IDR) <span className='text-rose-500'>*</span>
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground'>
                  Rp
                </span>
                <Input
                  type='number'
                  value={expenseAmount}
                  onChange={(e) =>
                    setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder='0'
                  className='h-9 pl-9 text-xs font-mono font-bold rounded-xl bg-background'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='font-bold text-foreground'>
                Deskripsi & Keterangan Transaksi <span className='text-rose-500'>*</span>
              </label>
              <Input
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder='Contoh: GrabCar dari Bandara Juanda ke Kantor Bank Jatim'
                className='h-9 text-xs rounded-xl bg-background'
              />
            </div>
          </div>

          <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setAddModalOpen(false)}
              className='rounded-xl h-9 text-xs'
            >
              Batal
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleAddExpense}
              className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs'
            >
              <IconCheck size={14} />
              Simpan Bukti Pengeluaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Top Trip Selector Banner ───────────────────────────────────────── */}
      <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div className='flex items-center gap-3.5'>
          <div className='size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs'>
            <IconReceipt size={24} />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold text-foreground'>{currentTrip.title}</h3>
              <Badge variant='outline' className='text-[10px] font-bold text-primary border-primary/30'>
                {currentTrip.tripNumber}
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5 flex items-center gap-2'>
              <span>{currentTrip.employeeName}</span>
              •
              <span className='flex items-center gap-1 text-foreground font-semibold'>
                <IconMapPin size={12} className='text-rose-500' />
                {currentTrip.destinationCity}
              </span>
              •
              <span>Cost Center: <strong className='font-mono text-foreground'>{currentTrip.costCenter}</strong></span>
            </p>
          </div>
        </div>

        {/* Trip Switcher Dropdown */}
        <div className='w-full sm:w-72 shrink-0'>
          <Select value={currentTripId} onValueChange={setCurrentTripId}>
            <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
              <SelectValue placeholder='Pilih Perjalanan Dinas' />
            </SelectTrigger>
            <SelectContent>
              {trips.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.tripNumber} - {t.destinationCity} ({t.employeeName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Settlement Calculation Cards ──────────────────────────────────── */}
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs'>
          <p className='text-xs font-semibold text-muted-foreground'>Uang Muka Diterima</p>
          <h3 className='text-lg font-bold text-foreground font-mono mt-0.5'>
            {formatIdr(totalAdvance)}
          </h3>
          <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Cash Advance Awal</p>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs'>
          <p className='text-xs font-semibold text-muted-foreground'>Total Pengeluaran Riil</p>
          <h3 className='text-lg font-bold text-primary font-mono mt-0.5'>
            {formatIdr(totalActual)}
          </h3>
          <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>Berdasarkan Kwitansi</p>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs'>
          <p className='text-xs font-semibold text-muted-foreground'>Status Penyelesaian Kas</p>
          <h3
            className={`text-lg font-bold font-mono mt-0.5 ${
              settlementBalance > 0
                ? 'text-emerald-600'
                : settlementBalance < 0
                ? 'text-amber-600'
                : 'text-foreground'
            }`}
          >
            {settlementBalance > 0
              ? `Refund ${formatIdr(settlementBalance)}`
              : settlementBalance < 0
              ? `Reimburse ${formatIdr(Math.abs(settlementBalance))}`
              : 'Nol (Sesuai Pas)'}
          </h3>
          <p className='text-[10px] text-muted-foreground font-medium mt-0.5'>
            {settlementBalance > 0
              ? 'Karyawan Mengembalikan ke Kasir'
              : settlementBalance < 0
              ? 'Perusahaan Mengganti Kekurangan'
              : 'Uang Muka Pas Terpakai'}
          </p>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between'>
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>Status Verifikasi</p>
            <Badge
              variant='outline'
              className='mt-1 text-[10px] font-bold border-blue-500/30 text-blue-600 bg-blue-50/50'
            >
              {currentTrip.settlementStatus === 'verified'
                ? 'Verified by Finance'
                : 'Submitted (Menunggu Verifikasi)'}
            </Badge>
          </div>
          <Button
            size='sm'
            onClick={handleSubmitSettlement}
            className='rounded-xl h-8 text-xs font-bold gap-1 mt-2 shadow-xs'
          >
            <IconCheck size={14} />
            Submit Settlement
          </Button>
        </div>
      </div>

      {/* ── Line Items Expense Table ───────────────────────────────────────── */}
      <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3'>
          <div>
            <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Rincian Bukti Pengeluaran Riil (Expense Line Items)
            </h4>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              Daftar seluruh tiket, hotel, per diem, dan biaya taksi yang terealisasi.
            </p>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={() => setAddModalOpen(true)}
            className='rounded-xl h-8 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 shrink-0'
          >
            <IconPlus size={14} />
            Tambah Bukti Kwitansi
          </Button>
        </div>

        <div className='w-full overflow-x-auto'>
          <table className='w-full text-xs text-left border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]'>
                <th className='py-3 px-4'>Kategori Biaya</th>
                <th className='py-3 px-4'>Deskripsi Transaksi</th>
                <th className='py-3 px-4'>Tanggal</th>
                <th className='py-3 px-4 text-right'>Estimasi Awal</th>
                <th className='py-3 px-4 text-right'>Realisasi Riil</th>
                <th className='py-3 px-4 text-center'>Bukti</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {currentTrip.expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-8 text-center text-muted-foreground italic'>
                    Belum ada item realisasi biaya yang tercatat untuk dinas ini.
                  </td>
                </tr>
              ) : (
                currentTrip.expenses.map((item) => (
                  <tr key={item.id} className='hover:bg-muted/20 transition-colors'>
                    <td className='py-3 px-4'>
                      <Badge variant='outline' className='text-[9px] font-semibold bg-muted/40'>
                        {item.categoryLabel}
                      </Badge>
                    </td>

                    <td className='py-3 px-4 font-semibold text-foreground'>{item.description}</td>

                    <td className='py-3 px-4 text-muted-foreground'>{item.date}</td>

                    <td className='py-3 px-4 text-right font-mono text-muted-foreground'>
                      {formatIdr(item.estimatedAmount)}
                    </td>

                    <td className='py-3 px-4 text-right font-mono font-bold text-foreground'>
                      {formatIdr(item.actualAmount)}
                    </td>

                    <td className='py-3 px-4 text-center'>
                      {item.receiptUrl ? (
                        <button
                          type='button'
                          onClick={() => setReceiptPreviewItem(item)}
                          className='inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-500/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer'
                        >
                          <IconEye size={12} />
                          Lihat Bukti
                        </button>
                      ) : (
                        <span className='text-[10px] text-muted-foreground italic'>Per Diem Auto</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Document / Receipt Preview Modal ────────────────────────────── */}
      <Dialog
        open={!!receiptPreviewItem}
        onOpenChange={(open) => !open && setReceiptPreviewItem(null)}
      >
        <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden rounded-2xl'>
          <DialogHeader className='p-5 pb-3 border-b border-border/80 bg-muted/20 flex flex-row items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                <IconFileText size={20} />
              </div>
              <div>
                <DialogTitle className='text-sm font-bold text-foreground'>
                  Bukti Pengeluaran Realisasi Dinas
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5 truncate max-w-sm'>
                  {receiptPreviewItem?.description} • {receiptPreviewItem?.categoryLabel}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='p-5 bg-muted/10 flex flex-col items-center justify-center min-h-[320px] max-h-[65vh] overflow-y-auto'>
            {receiptPreviewItem?.receiptUrl ? (
              <div className='relative rounded-xl overflow-hidden border border-border shadow-md max-w-full bg-black/5 flex items-center justify-center'>
                <img
                  src={receiptPreviewItem.receiptUrl}
                  alt={receiptPreviewItem.description}
                  className='max-h-[460px] w-auto object-contain rounded-xl select-none'
                />
              </div>
            ) : (
              <div className='text-center text-muted-foreground text-xs p-8'>
                Tidak ada file bukti dokumen yang dipilih.
              </div>
            )}
          </div>

          <DialogFooter className='p-4 border-t border-border/80 bg-muted/15 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
              <Badge variant='outline' className='text-[10px] font-semibold border-emerald-500/30 text-emerald-600 bg-emerald-50/50'>
                <IconCheck size={11} className='mr-1' /> {receiptPreviewItem ? formatIdr(receiptPreviewItem.actualAmount) : ''}
              </Badge>
              <span>Tanggal: {receiptPreviewItem?.date}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  snackbar.success(`Bukti kuitansi "${receiptPreviewItem?.description}" berhasil diunduh!`)
                }}
                className='h-8 text-xs font-semibold rounded-xl gap-1.5'
              >
                <IconDownload size={14} />
                Unduh Bukti
              </Button>
              <Button
                type='button'
                size='sm'
                onClick={() => setReceiptPreviewItem(null)}
                className='h-8 text-xs font-semibold rounded-xl'
              >
                Tutup
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
