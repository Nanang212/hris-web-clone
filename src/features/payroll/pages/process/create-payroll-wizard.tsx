// src/features/payroll/pages/process/create-payroll-wizard.tsx — Screens 10 & 12: Create Payroll Run Wizard & Modal
import {
  IconCalendarEvent,
  IconUsers,
  IconClockCheck,
  IconCalculator,
  IconCheck,
} from '@tabler/icons-react'
import { useState } from 'react'
import { CalculationConfirmationModal } from '../../components/confirmation-modal'
import { formatIDR } from '../../data/mock-payroll-data'
import type { PayrollRun } from '../../types'
import { Button } from '@/shared/components/ui/button'
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

export function CreatePayrollWizard({ onCancel, onSuccess }: CreatePayrollWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [period, setPeriod] = useState('July 2026')
  const [cutoffStart, setCutoffStart] = useState('21 Jun 2026')
  const [cutoffEnd, setCutoffEnd] = useState('20 Jul 2026')
  const [paymentDate, setPaymentDate] = useState('25 Jul 2026')
  const [employeeScope, setEmployeeScope] = useState('all')
  const [syncAttendance, setSyncAttendance] = useState(true)
  const [syncOvertime, setSyncOvertime] = useState(true)

  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleNextStep = () => {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
    else {
      setConfirmModalOpen(true)
    }
  }

  const handleConfirmCalculation = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
      setConfirmModalOpen(false)

      const createdRun: PayrollRun = {
        id: `pay-run-${Date.now()}`,
        code: `PR-${Date.now().toString().slice(-6)}`,
        period,
        periodMonth: 7,
        periodYear: 2026,
        cutoffStartDate: cutoffStart,
        cutoffEndDate: cutoffEnd,
        paymentDate,
        totalEmployees: 1152,
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
        notes: `Payroll batch created for ${period}.`,
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
                ? 'border-primary bg-primary/5 text-primary'
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
                    ? 'bg-primary text-primary-foreground'
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
        {step === 1 && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>Select Payroll Period & Cut-off Cycle</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Tentukan bulan periode penggajian dan rentang tanggal cut-off presensi
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Payroll Period Name *</label>
                <Input
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder='e.g. July 2026'
                  className='h-10 text-xs bg-background rounded-xl'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Payment Date (Tanggal Gajian) *</label>
                <Input
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  placeholder='25 Jul 2026'
                  className='h-10 text-xs bg-background rounded-xl'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Cut-off Start Date *</label>
                <Input
                  value={cutoffStart}
                  onChange={(e) => setCutoffStart(e.target.value)}
                  placeholder='21 Jun 2026'
                  className='h-10 text-xs bg-background rounded-xl'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground'>Cut-off End Date *</label>
                <Input
                  value={cutoffEnd}
                  onChange={(e) => setCutoffEnd(e.target.value)}
                  placeholder='20 Jul 2026'
                  className='h-10 text-xs bg-background rounded-xl'
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>Employee Scope Selection</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Pilih karyawan yang akan diproses dalam batch penggajian ini
              </p>
            </div>

            <div className='space-y-4'>
              {[
                { id: 'all', title: 'All Active Employees (1,152 Karyawan)', desc: 'Seluruh karyawan tetap, kontrak, dan probation di semua kantor cabang' },
                { id: 'hq', title: 'Jakarta HQ Only (842 Karyawan)', desc: 'Khusus karyawan penempatan kantor pusat Jakarta' },
                { id: 'branches', title: 'Branch Offices (Bandung & Surabaya: 310 Karyawan)', desc: 'Khusus kantor cabang non-pusat' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-colors ${
                    employeeScope === opt.id
                      ? 'border-primary bg-primary/5 text-foreground'
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

        {step === 3 && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>Attendance & Overtime Sync</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Sinkronisasi data kehadiran, keterlambatan, dan jam lembur yang telah diapprove
              </p>
            </div>

            <div className='space-y-3.5'>
              <label className='p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between cursor-pointer'>
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

              <label className='p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between cursor-pointer'>
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

            <div className='p-4 rounded-xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300'>
              <p className='font-bold flex items-center gap-1.5'>
                <IconCalculator size={16} />
                Siap Melakukan Kalkulasi Otomatis
              </p>
              <p className='mt-1 text-[11px] opacity-90 leading-relaxed'>
                Setelah mengklik tombol di bawah, sistem HRIS akan menghitung otomatis Gaji Pokok, Tunjangan, BPJS TK, BPJS Kes, dan PPh 21 TER untuk setiap karyawan.
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
        periodName={period}
        employeeCount={1152}
        onConfirm={handleConfirmCalculation}
        isProcessing={isCalculating}
      />
    </div>
  )
}
