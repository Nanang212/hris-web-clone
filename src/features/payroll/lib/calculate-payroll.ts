// src/features/payroll/lib/calculate-payroll.ts
// Engine kalkulasi payroll bulanan (fungsi murni, tanpa efek samping / tanpa akses store).
//
// Alur (sesuai kebutuhan proses):
//  5. Jumlahkan pendapatan tetap + variabel; potongan tetap & variabel direkap terpisah.
//  6. BPJS Kes   → dari tagihan upload: Upah BPJS × % master. Karyawan (1%) + pot. keluarga tambahan
//                  memotong THP; bagian perusahaan (4%) menambah dasar pajak. Tagihan belum ada → ditandai.
//  7. BPJS TK    → setting per project: JKK (tarif per project) & JKM wajib; JHT/JP hanya bila project ikut.
//                  Hanya JHT 2% & JP 1% karyawan yang mengurangi THP; porsi perusahaan tetap dihitung.
//  8. PPh 21     → dasar pengenaan mengikuti flag `isTaxable` tiap komponen (+ bagian perusahaan BPJS Kes).
//  9. Gaji bersih = total pendapatan − seluruh potongan. Setiap potongan hanya dihitung satu kali.

import type {
  BpjsKesBillingRecord,
  BpjsKesConfig,
  BpjsTkConfig,
  BpjsTkProjectSetting,
  EmployeePayrollDetail,
  GeneralPayrollConfig,
  PayrollCalculationOutput,
  PayrollEmployeeInput,
  PayrollLine,
  PayrollInputLine,
  PayrollComponentParameters,
  Pph21Config,
  ProjectAttendancePayrollPolicy,
  WageCapRule,
} from '../types'
import {
  bpjsKesConfigForPeriod,
  bpjsTkConfigForPeriod,
  resolveTkProjectSetting,
} from './bpjs-effective'
import { computeBillingAmounts } from './bpjs-kes-billing-calc'
import { buildBillingIndex, resolveBillingForEmployee } from './bpjs-kes-billing-match'
import { calculateFinalPeriodPph21, calculateMonthlyPph21 } from './pph21-calc'
import { componentEffectAmount, resolveComponentParameters, validateComponentParameters } from './payroll-component-parameters'
import { m } from '@/i18n/paraglide/messages'

export interface CalculatePayrollParams {
  employees: PayrollEmployeeInput[]
  /** Tagihan BPJS Kesehatan yang di-upload untuk periode payroll ini. */
  billing: BpjsKesBillingRecord[]
  /** Pengaturan master BPJS Kesehatan (persentase & batas upah). */
  bpjsKesConfig: BpjsKesConfig
  /** Pengaturan master BPJS TK (tarif global JKM/JHT/JP). */
  bpjsTkConfig: BpjsTkConfig
  /** Program BPJS TK per project (JKK, JHT, JP aktif atau tidak) dengan tanggal berlaku. */
  tkProjectSettings: BpjsTkProjectSetting[]
  /** Cap upah (Kes & JP) dengan tanggal berlaku. */
  wageCapRules: WageCapRule[]
  /** Periode payroll, format "YYYY-MM" — menentukan setting & cap yang berlaku. */
  periodKey: string
  pph21Config: Pph21Config
  generalConfig: GeneralPayrollConfig
  /** Sertakan potongan cicilan PPh 21 THR bila ada. Default: true. */
  includeThrInstallment?: boolean
  /** Denda per keterlambatan. Default: Rp 50.000. */
  latePenaltyPerOccurrence?: number
  /** Kebijakan absensi per project (apakah absensi memotong gaji alpa & telat). Map dari projectId -> ProjectAttendancePayrollPolicy. */
  projectAttendancePolicies?: Record<string, ProjectAttendancePayrollPolicy>
  componentParameters?: Record<string, PayrollComponentParameters>
}

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0)
const rp = (value: number) => Math.round(value)

