import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconDownload,
  IconEye,
  IconFileText,
  IconInfoCircle,
  IconReceipt,
  IconSparkles,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'
import { MOCK_CLAIM_POLICIES, MOCK_OCR_RECEIPTS } from '../../data/mock-claim-data'
import type { ClaimRecord, ClaimCategory, OCRReceiptData } from '../../types'
import { OCRPreviewModal } from './ocr-preview-modal'
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
import { Progress } from '@/shared/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'

interface ClaimCreateTabProps {
  onSuccess: (newClaim: ClaimRecord) => void
  onCancel: () => void
}

export function ClaimCreateTab({ onSuccess, onCancel }: ClaimCreateTabProps) {
  const [category, setCategory] = useState<ClaimCategory>('meal')
  const [claimDate, setClaimDate] = useState('2024-04-24')
  const [amount, setAmount] = useState<number | ''>(530150)
  const [costCenter, setCostCenter] = useState('CC-TECH-101')
  const [description, setDescription] = useState(
    'Jamuan makan siang diskusi integrasi API Payment Gateway dengan tim Bank BCA di Restoran Sederhana GI.',
  )
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (BCA)')
  const [bankAccount, setBankAccount] = useState('8820-192-381 a.n Denny Adrian')
  const [uploadedReceipt, setUploadedReceipt] = useState<{
    url: string
    name: string
    merchant?: string
  } | null>({
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    name: 'Struk_Sederhana_BCA_Meeting.jpg',
    merchant: 'Restoran Sederhana SA (Grand Indonesia)',
  })

  // OCR modal state
  const [ocrModalOpen, setOcrModalOpen] = useState(false)
  const [ocrData, setOcrData] = useState<OCRReceiptData | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Find active quota policy
  const activePolicy = MOCK_CLAIM_POLICIES.find((p) => p.category === category)
  const currentClaimAmount = typeof amount === 'number' ? amount : 0
  const remainingAfterClaim = activePolicy
    ? Math.max(0, activePolicy.remainingMonthly - currentClaimAmount)
    : 0

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  // Trigger simulated OCR
  const handleTriggerOcr = (type: 'restaurant' | 'taxi' | 'medical' = 'restaurant') => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      const scanned = MOCK_OCR_RECEIPTS[type] || MOCK_OCR_RECEIPTS.restaurant
      setOcrData(scanned)
      setOcrModalOpen(true)
    }, 1200)
  }

  // Apply OCR scanned results
  const handleApplyOcr = (data: OCRReceiptData) => {
    setAmount(data.totalAmount)
    setClaimDate(data.receiptDate)
    setDescription(`Biaya ${data.merchantName} - Invoice #${data.invoiceNumber}`)
    setUploadedReceipt({
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      name: `Struk_${data.merchantName.slice(0, 10).replace(/[^a-zA-Z]/g, '')}.jpg`,
      merchant: data.merchantName,
    })
    snackbar.success('Data hasil scan OCR berhasil diterapkan ke formulir!')
  }

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!amount || amount <= 0) err.amount = 'Nominal klaim wajib diisi dan lebih dari 0.'
    if (!description.trim()) err.description = 'Deskripsi keperluan klaim wajib diisi.'
    if (!claimDate) err.claimDate = 'Tanggal transaksi wajib diisi.'
    if (!bankAccount.trim()) err.bankAccount = 'Rekening tujuan wajib diisi.'

    if (Object.keys(err).length > 0) {
      setErrors(err)
      return
    }

    const categoryLabels: Record<ClaimCategory, string> = {
      medical: 'Medical & Dental Care',
      transport: 'Local Transport & Taxi',
      meal: 'Client Meal & Entertainment',
      accommodation: 'Hotel & Lodging',
      office: 'Office & Internet Expenses',
      training: 'Training & Certification',
      other: 'Other Expenses',
    }

    const newClaim: ClaimRecord = {
      id: `clm-${Date.now()}`,
      claimNumber: `CLM-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
      employeeId: 'emp-003',
      employeeName: 'Denny Adrian, S.Kom.',
      employeeNik: 'EMP-ENG-001',
      employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      departmentName: 'Software Engineering',
      category,
      categoryLabel: categoryLabels[category] || 'General Claim',
      claimDate,
      amount: Number(amount),
      costCenter,
      description,
      paymentMethod,
      bankName: paymentMethod.includes('BCA') ? 'BCA' : 'Mandiri',
      bankAccount,
      receiptUrl: uploadedReceipt?.url,
      receiptFilename: uploadedReceipt?.name,
      receiptMerchant: uploadedReceipt?.merchant,
      status: 'pending',
      approvalFlow: [
        { role: 'Line Manager', approverName: 'Rizky Pratama', status: 'pending' },
        { role: 'HR Operations', approverName: 'Amanda Putri', status: 'pending' },
        { role: 'Finance Disbursement', approverName: 'Farhan Maulana', status: 'pending' },
      ],
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }

    onSuccess(newClaim)
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* OCR Modal */}
      <OCRPreviewModal
        open={ocrModalOpen}
        onOpenChange={setOcrModalOpen}
        data={ocrData}
        onApply={handleApplyOcr}
      />

      {/* Main Grid: Left Form + Right Live Policy & Approvals Preview */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* Left Column: Form (7 cols) */}
        <div className='lg:col-span-7 space-y-6'>
          <form onSubmit={handleSubmit} className='p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-5'>
            <div className='flex items-center justify-between border-b border-border/70 pb-4'>
              <div>
                <h3 className='text-sm font-bold text-foreground'>Formulir Pengajuan Klaim Baru</h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Isi rincian transaksi pengeluaran atau gunakan scanner OCR otomatis.
                </p>
              </div>

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => handleTriggerOcr('restaurant')}
                disabled={isScanning}
                className='rounded-xl h-8 text-xs font-bold gap-1.5 border-primary/40 text-primary hover:bg-primary/10'
              >
                <IconSparkles size={14} className={isScanning ? 'animate-spin' : ''} />
                {isScanning ? 'Memindai Struk...' : 'Auto-Scan OCR'}
              </Button>
            </div>

            {/* Category & Date */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Kategori Klaim <span className='text-rose-500'>*</span>
                </label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as ClaimCategory)}
                >
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
                    <SelectValue placeholder='Pilih Kategori' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='meal'>Client Meal & Entertainment</SelectItem>
                    <SelectItem value='transport'>Local Transport & Taxi</SelectItem>
                    <SelectItem value='medical'>Medical & Dental Care</SelectItem>
                    <SelectItem value='accommodation'>Hotel & Lodging</SelectItem>
                    <SelectItem value='office'>Office & Internet Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Tanggal Transaksi <span className='text-rose-500'>*</span>
                </label>
                <Input
                  type='date'
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  className='h-9 text-xs rounded-xl bg-background'
                />
                {errors.claimDate && (
                  <p className='text-[11px] text-rose-500 font-semibold'>{errors.claimDate}</p>
                )}
              </div>
            </div>

            {/* Amount & Cost Center */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Nominal Klaim (IDR) <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground'>
                    Rp
                  </span>
                  <Input
                    type='number'
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder='0'
                    className='h-9 pl-9 text-xs font-mono font-bold rounded-xl bg-background'
                  />
                </div>
                {errors.amount && (
                  <p className='text-[11px] text-rose-500 font-semibold'>{errors.amount}</p>
                )}
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Cost Center / Alokasi Anggaran <span className='text-rose-500'>*</span>
                </label>
                <Select value={costCenter} onValueChange={setCostCenter}>
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background font-mono'>
                    <SelectValue placeholder='Pilih Cost Center' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CC-TECH-101'>CC-TECH-101 (Software Engineering)</SelectItem>
                    <SelectItem value='CC-TECH-102'>CC-TECH-102 (Cloud & DevOps)</SelectItem>
                    <SelectItem value='CC-HR-201'>CC-HR-201 (People Operations)</SelectItem>
                    <SelectItem value='CC-SLS-401'>CC-SLS-401 (Enterprise Sales)</SelectItem>
                    <SelectItem value='CC-CORP-01'>CC-CORP-01 (General Corporate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description / Purpose */}
            <div className='space-y-1.5'>
              <label className='text-xs font-bold text-foreground'>
                Keperluan & Keterangan Pengeluaran <span className='text-rose-500'>*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Jelaskan tujuan pengeluaran, pihak yang hadir, atau rincian kegiatan...'
                className='text-xs min-h-[85px] rounded-xl'
              />
              {errors.description && (
                <p className='text-[11px] text-rose-500 font-semibold'>{errors.description}</p>
              )}
            </div>

            {/* Payment / Disbursement Account */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/60'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Metode Pembayaran
                </label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Bank Transfer (BCA)'>Bank Transfer (BCA)</SelectItem>
                    <SelectItem value='Bank Transfer (Mandiri)'>Bank Transfer (Mandiri)</SelectItem>
                    <SelectItem value='Payroll Batch Direct'>Payroll Batch Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Nomor Rekening Penerima
                </label>
                <Input
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder='8820-192-xxx a.n Nama'
                  className='h-9 text-xs font-mono rounded-xl bg-background'
                />
              </div>
            </div>

            {/* Receipt Upload Dropzone */}
            <div className='space-y-2 pt-1 border-t border-border/60'>
              <div className='flex items-center justify-between'>
                <label className='text-xs font-bold text-foreground'>
                  Unggah Bukti Struk / Faktur Pajak <span className='text-rose-500'>*</span>
                </label>
                <span className='text-[11px] text-muted-foreground'>Format: JPG, PNG, PDF (Maks 5MB)</span>
              </div>

              {uploadedReceipt ? (
                <div className='p-3 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between gap-3 text-xs'>
                  <div
                    onClick={() => setPreviewModalOpen(true)}
                    className='flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1'
                  >
                    <div className='size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors'>
                      <IconFileText size={18} />
                    </div>
                    <div className='min-w-0'>
                      <p className='font-bold text-foreground group-hover:text-primary transition-colors truncate'>
                        {uploadedReceipt.name}
                      </p>
                      <p className='text-[10px] text-emerald-600 font-semibold flex items-center gap-1'>
                        <IconCheck size={12} />
                        {uploadedReceipt.merchant || 'Struk Terunggah'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-1 shrink-0'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setPreviewModalOpen(true)}
                      title='Lihat Detail Dokumen'
                      className='size-8 p-0 rounded-lg text-primary hover:bg-primary/10 transition-colors'
                    >
                      <IconEye size={16} />
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setUploadedReceipt(null)}
                      title='Hapus Dokumen'
                      className='size-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors'
                    >
                      <IconX size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => handleTriggerOcr('restaurant')}
                  className='p-5 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/10 text-center space-y-1.5 group'
                >
                  <IconUpload size={24} className='mx-auto text-muted-foreground group-hover:text-primary transition-colors' />
                  <p className='text-xs font-bold text-foreground'>
                    Klik untuk unggah atau tarik struk ke sini
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Sistem akan otomatis mengekstrak total nominal via AI OCR
                  </p>
                </div>
              )}
            </div>

            {/* Submit & Cancel Buttons */}
            <div className='flex items-center justify-end gap-2.5 pt-4 border-t border-border/80'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onCancel}
                className='rounded-xl h-9 text-xs'
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs'
              >
                <IconCheck size={14} />
                Kirim Pengajuan Klaim
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Policy Tracking & Approvals Preview (5 cols) */}
        <div className='lg:col-span-5 space-y-4'>
          {/* Policy Balance Calculator Card */}
          <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4'>
            <div className='flex items-center justify-between border-b border-border/70 pb-3'>
              <div>
                <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                  Kalkulasi Sisa Plafon
                </h4>
                <p className='text-[11px] text-muted-foreground mt-0.5'>{activePolicy?.label}</p>
              </div>
              <Badge variant='outline' className='text-[10px] font-bold text-emerald-600 border-emerald-500/30'>
                Kebijakan Aktif
              </Badge>
            </div>

            {activePolicy && (
              <div className='space-y-3 text-xs'>
                <div className='p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2'>
                  <div className='flex justify-between text-muted-foreground text-[11px]'>
                    <span>Plafon Bulanan:</span>
                    <span className='font-bold text-foreground font-mono'>
                      {formatIdr(activePolicy.monthlyLimit)}
                    </span>
                  </div>
                  <div className='flex justify-between text-muted-foreground text-[11px]'>
                    <span>Sudah Terpakai Bulan Ini:</span>
                    <span className='font-bold text-amber-600 font-mono'>
                      {formatIdr(activePolicy.spentThisMonth)}
                    </span>
                  </div>
                  <div className='flex justify-between text-muted-foreground text-[11px]'>
                    <span>Klaim Saat Ini:</span>
                    <span className='font-bold text-primary font-mono'>
                      {formatIdr(currentClaimAmount)}
                    </span>
                  </div>
                  <div className='border-t border-border/70 pt-2 flex justify-between font-bold text-foreground'>
                    <span>Estimasi Sisa Kuota:</span>
                    <span className='text-emerald-600 font-mono'>
                      {formatIdr(remainingAfterClaim)}
                    </span>
                  </div>
                </div>

                <div className='space-y-1'>
                  <div className='flex justify-between text-[10px] text-muted-foreground'>
                    <span>Penggunaan Plafon Pasca Klaim</span>
                    <span>
                      {Math.min(
                        100,
                        Math.round(
                          ((activePolicy.spentThisMonth + currentClaimAmount) /
                            activePolicy.monthlyLimit) *
                            100,
                        ),
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      Math.round(
                        ((activePolicy.spentThisMonth + currentClaimAmount) /
                          activePolicy.monthlyLimit) *
                          100,
                      ),
                    )}
                    className='h-2 rounded-full'
                  />
                </div>
              </div>
            )}
          </div>

          {/* Approval Routing Preview Card */}
          <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3'>
            <h4 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
              <IconClock size={14} className='text-primary' />
              Tahapan Rute Persetujuan
            </h4>

            <div className='space-y-2.5 text-xs'>
              <div className='p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center gap-3'>
                <div className='size-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0'>
                  1
                </div>
                <div>
                  <p className='font-bold text-foreground'>Line Manager Review</p>
                  <p className='text-[11px] text-muted-foreground'>Rizky Pratama (Head of SE)</p>
                </div>
              </div>

              <div className='p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center gap-3'>
                <div className='size-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0'>
                  2
                </div>
                <div>
                  <p className='font-bold text-foreground'>HR Policy & Audit Verifier</p>
                  <p className='text-[11px] text-muted-foreground'>Amanda Putri (People Ops)</p>
                </div>
              </div>

              <div className='p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center gap-3'>
                <div className='size-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0'>
                  3
                </div>
                <div>
                  <p className='font-bold text-foreground'>Finance Disbursement Batch</p>
                  <p className='text-[11px] text-muted-foreground'>Farhan Maulana (Treasury Officer)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Document / Receipt Preview Modal ────────────────────────────── */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className='sm:max-w-[620px] p-0 overflow-hidden rounded-2xl'>
          <DialogHeader className='p-5 pb-3 border-b border-border/80 bg-muted/20 flex flex-row items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                <IconFileText size={20} />
              </div>
              <div>
                <DialogTitle className='text-sm font-bold text-foreground'>
                  Pratinjau Dokumen / Struk Transaksi
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5 truncate max-w-sm'>
                  {uploadedReceipt?.name} {uploadedReceipt?.merchant ? `• ${uploadedReceipt.merchant}` : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='p-5 bg-muted/10 flex flex-col items-center justify-center min-h-[320px] max-h-[65vh] overflow-y-auto'>
            {uploadedReceipt?.url ? (
              <div className='relative rounded-xl overflow-hidden border border-border shadow-md max-w-full bg-black/5 flex items-center justify-center'>
                <img
                  src={uploadedReceipt.url}
                  alt={uploadedReceipt.name}
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
                <IconCheck size={11} className='mr-1' /> Valid Receipt
              </Badge>
              <span>Format: JPG/PNG • Terlampir</span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  snackbar.success(`Dokumen "${uploadedReceipt?.name}" berhasil diunduh!`)
                }}
                className='h-8 text-xs font-semibold rounded-xl gap-1.5'
              >
                <IconDownload size={14} />
                Unduh Dokumen
              </Button>
              <Button
                type='button'
                size='sm'
                onClick={() => setPreviewModalOpen(false)}
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
