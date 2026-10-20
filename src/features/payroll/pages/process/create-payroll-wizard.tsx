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
import { initialGeneralConfig, initialPph21Config } from '../../data/mock-payroll-data'
import { HQ_LOCATION, initialPayrollEmployeeInputs } from '../../data/mock-payroll-inputs'
import { calculatePayroll } from '../../lib/calculate-payroll'
import { isValidPtkpStatus } from '../../lib/pph21-calc'
import { toPeriodKey, usePayrollBpjsBillingStore } from '../../store/payroll-bpjs-billing-store'
import { usePayrollBpjsStore } from '../../store/payroll-bpjs-store'
import {
  employeeComponentToInputLine,
  getEmployeeComponentKind,
  isAutomaticPayrollComponent,
  isEmployeeComponentEffective,
  usePayrollComponentStore,
} from '../../store/payroll-component-store'
import { useProjects } from '@/features/company/project/data/dummy-projects'
import { usePayrollTaxInputStore } from '../../store/payroll-tax-input-store'
import { usePayrollRunStore } from '../../store/payroll-run-store'
import type { PayrollRun } from '../../types'
import { Button } from '@/shared/components/ui/button'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { FieldLabel } from '@/shared/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'
import 'dayjs/locale/id'
import 'dayjs/locale/en'

interface CreatePayrollWizardProps {
  onCancel: () => void
  onSuccess: (newRun: PayrollRun) => void
}

const getMonthOptions = () => Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: dayjs().locale(getLocale()).month(index).format('MMMM'),
}))