export function calculatePayroll(params: CalculatePayrollParams): PayrollCalculationOutput {
  const {
    employees,
    billing,
    tkProjectSettings,
    wageCapRules,
    periodKey,
    pph21Config,
    generalConfig,
    includeThrInstallment = true,
    latePenaltyPerOccurrence = 50_000,
    projectAttendancePolicies,
  } = params

  const bpjsKesConfig = bpjsKesConfigForPeriod(params.bpjsKesConfig, wageCapRules, periodKey)
  const bpjsTkConfig = bpjsTkConfigForPeriod(params.bpjsTkConfig, wageCapRules, periodKey)

  // Indeks tagihan: cocokkan lewat NIK dulu, lalu nomor kepesertaan (helper bersama dgn layar upload).
  const billingIndex = buildBillingIndex(billing)
  const matchedBilling = new Set<BpjsKesBillingRecord>()

  const details: EmployeePayrollDetail[] = employees.map((emp) => {
    if (!Number.isFinite(emp.baseSalary) || emp.baseSalary < 0 ||
      Object.values(emp.overrides?.statutoryAmounts ?? {}).some((amount) => !Number.isFinite(amount) || amount < 0)) {
      throw new Error(`${emp.name}: ${m.payroll_revision_numeric_invalid()}`)
    }
    const warnings: string[] = []
    const lines: PayrollLine[] = []

    // ── Langkah 5: komponen tetap & variabel ──────────────────────────────────────
    for (const line of emp.fixedComponents) lines.push({ ...line, source: 'fixed' })
    for (const line of emp.variableComponents) lines.push({ ...line, source: 'variable' })
    const systemLine = (code: string, name: string, amount: number, thpEffect: PayrollComponentParameters['thpEffect'], taxGrossEffect: PayrollComponentParameters['taxGrossEffect']): PayrollInputLine => {
      if (!Number.isFinite(amount) || amount < 0) throw new Error(`${name}: ${m.payroll_revision_numeric_invalid()}`)
      const parameters = params.componentParameters?.[code] ?? { thpEffect, taxGrossEffect, taxTreatment: taxGrossEffect === 'none' ? 'non_taxable' : 'regular' }
      if (!validateComponentParameters(parameters)) throw new Error(`${name}: ${m.payroll_revision_invalid_parameters()}`)
      if (parameters.taxTreatment === 'final') throw new Error(`${name}: ${m.payroll_revision_final_pending()}`)
      return { code, name, amount, type: thpEffect === 'subtract' ? 'deduction' : 'allowance', isTaxable: parameters.taxTreatment === 'regular', parameters }
    }

    // Komponen otomatis dari presensi (variabel)
    const { workingDays, absentCount, lateCount, overtimeHours } = emp.attendance
    const calculatedOvertimePay =
      !lines.some((line) => line.componentKind === 'overtime') && overtimeHours > 0
        ? rp((overtimeHours * emp.baseSalary) / generalConfig.overtimeHourlyRateDivider)
        : 0

    // Kebijakan absensi per project (apakah absensi memotong gaji alpa & denda telat)
    const projectPolicy = projectAttendancePolicies?.[emp.projectId]
    const attendanceAffectsPayroll = projectPolicy?.attendanceAffectsPayroll ?? true
    const shouldDeductAbsence = attendanceAffectsPayroll && (projectPolicy?.deductAbsence ?? true)
    const shouldDeductLate = attendanceAffectsPayroll && (projectPolicy?.deductLate ?? true)

    const unpaidLeaveDeduction =
      shouldDeductAbsence && !lines.some((line) => line.componentKind === 'attendance_reduction') && absentCount > 0 && workingDays > 0
        ? rp((absentCount * emp.baseSalary) / workingDays)
        : 0
    const lateDeduction =
      shouldDeductLate && !lines.some((line) => line.code === 'LATE') && lateCount > 0 ? rp(lateCount * latePenaltyPerOccurrence) : 0

    if (calculatedOvertimePay > 0) {
      lines.push({
        code: 'OVERTIME',
        name: `Upah Lembur (${overtimeHours} jam)`,
        type: 'allowance',
        amount: calculatedOvertimePay,
        isTaxable: true,
        componentKind: 'overtime',
        parameters: params.componentParameters?.OVERTIME_PAY,
        source: 'attendance',
      })
    }
    if (unpaidLeaveDeduction > 0) {
      lines.push({
        code: 'UNPAID_LEAVE',
        name: `Potongan Tanpa Keterangan (${absentCount} hari)`,
        type: 'deduction',
        amount: unpaidLeaveDeduction,
        isTaxable: false,
        componentKind: 'attendance_reduction',
        parameters: params.componentParameters?.UNPAID_LEAVE,
        source: 'attendance',
      })
    }
    if (lateDeduction > 0) {
      lines.push({
        code: 'LATE',
        name: `Denda Keterlambatan (${lateCount}x)`,
        parameters: params.componentParameters?.DED_LATE,
        type: 'deduction',
        amount: lateDeduction,
        isTaxable: false,
        source: 'attendance',
      })
    }

    for (const line of lines) {
      const parameters = resolveComponentParameters(line)
      if (!Number.isFinite(line.amount) || line.amount < 0) {
        throw new Error(`${emp.name}: ${line.name} — ${m.payroll_revision_numeric_invalid()}`)
      }
      if (!validateComponentParameters(parameters)) {
        throw new Error(`${emp.name}: ${line.name} — ${m.payroll_revision_invalid_parameters()}`)
      }
      if (parameters.taxTreatment === 'final') {
        throw new Error(`${emp.name}: ${line.name} — ${m.payroll_revision_final_pending()}`)
      }
      line.parameters = parameters
    }
    const earningLines = lines.filter((line) => resolveComponentParameters(line).taxGrossEffect === 'add')
    const deductionLines = lines.filter((line) => resolveComponentParameters(line).thpEffect === 'subtract')
    const cashEarningLines = lines.filter((line) => resolveComponentParameters(line).thpEffect === 'add')
    const overtimePay = sum(cashEarningLines.filter((line) => line.componentKind === 'overtime').map((line) => line.amount))

    const fixedAllowances = sum(
      cashEarningLines
        .filter((line) => line.source === 'fixed' && line.componentKind !== 'overtime')
        .map((line) => line.amount),
    )
    const variableAllowances = sum(
      cashEarningLines
        .filter((line) => line.source === 'variable' && line.componentKind !== 'overtime')
        .map((line) => line.amount),
    )

    // Potongan tetap & variabel direkap terpisah (potongan presensi termasuk variabel)
    const totalFixedDeductions = sum(
      deductionLines.filter((l) => l.source === 'fixed').map((l) => l.amount),
    )
    const otherVariableDeductions = sum(
      deductionLines.filter((l) => l.source === 'variable').map((l) => l.amount),
    )
    const totalVariableDeductions = otherVariableDeductions + unpaidLeaveDeduction + lateDeduction
    // "Potongan lainnya" = potongan tetap + variabel selain presensi (satu kolom di rincian)
    const otherDeductions = sum(deductionLines.map((line) => line.amount)) - unpaidLeaveDeduction - lateDeduction
    const loanDeduction = sum(
      deductionLines
        .filter((line) => line.componentKind === 'loan' || line.componentKind === 'cash_advance')
        .map((line) => line.amount),
    )
    const qualifiedPensionDeduction = sum(
      deductionLines
        .filter((line) => line.componentKind === 'qualified_pension')
        .map((line) => line.amount),
    )
    const qualifiedZakatDeduction = sum(
      deductionLines
        .filter((line) => line.componentKind === 'qualified_zakat')
        .map((line) => line.amount),
    )
    const attendanceWageReduction = sum(
      deductionLines
        .filter((line) => line.componentKind === 'attendance_reduction')
        .map((line) => line.amount),
    )
    const manualAttendanceWageReduction = attendanceWageReduction - unpaidLeaveDeduction
    const otherPayrollDeductions = Math.max(
      0,
      otherDeductions - loanDeduction - qualifiedPensionDeduction - qualifiedZakatDeduction - manualAttendanceWageReduction,
    )
    const nonTaxablePayments = sum(
      cashEarningLines.filter((line) => resolveComponentParameters(line).taxTreatment === 'non_taxable').map((line) => line.amount),
    )
    const taxableBenefits = sum(
      earningLines
        .filter((line) => resolveComponentParameters(line).thpEffect === 'none')
        .map((line) => line.amount),
    )

    // ── Langkah 6: BPJS Kesehatan (Upload tagihan atau hitung otomatis dari master) ──
    let bpjsKesEmployee = 0
    let bpjsKesFamilyExtra = 0
    let bpjsKesEmployer = 0
    let bpjsKesSource: EmployeePayrollDetail['bpjsKesSource']
    if (emp.bpjs.kesActive) {
      const { record, candidates, issues } = resolveBillingForEmployee(billingIndex, emp)
      candidates.forEach((c) => matchedBilling.add(c))
      issues.forEach((issue) => warnings.push(issue))
      if (record) {
        const amounts = computeBillingAmounts(record, bpjsKesConfig)
        bpjsKesFamilyExtra = amounts.familyExtra
        bpjsKesEmployee = amounts.employeeShare + amounts.familyExtra
        bpjsKesEmployer = amounts.employerShare
        bpjsKesSource = 'billing'
      } else {
        // Otomatis dihitung dari upah master karyawan
        const cappedWage = Math.min(emp.baseSalary, bpjsKesConfig.maxWageCap)
        bpjsKesFamilyExtra = 0
        bpjsKesEmployee = rp((cappedWage * bpjsKesConfig.employeeRatePercent) / 100)
        bpjsKesEmployer = rp((cappedWage * bpjsKesConfig.companyRatePercent) / 100)
        bpjsKesSource = 'calculated'
      }
    }
    // ── Langkah 7: BPJS TK per project (JKK & JKM wajib; JHT & JP sesuai setting project) ──
    const projectSetting = resolveTkProjectSetting(tkProjectSettings, emp.projectId, periodKey)
    if (!projectSetting) {
      warnings.push(
        `Setting BPJS TK untuk project "${emp.project}" belum diatur / belum berlaku di periode ini — JHT & JP dianggap tidak aktif, JKK memakai tarif default.`,
      )
    }
    const jkkRate = projectSetting?.jkkRatePercent ?? bpjsTkConfig.jkkRatePercent
    const jhtActive = projectSetting?.jhtActive ?? false
    const jpActive = projectSetting?.jpActive ?? false
    const jpBase = Math.min(emp.baseSalary, bpjsTkConfig.jpMaxWageCap)

    const statutoryOverride = emp.overrides?.statutoryAmounts
    bpjsKesEmployee = statutoryOverride?.bpjsKesEmployee ?? bpjsKesEmployee
    bpjsKesEmployer = statutoryOverride?.bpjsKesEmployer ?? bpjsKesEmployer
    bpjsKesFamilyExtra = Math.min(bpjsKesFamilyExtra, bpjsKesEmployee)
    const bpjsTkJkk = statutoryOverride?.bpjsTkJkk ?? rp((emp.baseSalary * jkkRate) / 100)
    const bpjsTkJkm = statutoryOverride?.bpjsTkJkm ?? rp((emp.baseSalary * bpjsTkConfig.jkmRatePercent) / 100)
    const bpjsTkJhtEmployee = statutoryOverride?.bpjsTkJhtEmployee ?? (jhtActive
      ? rp((emp.baseSalary * bpjsTkConfig.jhtEmployeePercent) / 100)
      : 0)
    const bpjsTkJhtEmployer = jhtActive
      ? rp((emp.baseSalary * bpjsTkConfig.jhtCompanyPercent) / 100)
      : 0
    const bpjsTkJpEmployee = statutoryOverride?.bpjsTkJpEmployee ?? (jpActive ? rp((jpBase * bpjsTkConfig.jpEmployeePercent) / 100) : 0)
    const bpjsTkJpEmployer = jpActive ? rp((jpBase * bpjsTkConfig.jpCompanyPercent) / 100) : 0
    // Hanya JHT & JP karyawan yang mengurangi THP
    const bpjsTkEmployee = bpjsTkJhtEmployee + bpjsTkJpEmployee
    const bpjsTkEmployer = bpjsTkJkk + bpjsTkJkm + bpjsTkJhtEmployer + bpjsTkJpEmployer
    const systemComponents = [
      systemLine('BASIC_SALARY', m.payroll_run_detail_col_base_salary(), emp.baseSalary, 'add', 'add'),
      systemLine('DED_BPJS_KES', m.payroll_breakdown_health_employee(), bpjsKesEmployee, 'subtract', 'none'),
      systemLine('DED_BPJS_TK', m.payroll_revision_statutory(), bpjsTkEmployee, 'subtract', 'none'),
      systemLine('BPJS_KES_EMPLOYER', m.payroll_revision_health_employer(), bpjsKesEmployer, 'none', 'add'),
      systemLine('JKK_EMPLOYER', m.payroll_bpjs_tk_jkk(), bpjsTkJkk, 'none', 'add'),
      systemLine('JKM_EMPLOYER', m.payroll_bpjs_tk_jkm(), bpjsTkJkm, 'none', 'add'),
    ]
    const totalGross = sum(cashEarningLines.map((line) => line.amount)) + sum(systemComponents.filter((line) => resolveComponentParameters(line).thpEffect === 'add').map((line) => line.amount))
    const systemCashDeductions = sum(systemComponents.filter((line) => resolveComponentParameters(line).thpEffect === 'subtract').map((line) => line.amount))
    const systemTaxGross = sum(systemComponents.map((line) => {
      const parameters = resolveComponentParameters(line)
      return parameters.taxTreatment === 'regular' ? componentEffectAmount(line.amount, parameters.taxGrossEffect) : 0
    }))

    // ── Langkah 8: PPh 21 (dasar pengenaan mengikuti isTaxable tiap komponen) ──────
    const taxableAllowances = sum(lines.map((line) => {
      const parameters = resolveComponentParameters(line)
      return parameters.taxTreatment === 'regular'
        ? componentEffectAmount(line.amount, parameters.taxGrossEffect)
        : 0
    }))
    // Porsi perusahaan BPJS Kes (4%), JKK, dan JKM = penghasilan kena pajak; pot. keluarga tambahan tidak memengaruhi pajak.
    const taxableIncome = Math.max(
      0,
      systemTaxGross + taxableAllowances,
    )
    const pphResult = calculateMonthlyPph21({
      taxableGrossMonthly: taxableIncome,
      employeeJhtJp: bpjsTkJhtEmployee + bpjsTkJpEmployee,
      ptkpStatus: emp.ptkpStatus,
      cfg: pph21Config,
    })
    const periodMonth = Number(periodKey.slice(5, 7))
    const shouldReconcileFinalTax =
      periodMonth === 12 || emp.taxYearToDate?.isFinalTaxPeriod === true
    let finalTaxReconciliation
    let pph21Tax = pphResult.taxAmount
    if (shouldReconcileFinalTax) {
      if (!emp.taxYearToDate || emp.taxYearToDate.verified === false) {
        throw new Error(m.payroll_wizard_final_tax_missing({ count: 1 }))
      }
      if (emp.taxYearToDate) {
        finalTaxReconciliation = calculateFinalPeriodPph21({
          currentTaxableGross: taxableIncome,
          currentEmployeePensionContributions:
            bpjsTkJhtEmployee + bpjsTkJpEmployee + qualifiedPensionDeduction,
          currentQualifiedZakat: qualifiedZakatDeduction,
          ptkpStatus: emp.ptkpStatus,
          yearToDate: emp.taxYearToDate,
          cfg: pph21Config,
        })
        pph21Tax = finalTaxReconciliation.currentPeriodPph21
      } else {
        warnings.push(
          'Data kumulatif tahun berjalan belum tersedia untuk rekonsiliasi PPh 21 masa pajak terakhir.',
        )
      }
    }

    if (pphResult.taxAllowance > 0) {
      lines.push({
        code: 'TAX_ALLOWANCE',
        calculated: true,
        name:
          pph21Config.taxMethod === 'gross_up'
            ? 'Tunjangan PPh 21 (Gross-Up)'
            : 'Pajak Ditanggung Perusahaan (Nett)',
        type: 'allowance',
        amount: pphResult.taxAllowance,
        isTaxable: false,
        cashImpact: pph21Config.taxMethod === 'gross_up',
        source: 'fixed',
      })
    }

    // Cicilan PPh 21 THR (hanya satu kali per periode, tidak melebihi sisa saldo)
    const thr = includeThrInstallment ? emp.thrTaxInstallment : undefined
    const thrTaxInstallment = emp.overrides?.thrTaxInstallmentAmount ?? (thr ? Math.min(thr.amount, thr.remainingBalance) : 0)
    if (!Number.isFinite(thrTaxInstallment) || thrTaxInstallment < 0 || thrTaxInstallment > (thr?.remainingBalance ?? 0)) {
      throw new Error(`${emp.name}: ${m.payroll_run_detail_remaining_balance({ amount: String(thr?.remainingBalance ?? 0) })}`)
    }

    // ── Langkah 9: gaji bersih ─────────────────────────────────────────────────────
    // Jika nett, pajak tidak memotong gaji karyawan (ditanggung perusahaan)
    const employeeTax = pph21Config.taxMethod === 'nett' ? 0 : pph21Tax
    const taxLine = systemLine('DED_PPH21', m.payroll_revision_tax_regular(), Math.abs(employeeTax), 'subtract', 'none')
    if (resolveComponentParameters(taxLine).taxGrossEffect !== 'none') throw new Error(m.payroll_revision_invalid_parameters())
    if (employeeTax < 0 && taxLine.parameters) taxLine.parameters = { ...taxLine.parameters, thpEffect: taxLine.parameters.thpEffect === 'subtract' ? 'add' : taxLine.parameters.thpEffect === 'add' ? 'subtract' : 'none' }
    const employeePph21Deduction = -componentEffectAmount(taxLine.amount, resolveComponentParameters(taxLine).thpEffect)
    const thrLine = systemLine('THR_TAX_INSTALLMENT', m.payroll_run_detail_thr_installment(), thrTaxInstallment, 'subtract', 'none')
    if (resolveComponentParameters(thrLine).taxGrossEffect !== 'none') throw new Error(m.payroll_revision_invalid_parameters())
    const thrCashDeduction = -componentEffectAmount(thrLine.amount, resolveComponentParameters(thrLine).thpEffect)
    systemComponents.push(taxLine, thrLine)
    const finalTotalGross =
      totalGross +
      (pphResult.taxAllowance > 0 && pph21Config.taxMethod === 'gross_up'
        ? pphResult.taxAllowance
        : 0)

    const totalDeductions =
      unpaidLeaveDeduction +
      lateDeduction +
      otherDeductions +
      systemCashDeductions +
      employeePph21Deduction +
      thrCashDeduction
    const netTakeHomePay = finalTotalGross - totalDeductions
    if (netTakeHomePay < 0) warnings.push('Gaji bersih negatif — periksa komponen potongan.')

    return {
      id: `emp-pay-${emp.employeeId}`,
      employeeId: emp.employeeId,
      nik: emp.nik,
      joinDate: emp.joinDate,
      npwp: emp.npwp,
      systemComponents,
      employeeName: emp.name,
      employeeCode: emp.nopeg,
      department: emp.department,
      position: emp.position,
      employmentType: emp.employmentType,
      ptkpStatus: emp.ptkpStatus,
      bankName: emp.bankName,
      bankAccountNumber: emp.bankAccountNumber,
      bankAccountHolder: emp.bankAccountHolder,
      workingDays,
      actualPresent: emp.attendance.actualPresent,
      lateCount,
      absentCount,
      overtimeHours,
      baseSalary: emp.baseSalary,
      fixedAllowances,
      variableAllowances,
      overtimePay,
      bonusTHR: sum(
        cashEarningLines.filter((line) => line.componentKind === 'thr_bonus').map((line) => line.amount),
      ),
      totalGross: finalTotalGross,
      unpaidLeaveDeduction,
      lateDeduction,
      loanDeduction,
      qualifiedPensionDeduction,
      qualifiedZakatDeduction,
      otherDeductions: otherPayrollDeductions,
      nonTaxablePayments,
      taxableBenefits,
      bpjsTkEmployee,
      bpjsTkEmployer,
      bpjsKesEmployee,
      bpjsKesEmployer,
      pph21Tax,
      pph21EmployeeDeduction: employeePph21Deduction,
      thrTaxInstallment,
      thrTaxInstallmentInfo: thr
        ? {
            installmentId: thr.installmentId,
            tenorMonths: thr.tenorMonths,
            currentInstallmentMonth: thr.currentInstallmentMonth,
            totalTaxAmount: thr.totalTaxAmount,
            remainingBalance: thr.remainingBalance,
          }
        : undefined,
      totalDeductions,
      netTakeHomePay,
      status: 'calculated',
      project: emp.project,
      workLocation: emp.workLocation,
      bpjsKesSource,
      bpjsKesFamilyExtra,
      bpjsTkJhtEmployee,
      bpjsTkJpEmployee,
      bpjsTkJkk,
      bpjsTkJkm,
      bpjsTkJhtEmployer,
      bpjsTkJpEmployer,
      taxableIncome,
      taxRatePercent: pphResult.ratePercent,
      taxScheme: finalTaxReconciliation ? 'PROGRESSIVE_PASAL17' : pphResult.scheme,
      terCategory: pphResult.terCategory,
      finalTaxReconciliation,
      totalFixedEarnings: fixedAllowances,
      totalVariableEarnings: variableAllowances + overtimePay,
      totalFixedDeductions,
      totalVariableDeductions,
      lines,
      warnings,
    }
  })

  const unmatchedBilling = billing.filter((record) => !matchedBilling.has(record))

  const totalGross = sum(details.map((d) => d.totalGross))
  const summary = {
    employeeCount: details.length,
    totalGross,
    totalAllowances: totalGross - sum(details.map((detail) => {
      const base = detail.systemComponents?.find((line) => line.code === 'BASIC_SALARY')
      return base && resolveComponentParameters(base).thpEffect === 'add' ? base.amount : 0
    })),
    totalDeductions: sum(details.map((d) => d.totalDeductions)),
    totalTaxPPh21: sum(details.map((d) => d.pph21Tax)),
    totalBpjsTK: sum(details.map((d) => d.bpjsTkEmployee)),
    totalBpjsKes: sum(details.map((d) => d.bpjsKesEmployee)),
    totalNet: sum(details.map((d) => d.netTakeHomePay)),
    warningCount: details.filter((d) => (d.warnings?.length ?? 0) > 0).length,
  }

  return { details, summary, unmatchedBilling }
}
