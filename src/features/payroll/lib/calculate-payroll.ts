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

import { computeBillingAmounts } from './bpjs-kes-billing-calc'
import { buildBillingIndex, resolveBillingForEmployee } from './bpjs-kes-billing-match'
import { bpjsKesConfigForPeriod, bpjsTkConfigForPeriod, resolveTkProjectSetting } from './bpjs-effective'
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
  Pph21Config,
  WageCapRule,
} from '../types'

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
}

import { calculateMonthlyPph21 } from './pph21-calc'

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
  } = params

  const bpjsKesConfig = bpjsKesConfigForPeriod(params.bpjsKesConfig, wageCapRules, periodKey)
  const bpjsTkConfig = bpjsTkConfigForPeriod(params.bpjsTkConfig, wageCapRules, periodKey)

  // Indeks tagihan: cocokkan lewat NIK dulu, lalu nomor kepesertaan (helper bersama dgn layar upload).
  const billingIndex = buildBillingIndex(billing)
  const matchedBilling = new Set<BpjsKesBillingRecord>()

  const details: EmployeePayrollDetail[] = employees.map((emp) => {
    const warnings: string[] = []
    const lines: PayrollLine[] = []

    // ── Langkah 5: komponen tetap & variabel ──────────────────────────────────────
    for (const line of emp.fixedComponents) lines.push({ ...line, source: 'fixed' })
    for (const line of emp.variableComponents) lines.push({ ...line, source: 'variable' })

    // Komponen otomatis dari presensi (variabel)
    const { workingDays, absentCount, lateCount, overtimeHours } = emp.attendance
    const overtimePay =
      overtimeHours > 0
        ? rp((overtimeHours * emp.baseSalary) / generalConfig.overtimeHourlyRateDivider)
        : 0
    const unpaidLeaveDeduction =
      absentCount > 0 && workingDays > 0 ? rp((absentCount * emp.baseSalary) / workingDays) : 0
    const lateDeduction = lateCount > 0 ? rp(lateCount * latePenaltyPerOccurrence) : 0

    if (overtimePay > 0) {
      lines.push({
        code: 'OVERTIME',
        name: `Upah Lembur (${overtimeHours} jam)`,
        type: 'allowance',
        amount: overtimePay,
        isTaxable: true,
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
        source: 'attendance',
      })
    }
    if (lateDeduction > 0) {
      lines.push({
        code: 'LATE',
        name: `Denda Keterlambatan (${lateCount}x)`,
        type: 'deduction',
        amount: lateDeduction,
        isTaxable: false,
        source: 'attendance',
      })
    }

    const earningLines = lines.filter((l) => l.type === 'allowance')
    const deductionLines = lines.filter((l) => l.type === 'deduction')

    const fixedAllowances = sum(
      earningLines.filter((l) => l.source === 'fixed').map((l) => l.amount),
    )
    const variableAllowances = sum(
      earningLines.filter((l) => l.source === 'variable').map((l) => l.amount),
    )
    const totalGross = emp.baseSalary + fixedAllowances + variableAllowances + overtimePay

    // Potongan tetap & variabel direkap terpisah (potongan presensi termasuk variabel)
    const totalFixedDeductions = sum(
      deductionLines.filter((l) => l.source === 'fixed').map((l) => l.amount),
    )
    const otherVariableDeductions = sum(
      deductionLines.filter((l) => l.source === 'variable').map((l) => l.amount),
    )
    const totalVariableDeductions = otherVariableDeductions + unpaidLeaveDeduction + lateDeduction
    // "Potongan lainnya" = potongan tetap + variabel selain presensi (satu kolom di rincian)
    const otherDeductions = totalFixedDeductions + otherVariableDeductions

    // ── Langkah 6: BPJS Kesehatan dari tagihan upload ─────────────────────────────
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
        bpjsKesSource = 'missing'
        warnings.push('Tagihan BPJS Kesehatan belum tersedia untuk karyawan ini — periksa upload.')
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

    const bpjsTkJkk = rp((emp.baseSalary * jkkRate) / 100)
    const bpjsTkJkm = rp((emp.baseSalary * bpjsTkConfig.jkmRatePercent) / 100)
    const bpjsTkJhtEmployee = jhtActive ? rp((emp.baseSalary * bpjsTkConfig.jhtEmployeePercent) / 100) : 0
    const bpjsTkJhtEmployer = jhtActive ? rp((emp.baseSalary * bpjsTkConfig.jhtCompanyPercent) / 100) : 0
    const bpjsTkJpEmployee = jpActive ? rp((jpBase * bpjsTkConfig.jpEmployeePercent) / 100) : 0
    const bpjsTkJpEmployer = jpActive ? rp((jpBase * bpjsTkConfig.jpCompanyPercent) / 100) : 0
    // Hanya JHT & JP karyawan yang mengurangi THP
    const bpjsTkEmployee = bpjsTkJhtEmployee + bpjsTkJpEmployee
    const bpjsTkEmployer = bpjsTkJkk + bpjsTkJkm + bpjsTkJhtEmployer + bpjsTkJpEmployer

    // ── Langkah 8: PPh 21 (dasar pengenaan mengikuti isTaxable tiap komponen) ──────
    const taxableAllowances = sum(earningLines.filter((l) => l.isTaxable).map((l) => l.amount))
    // Porsi perusahaan BPJS Kes (4%), JKK, dan JKM = penghasilan kena pajak; pot. keluarga tambahan tidak memengaruhi pajak.
    const taxableIncome = Math.max(
      0,
      emp.baseSalary +
      taxableAllowances -
      unpaidLeaveDeduction +
      bpjsKesEmployer +
      bpjsTkJkk +
      bpjsTkJkm,
    )
    const pphResult = calculateMonthlyPph21({
      taxableGrossMonthly: taxableIncome,
      employeeJhtJp: bpjsTkJhtEmployee + bpjsTkJpEmployee,
      ptkpStatus: emp.ptkpStatus,
      cfg: pph21Config,
    })
    const pph21Tax = pphResult.taxAmount

    if (pphResult.taxAllowance > 0) {
      lines.push({
        code: 'TAX_ALLOWANCE',
        name:
          pph21Config.taxMethod === 'gross_up'
            ? 'Tunjangan PPh 21 (Gross-Up)'
            : 'Pajak Ditanggung Perusahaan (Nett)',
        type: 'allowance',
        amount: pphResult.taxAllowance,
        isTaxable: false,
        source: 'fixed',
      })
    }

    // Cicilan PPh 21 THR (hanya satu kali per periode, tidak melebihi sisa saldo)
    const thr = includeThrInstallment ? emp.thrTaxInstallment : undefined
    const thrTaxInstallment = thr ? Math.min(thr.amount, thr.remainingBalance) : 0

    // ── Langkah 9: gaji bersih ─────────────────────────────────────────────────────
    // Jika nett, pajak tidak memotong gaji karyawan (ditanggung perusahaan)
    const employeePph21Deduction = pph21Config.taxMethod === 'nett' ? 0 : pph21Tax
    const finalTotalGross =
      totalGross + (pphResult.taxAllowance > 0 && pph21Config.taxMethod === 'gross_up' ? pphResult.taxAllowance : 0)

    const totalDeductions =
      unpaidLeaveDeduction +
      lateDeduction +
      otherDeductions +
      bpjsKesEmployee +
      bpjsTkEmployee +
      employeePph21Deduction +
      thrTaxInstallment
    const netTakeHomePay = finalTotalGross - totalDeductions
    if (netTakeHomePay < 0) warnings.push('Gaji bersih negatif — periksa komponen potongan.')

    return {
      id: `emp-pay-${emp.employeeId}`,
      employeeId: emp.employeeId,
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
      bonusTHR: 0,
      totalGross: finalTotalGross,
      unpaidLeaveDeduction,
      lateDeduction,
      loanDeduction: otherDeductions,
      bpjsTkEmployee,
      bpjsTkEmployer,
      bpjsKesEmployee,
      bpjsKesEmployer,
      pph21Tax,
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
    totalAllowances: totalGross - sum(details.map((d) => d.baseSalary)),
    totalDeductions: sum(details.map((d) => d.totalDeductions)),
    totalTaxPPh21: sum(details.map((d) => d.pph21Tax)),
    totalBpjsTK: sum(details.map((d) => d.bpjsTkEmployee)),
    totalBpjsKes: sum(details.map((d) => d.bpjsKesEmployee)),
    totalNet: sum(details.map((d) => d.netTakeHomePay)),
    warningCount: details.filter((d) => (d.warnings?.length ?? 0) > 0).length,
  }

  return { details, summary, unmatchedBilling }
}
