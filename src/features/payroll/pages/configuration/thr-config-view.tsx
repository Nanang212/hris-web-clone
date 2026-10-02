// src/features/payroll/pages/configuration/thr-config-view.tsx — THR Policy, Tax Installment Scheme & Schedules
import {
  IconCalculator,
  IconCheck,
  IconCoins,
  IconEdit,
  IconInfoCircle,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconSparkles,
} from '@tabler/icons-react'
import { useState } from 'react'
import {
  initialThrPolicyConfig,
  initialThrTaxInstallments,
  formatIDR,
} from '../../data/mock-payroll-data'
import type { ThrPolicyConfig, ThrTaxInstallment } from '../../types'
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
import { Switch } from '@/shared/components/ui/switch'
import { TableActionButton } from '@/shared/components/ui/table-action-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

export function ThrConfigView() {
  // General Policy State
  const [config, setConfig] = useState<ThrPolicyConfig>(initialThrPolicyConfig)

  // Schedules State
  const [schedules, setSchedules] = useState<ThrTaxInstallment[]>(initialThrTaxInstallments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Interactive Simulator State
  const [simBaseWage, setSimBaseWage] = useState<number>(15000000)
  const [simTenureMonths, setSimTenureMonths] = useState<number>(24)
  const [simTenor, setSimTenor] = useState<number>(3)

  // Modal State for Add / Edit Installment
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ThrTaxInstallment | null>(null)
  const [modalForm, setModalForm] = useState<{
    employeeName: string
    employeeCode: string
    department: string
    totalThrAmount: number
    totalTaxAmount: number
    tenorMonths: number
    startPeriod: string
    notes: string
  }>({
    employeeName: '',
    employeeCode: '',
    department: '',
    totalThrAmount: 0,
    totalTaxAmount: 0,
    tenorMonths: 3,
    startPeriod: 'Juni 2026',
    notes: '',
  })

  // Save General Policy
  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault()
    snackbar.success('Kebijakan THR dan konfigurasi cicilan pajak PPh 21 berhasil disimpan!')
  }

  // Simulation calculations
  const simThrAmount =
    simTenureMonths >= 12
      ? simBaseWage
      : Math.round((simTenureMonths / 12) * simBaseWage)
  // Simplified TER estimate for simulation (~8%-10% depending on wage)
  const simTaxRate = simThrAmount > 15000000 ? 0.10 : 0.075
  const simEstimatedTax = Math.round(simThrAmount * simTaxRate)
  const simMonthlyInstallment = Math.round(simEstimatedTax / (simTenor || 1))

  // Filtered schedules
  const filteredSchedules = schedules.filter((item) => {
    const matchSearch =
      item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      item.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || item.currentStatus === statusFilter
    return matchSearch && matchStatus
  })

  // Schedule Actions
  const handleTogglePause = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.currentStatus === 'paused' ? 'active' : 'paused'
          const label = nextStatus === 'paused' ? 'dijeda' : 'diaktifkan kembali'
          snackbar.info(`Cicilan pajak untuk ${item.employeeName} telah ${label}.`)
          return { ...item, currentStatus: nextStatus }
        }
        return item
      }),
    )
  }

  const handleSettleFull = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          snackbar.success(`Cicilan pajak ${item.employeeName} berhasil dilunasi sekaligus!`)
          return {
            ...item,
            paidInstallments: item.tenorMonths,
            remainingBalance: 0,
            currentStatus: 'completed',
          }
        }
        return item
      }),
    )
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    setModalForm({
      employeeName: '',
      employeeCode: '',
      department: 'IT & Engineering',
      totalThrAmount: 15000000,
      totalTaxAmount: 1200000,
      tenorMonths: config.defaultTenorMonths || 3,
      startPeriod: 'Juni 2026',
      notes: 'Penyesuaian cicilan pajak THR manual',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: ThrTaxInstallment) => {
    setEditingItem(item)
    setModalForm({
      employeeName: item.employeeName,
      employeeCode: item.employeeCode,
      department: item.department,
      totalThrAmount: item.totalThrAmount,
      totalTaxAmount: item.totalTaxAmount,
      tenorMonths: item.tenorMonths,
      startPeriod: item.startPeriod,
      notes: item.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalForm.employeeName.trim() || !modalForm.employeeCode.trim()) {
      snackbar.error('Nama dan NIK karyawan wajib diisi.')
      return
    }

    const calculatedInstallment = Math.round(
      modalForm.totalTaxAmount / (modalForm.tenorMonths || 1),
    )

    if (editingItem) {
      setSchedules((prev) =>
        prev.map((item) => {
          if (item.id === editingItem.id) {
            const paid = item.paidInstallments
            const remaining = Math.max(0, modalForm.totalTaxAmount - paid * calculatedInstallment)
            return {
              ...item,
              employeeName: modalForm.employeeName,
              employeeCode: modalForm.employeeCode,
              department: modalForm.department,
              totalThrAmount: modalForm.totalThrAmount,
              totalTaxAmount: modalForm.totalTaxAmount,
              tenorMonths: modalForm.tenorMonths,
              installmentPerMonth: calculatedInstallment,
              remainingBalance: remaining,
              notes: modalForm.notes,
            }
          }
          return item
        }),
      )
      snackbar.success('Jadwal cicilan pajak THR berhasil diperbarui.')
    } else {
      const newItem: ThrTaxInstallment = {
        id: `thr-inst-${Date.now()}`,
        employeeId: modalForm.employeeCode,
        employeeName: modalForm.employeeName,
        employeeCode: modalForm.employeeCode,
        department: modalForm.department,
        totalThrAmount: modalForm.totalThrAmount,
        totalTaxAmount: modalForm.totalTaxAmount,
        tenorMonths: modalForm.tenorMonths,
        installmentPerMonth: calculatedInstallment,
        startPeriod: modalForm.startPeriod,
        endPeriod: 'Agustus 2026',
        paidInstallments: 0,
        remainingBalance: modalForm.totalTaxAmount,
        currentStatus: 'active',
        paymentResponsibility: 'employee_deduction',
        notes: modalForm.notes,
      }
      setSchedules((prev) => [newItem, ...prev])
      snackbar.success(`Jadwal cicilan pajak untuk ${newItem.employeeName} berhasil ditambahkan!`)
    }

    setIsModalOpen(false)
  }

  return (
    <div className='space-y-8'>
      {/* ── Section 1: Kebijakan Pokok THR & Regulasi ────────────────────── */}
      <form onSubmit={handleSavePolicy} className='space-y-6'>
        <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
          <div className='flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/60'>
            <div>
              <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
                <IconCoins className='size-4.5 text-primary' />
                Kebijakan Pokok Tunjangan Hari Raya (THR)
              </h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Ketentuan perhitungan dan pencairan THR Keagamaan sesuai Permenaker No. 6/2016
              </p>
            </div>
            <Badge variant='outline' className='text-xs font-mono font-medium'>
              Regulasi: Permenaker 6/2016 & PMK 168
            </Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Minimal Masa Kerja Berhak THR (Bulan)
              </label>
              <Input
                type='number'
                value={config.minTenureMonths}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    minTenureMonths: parseInt(e.target.value, 10) || 1,
                  }))
                }
                className='h-9.5 text-xs bg-background rounded-xl'
              />
              <p className='text-[10px] text-muted-foreground'>
                Karyawan dengan masa kerja ≥ 1 bulan berhak mendapatkan THR secara prorata
              </p>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Batas Waktu Pembayaran (H- Hari)
              </label>
              <Input
                type='number'
                value={config.paymentTimingDays}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    paymentTimingDays: parseInt(e.target.value, 10) || 7,
                  }))
                }
                className='h-9.5 text-xs bg-background rounded-xl'
              />
              <p className='text-[10px] text-muted-foreground'>
                Maksimal H-7 sebelum Hari Raya Keagamaan yang bersangkutan
              </p>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Skema Pemotongan Pajak THR (Reguler)
              </label>
              <Select
                value={config.taxDeductionScheme}
                onValueChange={(val: 'combined' | 'separate') =>
                  setConfig((prev) => ({ ...prev, taxDeductionScheme: val }))
                }
              >
                <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                  <SelectValue placeholder='Pilih skema' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='combined'>Digabung dalam Payroll Bulanan (TER Bulanan)</SelectItem>
                  <SelectItem value='separate'>Batch Khusus Non-Reguler (TER Khusus)</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-[10px] text-muted-foreground'>
                Berdasarkan pedoman PMK No. 168 Tahun 2023
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 2: Skema Cicilan Pajak THR (Tax Installment Policy) ── */}
        <div className='rounded-2xl border border-primary/20 bg-linear-to-b from-primary/5 via-card to-card p-6 shadow-xs space-y-6'>
          <div className='flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border/60'>
            <div>
              <div className='flex items-center gap-2'>
                <h3 className='text-sm font-bold text-foreground'>
                  Fasilitas Cicilan Pajak PPh 21 THR (Tax Installment Facility)
                </h3>
                <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20'>
                  Internal HR Policy
                </span>
              </div>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Solusi keringanan agar pemotongan pajak THR tidak memberatkan take-home pay karyawan di bulan berjalan.
              </p>
            </div>

            <div className='flex items-center gap-3 bg-background/80 px-3.5 py-1.5 rounded-xl border border-border/80 shadow-2xs'>
              <span className='text-xs font-semibold text-foreground'>
                {config.taxInstallmentEnabled ? 'Fasilitas Aktif' : 'Non-Aktif'}
              </span>
              <Switch
                checked={config.taxInstallmentEnabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, taxInstallmentEnabled: checked }))
                }
              />
            </div>
          </div>

          {config.taxInstallmentEnabled ? (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>
                    Pilihan Tenor Cicilan Default
                  </label>
                  <Select
                    value={String(config.defaultTenorMonths)}
                    onValueChange={(val) =>
                      setConfig((prev) => ({
                        ...prev,
                        defaultTenorMonths: parseInt(val, 10),
                      }))
                    }
                  >
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                      <SelectValue placeholder='Pilih tenor' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>1 Bulan (Langsung potong penuh)</SelectItem>
                      <SelectItem value='2'>2 Bulan (50% per bulan)</SelectItem>
                      <SelectItem value='3'>3 Bulan (Rekomendasi - ~33.3% per bulan)</SelectItem>
                      <SelectItem value='4'>4 Bulan (25% per bulan)</SelectItem>
                      <SelectItem value='6'>6 Bulan (Maksimal)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-[10px] text-muted-foreground'>
                    Standar tenor angsuran pajak THR yang diberikan kepada karyawan
                  </p>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>
                    Ambang Batas Minimum Pajak untuk Dicicil
                  </label>
                  <Input
                    type='number'
                    step={50000}
                    value={config.minTaxForInstallment}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        minTaxForInstallment: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className='h-9.5 text-xs bg-background rounded-xl'
                  />
                  <p className='text-[10px] text-muted-foreground'>
                    Nominal pajak di bawah {formatIDR(config.minTaxForInstallment)} tidak dicicil
                  </p>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground'>
                    Otomatisasi Potongan pada Payroll Bulanan
                  </label>
                  <div className='flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-background h-9.5'>
                    <span className='text-xs text-foreground font-medium'>Auto-Apply ke Slip Gaji</span>
                    <Switch
                      checked={config.autoDeductInPayroll}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, autoDeductInPayroll: checked }))
                      }
                    />
                  </div>
                  <p className='text-[10px] text-muted-foreground'>
                    Sistem otomatis menambahkan cicilan berjalan ke potongan slip gaji bulan berikutnya
                  </p>
                </div>
              </div>

              {/* Information Callout */}
              <div className='p-4 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-3 text-xs'>
                <IconInfoCircle className='size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5' />
                <div className='space-y-1 text-muted-foreground'>
                  <p className='font-semibold text-foreground'>
                    Bagaimana Skema Cicilan Pajak THR Bekerja di HRIS:
                  </p>
                  <ul className='list-disc list-inside space-y-0.5 text-[11px]'>
                    <li>
                      Perusahaan menyetorkan PPh 21 THR secara tepat waktu ke kas negara pada bulan pencairan THR sesuai ketentuan SPT Masa.
                    </li>
                    <li>
                      Karyawan tidak dipotong langsung 100% dari THR-nya, melainkan dicicil melalui komponen potongan{' '}
                      <span className='font-mono font-bold text-foreground'>Cicilan PPh 21 THR (DED_THR_TAX_INST)</span>{' '}
                      selama {config.defaultTenorMonths} bulan ke depan.
                    </li>
                    <li>
                      HR tetap memiliki fleksibilitas untuk melakukan{' '}
                      <span className='font-bold text-foreground'>penyesuaian manual (override)</span> di detail batch payroll jika ada kebutuhan pelunasan dipercepat atau karyawan resign.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className='p-6 text-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-xs text-muted-foreground'>
              Fasilitas cicilan pajak THR sedang dinonaktifkan. Seluruh pemotongan PPh 21 atas THR akan dipotong penuh 100% pada periode pencairan THR.
            </div>
          )}

          <div className='flex justify-end pt-2'>
            <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
              Simpan Konfigurasi Kebijakan
            </Button>
          </div>
        </div>
      </form>

      {/* ── Section 3: Interactive THR Tax & Installment Calculator ──────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <IconCalculator className='size-4.5 text-primary' />
              Simulasi Kalkulator Cicilan Pajak PPh 21 THR
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Coba simulasi perhitungan nominal THR, estimasi pajak TER, dan pembagian cicilan bulanan
            </p>
          </div>
          <Badge variant='outline' className='text-xs bg-primary/5 text-primary border-primary/20 gap-1'>
            <IconSparkles size={13} />
            Simulasi Real-time
          </Badge>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Inputs */}
          <div className='lg:col-span-5 space-y-4 p-4 rounded-xl border border-border/70 bg-muted/20'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Upah Pokok + Tunjangan Tetap (Rp)
              </label>
              <Input
                type='number'
                step={500000}
                value={simBaseWage}
                onChange={(e) => setSimBaseWage(parseInt(e.target.value, 10) || 0)}
                className='h-9 text-xs bg-background rounded-xl'
              />
            </div>

            <div className='space-y-1.5'>
              <div className='flex justify-between items-center text-xs'>
                <span className='font-semibold text-foreground'>Masa Kerja Karyawan</span>
                <span className='font-mono font-bold text-primary'>{simTenureMonths} Bulan</span>
              </div>
              <input
                type='range'
                min={1}
                max={48}
                value={simTenureMonths}
                onChange={(e) => setSimTenureMonths(parseInt(e.target.value, 10))}
                className='w-full accent-primary h-2 rounded-lg bg-muted cursor-pointer'
              />
              <div className='flex justify-between text-[10px] text-muted-foreground'>
                <span>1 Bulan (Prorata)</span>
                <span>12+ Bulan (Penuh 1 Bulan Upah)</span>
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>
                Pilihan Tenor Cicilan
              </label>
              <Select
                value={String(simTenor)}
                onValueChange={(val) => setSimTenor(parseInt(val, 10))}
              >
                <SelectTrigger className='h-9 text-xs bg-background rounded-xl'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>1 Bulan (Langsung Lunas)</SelectItem>
                  <SelectItem value='2'>2 Bulan</SelectItem>
                  <SelectItem value='3'>3 Bulan</SelectItem>
                  <SelectItem value='4'>4 Bulan</SelectItem>
                  <SelectItem value='6'>6 Bulan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Display */}
          <div className='lg:col-span-7 flex flex-col justify-between p-5 rounded-xl border border-border/80 bg-linear-to-br from-card via-card to-primary/5'>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-border/60'>
              <div>
                <p className='text-[11px] text-muted-foreground font-medium'>Nilai Bruto THR</p>
                <p className='text-base font-bold text-foreground mt-0.5'>{formatIDR(simThrAmount)}</p>
                <p className='text-[10px] text-muted-foreground'>
                  {simTenureMonths >= 12 ? '100% Upah Penuh' : `Prorata (${simTenureMonths}/12)`}
                </p>
              </div>

              <div>
                <p className='text-[11px] text-muted-foreground font-medium'>Estimasi Pajak PPh 21 THR</p>
                <p className='text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5'>
                  {formatIDR(simEstimatedTax)}
                </p>
                <p className='text-[10px] text-muted-foreground'>Est. Tarif TER ~{(simTaxRate * 100).toFixed(1)}%</p>
              </div>

              <div>
                <p className='text-[11px] text-muted-foreground font-medium'>Potongan Cicilan / Bulan</p>
                <p className='text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5'>
                  {formatIDR(simMonthlyInstallment)}
                </p>
                <p className='text-[10px] text-muted-foreground'>Selama {simTenor} Bulan</p>
              </div>
            </div>

            {/* Tenor Schedule Flow Preview */}
            <div className='pt-4 space-y-2'>
              <p className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
                Jadwal Alokasi Cicilan pada Slip Gaji:
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
                {Array.from({ length: Math.min(simTenor, 3) }).map((_, idx) => (
                  <div
                    key={idx}
                    className='p-2.5 rounded-lg border border-border/80 bg-background text-xs space-y-1'
                  >
                    <div className='flex justify-between items-center'>
                      <span className='font-bold text-foreground'>Bulan ke-{idx + 1}</span>
                      <Badge variant='outline' className='text-[9px] px-1.5 py-0'>
                        {idx + 1}/{simTenor}
                      </Badge>
                    </div>
                    <p className='text-xs font-semibold text-rose-600 dark:text-rose-400'>
                      -{formatIDR(simMonthlyInstallment)}
                    </p>
                    <p className='text-[9px] text-muted-foreground'>Potongan slip gaji</p>
                  </div>
                ))}
              </div>
              {simTenor > 3 && (
                <p className='text-[10px] text-muted-foreground italic text-right'>
                  + {simTenor - 3} bulan berikutnya dengan nominal yang sama
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Daftar Jadwal Cicilan Pajak Karyawan ─────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-0'>
        <div className='p-6 pb-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <IconCoins className='size-4.5 text-primary' />
              Jadwal Cicilan Pajak THR Karyawan (Active Installments)
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Pantau progres pemotongan cicilan pajak THR per karyawan dan lakukan penyesuaian manual
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2.5'>
            <Button
              onClick={handleOpenAdd}
              size='sm'
              className='gap-1.5 text-xs font-semibold rounded-xl h-9 shadow-xs'
            >
              <IconPlus size={15} />
              Tambah Jadwal Cicilan Manual
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className='p-4 border-b border-border/50 bg-muted/15 flex flex-wrap items-center justify-between gap-3'>
          <div className='relative w-full max-w-xs'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Cari nama karyawan, NIK...'
              className='pl-9 h-8.5 text-xs bg-background rounded-xl'
            />
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground font-medium'>Status:</span>
            <div className='flex items-center gap-1 bg-background p-1 rounded-xl border border-border/80'>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'active', label: 'Aktif' },
                { id: 'completed', label: 'Lunas' },
                { id: 'paused', label: 'Ditunda' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type='button'
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === filter.id
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table of Installment Schedules */}
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/30 text-xs border-b border-border/60 whitespace-nowrap'>
                <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Karyawan</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Total THR</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Total Pajak THR</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Tenor & Periode</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Cicilan / Bulan</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Progres Angsuran</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Sisa Saldo</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Status</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='text-center py-8 text-xs text-muted-foreground'>
                    Tidak ada jadwal cicilan pajak yang sesuai filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((item) => {
                  const percent = Math.min(100, Math.round((item.paidInstallments / item.tenorMonths) * 100))
                  return (
                    <TableRow key={item.id} className='text-xs hover:bg-muted/20 border-b border-border/40 whitespace-nowrap'>
                      <TableCell className='py-3.5 pl-6'>
                        <p className='font-bold text-foreground'>{item.employeeName}</p>
                        <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>
                          {item.employeeCode} · {item.department}
                        </p>
                      </TableCell>
                      <TableCell className='py-3.5 font-medium text-foreground'>
                        {formatIDR(item.totalThrAmount)}
                      </TableCell>
                      <TableCell className='py-3.5 font-bold text-amber-600 dark:text-amber-400'>
                        {formatIDR(item.totalTaxAmount)}
                      </TableCell>
                      <TableCell className='py-3.5'>
                        <p className='font-semibold text-foreground'>{item.tenorMonths} Bulan</p>
                        <p className='text-[10px] text-muted-foreground'>{item.startPeriod} – {item.endPeriod}</p>
                      </TableCell>
                      <TableCell className='py-3.5 font-bold text-foreground'>
                        {formatIDR(item.installmentPerMonth)}
                      </TableCell>
                      <TableCell className='py-3.5 min-w-[140px]'>
                        <div className='space-y-1.5'>
                          <div className='flex justify-between items-center text-[10px]'>
                            <span className='font-semibold text-foreground'>
                              Bulan {item.paidInstallments} dari {item.tenorMonths}
                            </span>
                            <span className='text-muted-foreground font-mono'>{percent}%</span>
                          </div>
                          <Progress value={percent} className='h-1.5' />
                        </div>
                      </TableCell>
                      <TableCell className='py-3.5 font-bold text-rose-600 dark:text-rose-400'>
                        {formatIDR(item.remainingBalance)}
                      </TableCell>
                      <TableCell className='py-3.5'>
                        {item.currentStatus === 'active' && (
                          <Badge variant='blue' className='text-[10px] font-semibold'>
                            Aktif Berjalan
                          </Badge>
                        )}
                        {item.currentStatus === 'completed' && (
                          <Badge variant='outline' className='text-[10px] font-semibold text-emerald-600 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'>
                            Lunas
                          </Badge>
                        )}
                        {item.currentStatus === 'paused' && (
                          <Badge variant='outline' className='text-[10px] font-semibold text-amber-600 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20'>
                            Ditunda
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='py-3.5 pr-6 text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <TableActionButton
                            tooltip='Edit Tenor / Nominal'
                            icon={<IconEdit size={15} />}
                            onClick={() => handleOpenEdit(item)}
                            intent='default'
                          />

                          {item.currentStatus !== 'completed' && (
                            <>
                              <TableActionButton
                                tooltip={item.currentStatus === 'paused' ? 'Lanjutkan Cicilan' : 'Jeda Cicilan Sementara'}
                                icon={item.currentStatus === 'paused' ? <IconPlayerPlay size={15} /> : <IconPlayerPause size={15} />}
                                onClick={() => handleTogglePause(item.id)}
                                intent={item.currentStatus === 'paused' ? 'primary' : 'warning'}
                              />

                              <TableActionButton
                                tooltip='Lunasi Sekaligus'
                                icon={<IconCheck size={15} />}
                                onClick={() => handleSettleFull(item.id)}
                                intent='success'
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Dialog Modal: Add / Edit Installment Schedule ───────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold'>
              {editingItem ? 'Edit Jadwal Cicilan Pajak THR' : 'Tambah Jadwal Cicilan Pajak THR Manual'}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Tentukan parameter cicilan pemotongan PPh 21 atas penerimaan THR untuk karyawan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveModal} className='space-y-4 py-2 text-xs'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground'>Nama Karyawan</label>
                <Input
                  value={modalForm.employeeName}
                  onChange={(e) => setModalForm((p) => ({ ...p, employeeName: e.target.value }))}
                  placeholder='e.g. Rian Wijaya'
                  className='h-9 text-xs rounded-xl'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground'>NIK / Kode Karyawan</label>
                <Input
                  value={modalForm.employeeCode}
                  onChange={(e) => setModalForm((p) => ({ ...p, employeeCode: e.target.value }))}
                  placeholder='e.g. EMP001'
                  className='h-9 text-xs rounded-xl'
                  required
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Departemen</label>
              <Input
                value={modalForm.department}
                onChange={(e) => setModalForm((p) => ({ ...p, department: e.target.value }))}
                placeholder='e.g. IT & Engineering'
                className='h-9 text-xs rounded-xl'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground'>Nominal Bruto THR (Rp)</label>
                <Input
                  type='number'
                  step={500000}
                  value={modalForm.totalThrAmount}
                  onChange={(e) =>
                    setModalForm((p) => ({
                      ...p,
                      totalThrAmount: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className='h-9 text-xs rounded-xl'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground'>Total Pajak PPh 21 THR (Rp)</label>
                <Input
                  type='number'
                  step={50000}
                  value={modalForm.totalTaxAmount}
                  onChange={(e) =>
                    setModalForm((p) => ({
                      ...p,
                      totalTaxAmount: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className='h-9 text-xs rounded-xl'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground'>Tenor Cicilan (Bulan)</label>
                <Select
                  value={String(modalForm.tenorMonths)}
                  onValueChange={(val) =>
                    setModalForm((p) => ({ ...p, tenorMonths: parseInt(val, 10) }))
                  }
                >
                  <SelectTrigger className='h-9 text-xs rounded-xl'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>1 Bulan (Lunas Langsung)</SelectItem>
                    <SelectItem value='2'>2 Bulan</SelectItem>
                    <SelectItem value='3'>3 Bulan (Standar)</SelectItem>
                    <SelectItem value='4'>4 Bulan</SelectItem>
                    <SelectItem value='6'>6 Bulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground'>Periode Mulai Potong</label>
                <Input
                  value={modalForm.startPeriod}
                  onChange={(e) => setModalForm((p) => ({ ...p, startPeriod: e.target.value }))}
                  placeholder='e.g. Juni 2026'
                  className='h-9 text-xs rounded-xl'
                />
              </div>
            </div>

            {/* Calculated Preview Card */}
            <div className='p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs'>
              <div>
                <p className='text-muted-foreground text-[10px] font-medium'>Estimasi Cicilan per Bulan:</p>
                <p className='text-sm font-bold text-primary mt-0.5'>
                  {formatIDR(Math.round(modalForm.totalTaxAmount / (modalForm.tenorMonths || 1)))}
                </p>
              </div>
              <Badge variant='outline' className='text-[10px] bg-background font-mono'>
                {modalForm.tenorMonths}x Pembayaran
              </Badge>
            </div>

            <div className='space-y-1.5'>
              <label className='font-semibold text-foreground'>Catatan Tambahan (Opsional)</label>
              <Input
                value={modalForm.notes}
                onChange={(e) => setModalForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder='Keterangan persetujuan memo internal / kebijakan'
                className='h-9 text-xs rounded-xl'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsModalOpen(false)}
                className='h-9 text-xs rounded-xl'
              >
                Batal
              </Button>
              <Button type='submit' className='h-9 text-xs font-semibold rounded-xl'>
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
