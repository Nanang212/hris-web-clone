// src/features/payroll/pages/process/create-payroll-wizard.tsx — Screens 10 & 12: Create Payroll Run Wizard & Modal
import {
  IconCalendarEvent,
  IconUsers,
  IconClockCheck,
  IconCalculator,
  IconCheck,
  IconCalendar,
  IconInfoCircle,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'
import { CalculationConfirmationModal } from '../../components/confirmation-modal'
import type { PayrollRun } from '../../types'
import { Button } from '@/shared/components/ui/button'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

interface CreatePayrollWizardProps {
  onCancel: () => void
  onSuccess: (newRun: PayrollRun) => void
}

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

export function CreatePayrollWizard({ onCancel, onSuccess }: CreatePayrollWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Period and Dates
  const [periodMonth, setPeriodMonth] = useState('7')
  const [periodYear, setPeriodYear] = useState('2026')
  const [periodName, setPeriodName] = useState('July 2026')
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date(2026, 6, 25))
  const [cutoffStart, setCutoffStart] = useState<Date | undefined>(new Date(2026, 5, 21))
  const [cutoffEnd, setCutoffEnd] = useState<Date | undefined>(new Date(2026, 6, 20))

  // Step 2: Employee Scope
  const [employeeScope, setEmployeeScope] = useState('all')

  // Step 3: Attendance & Overtime Sync
  const [syncAttendance, setSyncAttendance] = useState(true)
  const [syncOvertime, setSyncOvertime] = useState(true)

  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleMonthChange = (newMonth: string) => {
    setPeriodMonth(newMonth)
    const monthObj = MONTH_OPTIONS.find((m) => m.value === newMonth)
    const mName = monthObj ? monthObj.label : 'July'
    const generatedPeriod = `${mName} ${periodYear}`
    setPeriodName(generatedPeriod)

    const mIndex = parseInt(newMonth, 10) - 1
    const yr = parseInt(periodYear, 10)
    setPaymentDate(new Date(yr, mIndex, 25))
    setCutoffStart(new Date(yr, mIndex - 1, 21))
    setCutoffEnd(new Date(yr, mIndex, 20))
  }

  const handleYearChange = (newYear: string) => {
    setPeriodYear(newYear)
    const monthObj = MONTH_OPTIONS.find((m) => m.value === periodMonth)
    const mName = monthObj ? monthObj.label : 'July'
    const generatedPeriod = `${mName} ${newYear}`
    setPeriodName(generatedPeriod)

    const mIndex = parseInt(periodMonth, 10) - 1
    const yr = parseInt(newYear, 10)
    setPaymentDate(new Date(yr, mIndex, 25))
    setCutoffStart(new Date(yr, mIndex - 1, 21))
    setCutoffEnd(new Date(yr, mIndex, 20))
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!paymentDate || !cutoffStart || !cutoffEnd) {
        snackbar.error('Mohon lengkapi semua tanggal cut-off dan tanggal pembayaran gaji.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else {
      setConfirmModalOpen(true)
    }
  }

  const handleConfirmCalculation = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
      setConfirmModalOpen(false)

      const formattedPaymentDate = paymentDate ? dayjs(paymentDate).format('DD MMM YYYY') : '25 Jul 2026'
      const formattedCutoffStart = cutoffStart ? dayjs(cutoffStart).format('DD MMM YYYY') : '21 Jun 2026'
      const formattedCutoffEnd = cutoffEnd ? dayjs(cutoffEnd).format('DD MMM YYYY') : '20 Jul 2026'

      const createdRun: PayrollRun = {
        id: `pay-run-${Date.now()}`,
        code: `PR-${Date.now().toString().slice(-6)}`,
        period: periodName,
        periodMonth: parseInt(periodMonth, 10),
        periodYear: parseInt(periodYear, 10),
        cutoffStartDate: formattedCutoffStart,
        cutoffEndDate: formattedCutoffEnd,
        paymentDate: formattedPaymentDate,
        totalEmployees: employeeScope === 'all' ? 1152 : employeeScope === 'hq' ? 842 : 310,
        totalGrossPay: 4310000000,
        totalAllowances: 860000000,
        totalDeductions: 525000000,
        totalTaxPPh21: 224000000,
        totalBpjsTK: 152000000,
        totalBpjsKes: 52500000,
        totalNetDisbursement: 3785000000,
        status: 'draft',
        attendanceSynced: syncAttendance,
        approvalStage: 'hr_review',
        notes: `Payroll batch created for ${periodName}.`,
      }

      onSuccess(createdRun)
      snackbar.success('Payroll batch calculated successfully!')
    }, 1200)
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      {/* ── Step Indicator ─────────────────────────────────────────────────── */}
      <div className='grid grid-cols-3 gap-3'>
        {[
          { num: 1, label: 'Period & Cut-off', icon: IconCalendarEvent },
          { num: 2, label: 'Employee Scope', icon: IconUsers },
          { num: 3, label: 'Attendance Sync', icon: IconClockCheck },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
              step === s.num
                ? 'border-primary bg-primary/5 text-primary shadow-xs'
                : step > s.num
                  ? 'border-emerald-500/50 bg-emerald-50/40 text-emerald-600 dark:bg-emerald-950/20'
                  : 'border-border/70 bg-card text-muted-foreground'
            }`}
          >
            <div
              className={`flex size-9 items-center justify-center rounded-xl font-bold text-xs ${
                step > s.num
                  ? 'bg-emerald-600 text-white'
                  : step === s.num
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s.num ? <IconCheck size={16} /> : s.num}
            </div>
            <div>
              <p className='text-[10px] uppercase font-bold tracking-wider opacity-80'>Step 0{s.num}</p>
              <h5 className='text-xs font-bold'>{s.label}</h5>
            </div>
          </div>
        ))}
      </div>

      {/* ── Step Form Contents ─────────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-7 shadow-xs space-y-6'>
        {/* ── STEP 1: Period & Date Pickers ── */}
        {step === 1 && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>Select Payroll Period & Cut-off Cycle</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Tentukan bulan periode penggajian, tanggal gajian, dan rentang tanggal cut-off presensi karyawan
              </p>
            </div>

            {/* Quick Month & Year Selection Bar */}
            <div className='p-4 rounded-2xl border border-border/70 bg-muted/20 space-y-3'>
              <div className='flex items-center gap-2 text-xs font-bold text-foreground'>
                <IconCalendar size={16} className='text-primary' />
                <span>Pilih Bulan & Tahun Periode</span>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='space-y-1'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Bulan Gaji</span>
                  <Select value={periodMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl shadow-xs'>
                      <SelectValue placeholder='Pilih Bulan' />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_OPTIONS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Tahun</span>
                  <Select value={periodYear} onValueChange={handleYearChange}>
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl shadow-xs'>
                      <SelectValue placeholder='Pilih Tahun' />
                    </SelectTrigger>
                    <SelectContent>
                      {['2025', '2026', '2027', '2028'].map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1'>
                  <span className='text-[11px] font-medium text-muted-foreground'>Label Batch / Period Name *</span>
                  <Input
                    value={periodName}
                    onChange={(e) => setPeriodName(e.target.value)}
                    placeholder='e.g. July 2026'
                    className='h-9.5 text-xs bg-background rounded-xl font-semibold shadow-xs'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Calendar Date Pickers Grid */}
            <div className='space-y-4'>
              <h4 className='text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground'>
                Konfigurasi Tanggal dengan Kalender
              </h4>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {/* 1. Payment Date */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground flex items-center justify-between'>
                    <span>Tanggal Gajian (Payment Date) *</span>
                  </label>
                  <DatePicker
                    mode='single'
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    placeholder='Pilih Tanggal Gajian...'
                    className='w-full h-10 text-xs rounded-xl bg-background justify-start shadow-xs font-medium'
                  />
                  <p className='text-[10px] text-muted-foreground'>Tanggal transfer gaji ke rekening karyawan</p>
                </div>

                {/* 2. Cut-off Start Date */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground flex items-center justify-between'>
                    <span>Cut-off Start Date *</span>
                  </label>
                  <DatePicker
                    mode='single'
                    selected={cutoffStart}
                    onSelect={setCutoffStart}
                    placeholder='Pilih Mulai Cut-off...'
                    className='w-full h-10 text-xs rounded-xl bg-background justify-start shadow-xs font-medium'
                  />
                  <p className='text-[10px] text-muted-foreground'>Awal perhitungan absensi & lembur</p>
                </div>

                {/* 3. Cut-off End Date */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-foreground flex items-center justify-between'>
                    <span>Cut-off End Date *</span>
                  </label>
                  <DatePicker
                    mode='single'
                    selected={cutoffEnd}
                    onSelect={setCutoffEnd}
                    placeholder='Pilih Akhir Cut-off...'
                    className='w-full h-10 text-xs rounded-xl bg-background justify-start shadow-xs font-medium'
                  />
                  <p className='text-[10px] text-muted-foreground'>Akhir periode perhitungan kehadiran</p>
                </div>
              </div>
            </div>

            {/* Cycle Preview Info Banner */}
            <div className='p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-3 text-xs'>
              <IconInfoCircle className='size-5 text-primary shrink-0 mt-0.5' />
              <div className='space-y-1'>
                <p className='font-bold text-foreground'>
                  Ringkasan Siklus Penggajian: <span className='text-primary'>{periodName}</span>
                </p>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  Data presensi, cuti tanpa bayar, dan lembur akan ditarik dari rentang{' '}
                  <strong className='text-foreground'>
                    {cutoffStart ? dayjs(cutoffStart).format('DD MMM YYYY') : '-'}
                  </strong>{' '}
                  sampai{' '}
                  <strong className='text-foreground'>
                    {cutoffEnd ? dayjs(cutoffEnd).format('DD MMM YYYY') : '-'}
                  </strong>
                  . Pembayaran dijadwalkan pada{' '}
                  <strong className='text-primary'>
                    {paymentDate ? dayjs(paymentDate).format('DD MMMM YYYY') : '-'}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Employee Scope ── */}
        {step === 2 && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>Employee Scope Selection</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Pilih cakupan karyawan yang akan diproses dalam batch penggajian ini
              </p>
            </div>

            <div className='space-y-4'>
              {[
                {
                  id: 'all',
                  title: 'All Active Employees (1,152 Karyawan)',
                  desc: 'Seluruh karyawan tetap, kontrak, dan probation di semua divisi & kantor cabang',
                },
                {
                  id: 'hq',
                  title: 'Jakarta HQ Only (842 Karyawan)',
                  desc: 'Khusus karyawan dengan lokasi penempatan kantor pusat Jakarta SCBD',
                },
                {
                  id: 'branches',
                  title: 'Branch Offices (Bandung & Surabaya: 310 Karyawan)',
                  desc: 'Khusus karyawan operasional kantor cabang non-pusat',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    employeeScope === opt.id
                      ? 'border-primary bg-primary/5 text-foreground shadow-xs'
                      : 'border-border/70 bg-background hover:bg-muted/30 text-muted-foreground'
                  }`}
                >
                  <input
                    type='radio'
                    name='scope'
                    checked={employeeScope === opt.id}
                    onChange={() => setEmployeeScope(opt.id)}
                    className='mt-1 size-4 accent-primary'
                  />
                  <div>
                    <h5 className='text-xs font-bold text-foreground'>{opt.title}</h5>
                    <p className='text-[11px] text-muted-foreground mt-0.5'>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: Attendance Sync ── */}
        {step === 3 && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>Attendance & Overtime Sync</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Sinkronisasi data kehadiran, keterlambatan, dan jam lembur yang telah disetujui atasan
              </p>
            </div>

            <div className='space-y-3.5'>
              <label className='p-4 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors'>
                <div>
                  <h5 className='text-xs font-bold text-foreground'>Sync Attendance & Leaves</h5>
                  <p className='text-[11px] text-muted-foreground mt-0.5'>
                    Tarik otomatis potongan izin tanpa bayar (Unpaid Leave) dan denda keterlambatan
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={syncAttendance}
                  onChange={(e) => setSyncAttendance(e.target.checked)}
                  className='size-4 accent-primary rounded'
                />
              </label>

              <label className='p-4 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors'>
                <div>
                  <h5 className='text-xs font-bold text-foreground'>Sync Approved Overtime Hours</h5>
                  <p className='text-[11px] text-muted-foreground mt-0.5'>
                    Kalkulasi otomatis upah lembur resmi berdasarkan pengajuan lembur yang disetujui atasan
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={syncOvertime}
                  onChange={(e) => setSyncOvertime(e.target.checked)}
                  className='size-4 accent-primary rounded'
                />
              </label>
            </div>

            <div className='p-4 rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300'>
              <p className='font-bold flex items-center gap-1.5'>
                <IconCalculator size={16} />
                Siap Melakukan Kalkulasi Otomatis
              </p>
              <p className='mt-1 text-[11px] opacity-90 leading-relaxed'>
                Setelah mengklik tombol di bawah, sistem HRIS akan menghitung otomatis Gaji Pokok, Tunjangan, BPJS TK, BPJS Kes, dan PPh 21 skema tarif efektif (TER) untuk seluruh karyawan yang dipilih.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Footer Actions */}
        <div className='flex items-center justify-between pt-5 border-t border-border/70'>
          <Button
            type='button'
            variant='outline'
            onClick={step === 1 ? onCancel : () => setStep((prev) => (prev - 1) as 1 | 2)}
            className='h-9.5 px-5 text-xs font-semibold rounded-xl'
          >
            {step === 1 ? 'Cancel' : 'Previous Step'}
          </Button>

          <Button
            type='button'
            onClick={handleNextStep}
            className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'
          >
            {step === 3 ? 'Run Calculation' : 'Next Step'}
          </Button>
        </div>
      </div>

      {/* ── Screen 12: Confirmation Modal ─────────────────────────────────── */}
      <CalculationConfirmationModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        periodName={periodName}
        employeeCount={employeeScope === 'all' ? 1152 : employeeScope === 'hq' ? 842 : 310}
        onConfirm={handleConfirmCalculation}
        isProcessing={isCalculating}
      />
    </div>
  )
}