export function CreatePayrollWizard({ onCancel, onSuccess }: CreatePayrollWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Period and Dates
  const [periodMonth, setPeriodMonth] = useState('7')
  const [periodYear, setPeriodYear] = useState('2026')
  const [periodName, setPeriodName] = useState(() => dayjs().locale(getLocale()).month(6).year(2026).format('MMMM YYYY'))
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date(2026, 6, 25))
  const [cutoffStart, setCutoffStart] = useState<Date | undefined>(new Date(2026, 5, 21))
  const [cutoffEnd, setCutoffEnd] = useState<Date | undefined>(new Date(2026, 6, 20))

  // Step 2: Employee Scope
  const [employeeScope, setEmployeeScope] = useState('all')

  // Step 3: Attendance & Overtime Sync
  const [syncAttendance, setSyncAttendance] = useState(true)
  const [syncOvertime, setSyncOvertime] = useState(true)
  const [syncThrTaxInstallment, setSyncThrTaxInstallment] = useState(true)

  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Data pendukung engine: tagihan BPJS Kes periode ini + master BPJS TK + cakupan karyawan
  const periodKey = toPeriodKey(periodYear, periodMonth)
  const billingUpload = usePayrollBpjsBillingStore((s) => s.uploads[periodKey])
  const bpjsTkConfig = usePayrollBpjsStore((s) => s.bpjsTkConfig)
  const bpjsKesConfig = usePayrollBpjsStore((s) => s.bpjsKesConfig)
  const tkProjectSettings = usePayrollBpjsStore((s) => s.tkProjectSettings)
  const wageCapRules = usePayrollBpjsStore((s) => s.wageCapRules)
  const setRunResult = usePayrollRunStore((s) => s.setRunResult)
  const employeeComponents = usePayrollComponentStore((s) => s.employeeComponents)
  const taxYearToDateOverrides = usePayrollTaxInputStore((s) => s.taxYearToDateOverrides)
  const applyPayrollPeriod = usePayrollComponentStore((s) => s.applyPayrollPeriod)
  const projects = useProjects()

  const hqCount = initialPayrollEmployeeInputs.filter((e) => e.workLocation === HQ_LOCATION).length
  const allCount = initialPayrollEmployeeInputs.length
  const branchCount = allCount - hqCount
  const scopeEmployees = initialPayrollEmployeeInputs.filter((e) =>
    employeeScope === 'all'
      ? true
      : employeeScope === 'hq'
        ? e.workLocation === HQ_LOCATION
        : e.workLocation !== HQ_LOCATION,
  )

  const handleMonthChange = (newMonth: string) => {
    setPeriodMonth(newMonth)
    const monthObj = getMonthOptions().find((month) => month.value === newMonth)
    const mName = monthObj ? monthObj.label : dayjs().locale(getLocale()).month(6).format('MMMM')
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
    const monthObj = getMonthOptions().find((month) => month.value === periodMonth)
    const mName = monthObj ? monthObj.label : dayjs().locale(getLocale()).month(6).format('MMMM')
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
        snackbar.error(m.payroll_wizard_dates_required())
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
      // Opsi sinkronisasi presensi/lembur menentukan komponen otomatis yang ikut dihitung
      const automaticComponents = employeeComponents.filter(
        (component) =>
          scopeEmployees.some((employee) => employee.employeeId === component.employeeId) &&
          isEmployeeComponentEffective(component, periodKey) &&
          isAutomaticPayrollComponent(component),
      )
      if (automaticComponents.length > 0) {
        snackbar.info(m.payroll_wizard_automatic_components_skipped({ count: automaticComponents.length }))
      }
      const employees = scopeEmployees.map((emp) => {
        const applicableComponents = employeeComponents.filter(
          (component) =>
            component.employeeId === emp.employeeId &&
            isEmployeeComponentEffective(component, periodKey) &&
            !isAutomaticPayrollComponent(component),
        )
        return {
          ...emp,
          taxYearToDate:
            taxYearToDateOverrides[`${periodYear}:${emp.employeeId}`] ??
            (periodYear === '2026' ? emp.taxYearToDate : undefined),
          fixedComponents: [
            ...emp.fixedComponents,
            ...applicableComponents
              .filter((component) => getEmployeeComponentKind(component) === 'fixed_allowance')
              .map(employeeComponentToInputLine),
          ],
          variableComponents: [
            ...emp.variableComponents,
            ...applicableComponents
              .filter((component) => getEmployeeComponentKind(component) !== 'fixed_allowance')
              .map(employeeComponentToInputLine),
          ],
          attendance: {
            ...emp.attendance,
            lateCount: syncAttendance ? emp.attendance.lateCount : 0,
            absentCount: syncAttendance ? emp.attendance.absentCount : 0,
            overtimeHours: syncOvertime ? emp.attendance.overtimeHours : 0,
          },
        }
      })

      const invalidPtkpCount = employees.filter(
        (employee) => !isValidPtkpStatus(employee.ptkpStatus),
      ).length
      if (invalidPtkpCount > 0) {
        setIsCalculating(false)
        snackbar.error(m.payroll_wizard_invalid_ptkp({ count: invalidPtkpCount }))
        return
      }

      const periodMonthNumber = Number(periodMonth)
      const missingFinalTaxInputs = employees.filter((employee) => {
        if (periodMonthNumber !== 12 && !employee.taxYearToDate?.isFinalTaxPeriod) return false
        const yearToDate = employee.taxYearToDate
        return (
          !yearToDate ||
          yearToDate.verified === false ||
          yearToDate.monthsWorked < 1 ||
          yearToDate.monthsWorked > periodMonthNumber ||
          [
            yearToDate.priorTaxableGross,
            yearToDate.priorEmployeePensionContributions,
            yearToDate.priorQualifiedZakat,
            yearToDate.priorPph21Paid,
          ].some((value) => !Number.isFinite(value) || value < 0)
        )
      })
      if (missingFinalTaxInputs.length > 0) {
        setIsCalculating(false)
        snackbar.error(m.payroll_wizard_final_tax_missing({ count: missingFinalTaxInputs.length }))
        return
      }

      const projectAttendancePolicies = Object.fromEntries(
        projects
          .filter((p) => p.attendancePolicy)
          .map((p) => [p.id, p.attendancePolicy!]),
      )

      const result = calculatePayroll({
        employees,
        billing: billingUpload?.records ?? [],
        bpjsKesConfig,
        bpjsTkConfig,
        tkProjectSettings,
        wageCapRules,
        periodKey,
        pph21Config: initialPph21Config,
        generalConfig: initialGeneralConfig,
        includeThrInstallment: syncThrTaxInstallment,
        projectAttendancePolicies,
      })

      setIsCalculating(false)
      setConfirmModalOpen(false)

      const formattedPaymentDate = paymentDate ? dayjs(paymentDate).format('DD MMM YYYY') : '25 Jul 2026'
      const formattedCutoffStart = cutoffStart ? dayjs(cutoffStart).format('DD MMM YYYY') : '21 Jun 2026'
      const formattedCutoffEnd = cutoffEnd ? dayjs(cutoffEnd).format('DD MMM YYYY') : '20 Jul 2026'

      const runId = `pay-run-${Date.now()}`
      const { summary } = result
      const createdRun: PayrollRun = {
        id: runId,
        code: `PR-${Date.now().toString().slice(-6)}`,
        period: periodName,
        periodMonth: parseInt(periodMonth, 10),
        periodYear: parseInt(periodYear, 10),
        cutoffStartDate: formattedCutoffStart,
        cutoffEndDate: formattedCutoffEnd,
        paymentDate: formattedPaymentDate,
        totalEmployees: summary.employeeCount,
        totalGrossPay: summary.totalGross,
        totalAllowances: summary.totalAllowances,
        totalDeductions: summary.totalDeductions,
        totalTaxPPh21: summary.totalTaxPPh21,
        totalBpjsTK: summary.totalBpjsTK,
        totalBpjsKes: summary.totalBpjsKes,
        totalNetDisbursement: summary.totalNet,
        status: 'draft',
        attendanceSynced: syncAttendance,
        approvalStage: 'hr_review',
        notes: m.payroll_wizard_created_note({ period: periodName }),
      }

      // Simpan rincian per karyawan agar halaman detail menampilkan hasil kalkulasi yang sebenarnya
      setRunResult(runId, {
        details: result.details,
        unmatchedBilling: result.unmatchedBilling,
      })
      applyPayrollPeriod(periodKey, employees.map((employee) => employee.employeeId))

      onSuccess(createdRun)
      if (summary.warningCount > 0 || result.unmatchedBilling.length > 0) {
        snackbar.warning(
          m.payroll_wizard_warning({ employees: summary.warningCount, bills: result.unmatchedBilling.length }),
        )
      } else {
        snackbar.success(m.payroll_wizard_success())
      }
    }, 600)
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      {/* ── Step Indicator ─────────────────────────────────────────────────── */}
      <div className='grid grid-cols-3 gap-3'>
        {[
          { num: 1, label: m.payroll_wizard_step_period(), icon: IconCalendarEvent },
          { num: 2, label: m.payroll_wizard_step_scope(), icon: IconUsers },
          { num: 3, label: m.payroll_wizard_step_sync(), icon: IconClockCheck },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${step === s.num
                ? 'border-primary bg-primary/5 text-primary shadow-xs'
                : step > s.num
                  ? 'border-emerald-500/50 bg-emerald-50/40 text-emerald-600 dark:bg-emerald-950/20'
                  : 'border-border/70 bg-card text-muted-foreground'
              }`}
          >
            <div
              className={`flex size-9 items-center justify-center rounded-xl font-bold text-xs ${step > s.num
                  ? 'bg-emerald-600 text-white'
                  : step === s.num
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground'
                }`}
            >
              {step > s.num ? <IconCheck size={16} /> : s.num}
            </div>
            <div>
              <p className='text-[10px] uppercase font-bold tracking-wider opacity-80'>{m.payroll_wizard_step_number({ number: s.num })}</p>
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
              <h3 className='text-sm font-bold text-foreground'>{m.payroll_wizard_period_title()}</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {m.payroll_wizard_period_description()}
              </p>
            </div>

            {/* Quick Month & Year Selection Bar */}
            <div className='p-4 rounded-2xl border border-border/70 bg-muted/20 space-y-3'>
              <div className='flex items-center gap-2 text-xs font-bold text-foreground'>
                <IconCalendar size={16} className='text-primary' />
                <span>{m.payroll_wizard_select_month_year()}</span>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='space-y-1'>
                  <span className='text-[11px] font-medium text-muted-foreground'>{m.payroll_wizard_payroll_month()}</span>
                  <Select value={periodMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl shadow-xs'>
                      <SelectValue placeholder={m.payroll_wizard_select_month()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                      {getMonthOptions().map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1'>
                  <span className='text-[11px] font-medium text-muted-foreground'>{m.payroll_wizard_year()}</span>
                  <Select value={periodYear} onValueChange={handleYearChange}>
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl shadow-xs'>
                      <SelectValue placeholder={m.payroll_wizard_select_year()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                      {['2025', '2026', '2027', '2028'].map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1'>
                  <span className='text-[11px] font-medium text-muted-foreground'>{m.payroll_wizard_period_name()}</span>
                  <Input
                    value={periodName}
                    onChange={(e) => setPeriodName(e.target.value)}
                    placeholder={m.payroll_wizard_period_example()}
                    className='h-9.5 text-xs bg-background rounded-xl font-semibold shadow-xs'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Calendar Date Pickers Grid */}
            <div className='space-y-4'>
              <h4 className='text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground'>
                {m.payroll_wizard_date_configuration()}
              </h4>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {/* 1. Payment Date */}
                <div className='space-y-1.5'>
                  <FieldLabel className='text-xs font-semibold text-foreground flex items-center justify-between'>
                    <span>{m.payroll_wizard_payment_date()}</span>
                  </FieldLabel>
                  <DatePicker
                    mode='single'
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    placeholder={m.payroll_wizard_select_payment_date()}
                    className='w-full h-10 text-xs rounded-xl bg-background justify-start shadow-xs font-medium'
                  />
                  <p className='text-[10px] text-muted-foreground'>{m.payroll_wizard_payment_hint()}</p>
                </div>

                {/* 2. Cut-off Start Date */}
                <div className='space-y-1.5'>
                  <FieldLabel className='text-xs font-semibold text-foreground flex items-center justify-between'>
                    <span>{m.payroll_wizard_cutoff_start()}</span>
                  </FieldLabel>
                  <DatePicker
                    mode='single'
                    selected={cutoffStart}
                    onSelect={setCutoffStart}
                    placeholder={m.payroll_wizard_select_cutoff_start()}
                    className='w-full h-10 text-xs rounded-xl bg-background justify-start shadow-xs font-medium'
                  />
                  <p className='text-[10px] text-muted-foreground'>{m.payroll_wizard_cutoff_start_hint()}</p>
                </div>

                {/* 3. Cut-off End Date */}
                <div className='space-y-1.5'>
                  <FieldLabel className='text-xs font-semibold text-foreground flex items-center justify-between'>
                    <span>{m.payroll_wizard_cutoff_end()}</span>
                  </FieldLabel>
                  <DatePicker
                    mode='single'
                    selected={cutoffEnd}
                    onSelect={setCutoffEnd}
                    placeholder={m.payroll_wizard_select_cutoff_end()}
                    className='w-full h-10 text-xs rounded-xl bg-background justify-start shadow-xs font-medium'
                  />
                  <p className='text-[10px] text-muted-foreground'>{m.payroll_wizard_cutoff_end_hint()}</p>
                </div>
              </div>
            </div>

            {/* Cycle Preview Info Banner */}
            <div className='p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-3 text-xs'>
              <IconInfoCircle className='size-5 text-primary shrink-0 mt-0.5' />
              <div className='space-y-1'>
                <p className='font-bold text-foreground'>
                  {m.payroll_wizard_cycle_summary()} <span className='text-primary'>{periodName}</span>
                </p>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  {m.payroll_wizard_cycle_from()}{' '}
                  <strong className='text-foreground'>
                    {cutoffStart ? dayjs(cutoffStart).locale(getLocale()).format('DD MMM YYYY') : '-'}
                  </strong>{' '}
                  {m.payroll_wizard_cycle_to()}{' '}
                  <strong className='text-foreground'>
                    {cutoffEnd ? dayjs(cutoffEnd).locale(getLocale()).format('DD MMM YYYY') : '-'}
                  </strong>
                  {m.payroll_wizard_cycle_payment()}{' '}
                  <strong className='text-primary'>
                    {paymentDate ? dayjs(paymentDate).locale(getLocale()).format('DD MMMM YYYY') : '-'}
                  </strong>
                  {'.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Employee Scope ── */}
        {step === 2 && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>{m.payroll_wizard_scope_title()}</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {m.payroll_wizard_scope_description()}
              </p>
            </div>

            <RadioGroup value={employeeScope} onValueChange={setEmployeeScope} className='gap-4'>
              {[
                {
                  id: 'all',
                  title: m.payroll_wizard_scope_all({ count: allCount }),
                  desc: m.payroll_wizard_scope_all_hint(),
                },
                {
                  id: 'hq',
                  title: m.payroll_wizard_scope_hq({ location: HQ_LOCATION, count: hqCount }),
                  desc: m.payroll_wizard_scope_hq_hint(),
                },
                {
                  id: 'branches',
                  title: m.payroll_wizard_scope_branches({ count: branchCount }),
                  desc: m.payroll_wizard_scope_branches_hint(),
                },
              ].map((opt) => (
                <FieldLabel
                  key={opt.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${employeeScope === opt.id
                      ? 'border-primary bg-primary/5 text-foreground shadow-xs'
                      : 'border-border/70 bg-background hover:bg-muted/30 text-muted-foreground'
                    }`}
                >
                  <RadioGroupItem value={opt.id} className='mt-1' />
                  <div>
                    <h5 className='text-xs font-bold text-foreground'>{opt.title}</h5>
                    <p className='text-[11px] text-muted-foreground mt-0.5'>{opt.desc}</p>
                  </div>
                </FieldLabel>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* ── STEP 3: Attendance Sync ── */}
        {step === 3 && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-bold text-foreground'>{m.payroll_wizard_sync_title()}</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {m.payroll_wizard_sync_description()}
              </p>
            </div>

            <div className='space-y-3.5'>
              <FieldLabel className='p-4 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors'>
                <div>
                  <h5 className='text-xs font-bold text-foreground'>{m.payroll_wizard_sync_attendance()}</h5>
                  <p className='text-[11px] text-muted-foreground mt-0.5'>
                    {m.payroll_wizard_sync_attendance_hint()}
                  </p>
                </div>
                <Checkbox
                  checked={syncAttendance}
                  onCheckedChange={(checked) => setSyncAttendance(checked === true)}
                />
              </FieldLabel>

              <FieldLabel className='p-4 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors'>
                <div>
                  <h5 className='text-xs font-bold text-foreground'>{m.payroll_wizard_sync_overtime()}</h5>
                  <p className='text-[11px] text-muted-foreground mt-0.5'>
                    {m.payroll_wizard_sync_overtime_hint()}
                  </p>
                </div>
                <Checkbox
                  checked={syncOvertime}
                  onCheckedChange={(checked) => setSyncOvertime(checked === true)}
                />
              </FieldLabel>

              <FieldLabel className='p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors'>
                <div>
                  <div className='flex items-center gap-2'>
                    <h5 className='text-xs font-bold text-foreground'>{m.payroll_wizard_sync_thr()}</h5>
                    <span className='px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20'>
                      {m.payroll_wizard_recommended()}
                    </span>
                  </div>
                  <p className='text-[11px] text-muted-foreground mt-0.5'>
                    {m.payroll_wizard_sync_thr_hint()}
                  </p>
                </div>
                <Checkbox
                  checked={syncThrTaxInstallment}
                  onCheckedChange={(checked) => setSyncThrTaxInstallment(checked === true)}
                />
              </FieldLabel>
            </div>

            <div className='p-4 rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300'>
              <p className='font-bold flex items-center gap-1.5'>
                <IconCalculator size={16} />
                {m.payroll_wizard_ready_title()}
              </p>
              <p className='mt-1 text-[11px] opacity-90 leading-relaxed'>
                {m.payroll_wizard_ready_description()}
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
            {step === 1 ? m.payroll_wizard_cancel() : m.payroll_wizard_previous()}
          </Button>

          <Button
            type='button'
            onClick={handleNextStep}
            className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'
          >
            {step === 3 ? m.payroll_wizard_run() : m.payroll_wizard_next()}
          </Button>
        </div>
      </div>

      {/* ── Screen 12: Confirmation Modal ─────────────────────────────────── */}
      <CalculationConfirmationModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        periodName={periodName}
        employeeCount={scopeEmployees.length}
        onConfirm={handleConfirmCalculation}
        isProcessing={isCalculating}
      />
    </div>
  )
}
