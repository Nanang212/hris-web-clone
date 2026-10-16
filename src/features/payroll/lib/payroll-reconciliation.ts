// src/features/payroll/lib/payroll-reconciliation.ts
// Logika rekonsiliasi audit antara Tagihan BPJS Kesehatan (file upload)
// vs Angka BPJS Kesehatan di Report Payroll per karyawan.

import { computeBillingAmounts } from './bpjs-kes-billing-calc'
import { buildBillingIndex, resolveBillingForEmployee } from './bpjs-kes-billing-match'
import { initialPayrollEmployeeInputs } from '../data/mock-payroll-inputs'
import type {
  BpjsKesBillingRecord,
  BpjsKesConfig,
  EmployeePayrollDetail,
  PayrollEmployeeInput,
} from '../types'
import { m } from '@/i18n/paraglide/messages'

export type ReconciliationStatus =
  | 'MATCH'
  | 'WAGE_DIFF'
  | 'MISSING_IN_BILLING'
  | 'ORPHAN_BILLING'

export interface BpjsKesReconciliationRow {
  id: string
  nopeg: string
  nik: string
  bpjsNumber: string
  employeeName: string
  department: string
  project: string
  statusInMaster: 'Aktif' | 'Tidak Terdaftar'
  // Tagihan dari file BPJS
  billingWage: number
  billingEmployee1Pct: number
  billingFamilyExtra: number
  billingEmployer4Pct: number
  billingTotal: number
  // Angka yang diproses di Payroll
  payrollWage: number
  payrollEmployee1Pct: number
  payrollFamilyExtra: number
  payrollEmployer4Pct: number
  payrollTotal: number
  // Selisih
  wageDifference: number
  totalDifference: number
  status: ReconciliationStatus
  statusLabel: string
  diagnosis: string
}

export interface BpjsKesReconciliationSummary {
  totalRows: number
  matchCount: number
  wageDiffCount: number
  missingInBillingCount: number
  orphanBillingCount: number
  totalBillingSum: number
  totalPayrollSum: number
  netDifference: number
}

export function buildBpjsKesReconciliation(params: {
  details: EmployeePayrollDetail[]
  billingRecords: BpjsKesBillingRecord[]
  bpjsKesConfig: BpjsKesConfig
  locale: string
  employees?: PayrollEmployeeInput[]
}): {
  rows: BpjsKesReconciliationRow[]
  summary: BpjsKesReconciliationSummary
} {
  const { details, billingRecords, bpjsKesConfig, locale, employees = initialPayrollEmployeeInputs } = params

  const employeeMap = new Map(employees.map((e) => [e.employeeId, e]))
  const billingIndex = buildBillingIndex(billingRecords)
  const matchedBillingSet = new Set<BpjsKesBillingRecord>()

  const rows: BpjsKesReconciliationRow[] = []

  // 1. Periksa setiap karyawan yang ada di payroll run
  for (const detail of details) {
    const empInput = employeeMap.get(detail.employeeId) || {
      employeeId: detail.employeeId,
      nopeg: detail.employeeCode,
      nik: '',
      bpjs: { kesParticipantNumber: '', kesActive: true },
    }

    const resolution = resolveBillingForEmployee(billingIndex, empInput)
    const billingRecord = resolution.record

    if (billingRecord) {
      matchedBillingSet.add(billingRecord)
      const billingAmounts = computeBillingAmounts(billingRecord, bpjsKesConfig)

      const payroll1Pct = Math.max(0, detail.bpjsKesEmployee - (detail.bpjsKesFamilyExtra ?? 0))
      const payrollFamily = detail.bpjsKesFamilyExtra ?? 0
      const payroll4Pct = detail.bpjsKesEmployer
      const payrollTotal = payroll1Pct + payrollFamily + payroll4Pct

      const wageDiff = billingRecord.bpjsWage - detail.baseSalary
      const totalDiff = billingAmounts.total - payrollTotal

      let status: ReconciliationStatus = 'MATCH'
      let statusLabel = m.payroll_recon_status_match()
      let diagnosis = m.payroll_recon_diagnosis_match()

      if (wageDiff !== 0) {
        status = 'WAGE_DIFF'
        statusLabel = m.payroll_recon_status_wage_diff()
        diagnosis = m.payroll_recon_diagnosis_wage_diff({ billing: billingRecord.bpjsWage.toLocaleString(locale), salary: detail.baseSalary.toLocaleString(locale) })
      } else if (totalDiff !== 0) {
        status = 'WAGE_DIFF'
        statusLabel = m.payroll_recon_status_amount_diff()
        diagnosis = m.payroll_recon_diagnosis_amount_diff({ amount: Math.abs(totalDiff).toLocaleString(locale) })
      }

      rows.push({
        id: `recon-${detail.employeeId}`,
        nopeg: detail.employeeCode || billingRecord.nopeg,
        nik: empInput.nik || billingRecord.nik,
        bpjsNumber: empInput.bpjs?.kesParticipantNumber || billingRecord.bpjsNumber,
        employeeName: detail.employeeName,
        department: detail.department,
        project: detail.project || '-',
        statusInMaster: 'Aktif',
        billingWage: billingRecord.bpjsWage,
        billingEmployee1Pct: billingAmounts.employeeShare,
        billingFamilyExtra: billingAmounts.familyExtra,
        billingEmployer4Pct: billingAmounts.employerShare,
        billingTotal: billingAmounts.total,
        payrollWage: detail.baseSalary,
        payrollEmployee1Pct: payroll1Pct,
        payrollFamilyExtra: payrollFamily,
        payrollEmployer4Pct: payroll4Pct,
        payrollTotal,
        wageDifference: wageDiff,
        totalDifference: totalDiff,
        status,
        statusLabel,
        diagnosis,
      })
    } else {
      // Karyawan aktif di master payroll tapi tidak ada dalam file tagihan BPJS
      const payroll1Pct = Math.max(0, detail.bpjsKesEmployee - (detail.bpjsKesFamilyExtra ?? 0))
      const payrollFamily = detail.bpjsKesFamilyExtra ?? 0
      const payroll4Pct = detail.bpjsKesEmployer
      const payrollTotal = payroll1Pct + payrollFamily + payroll4Pct

      rows.push({
        id: `recon-${detail.employeeId}`,
        nopeg: detail.employeeCode,
        nik: empInput.nik || '-',
        bpjsNumber: empInput.bpjs?.kesParticipantNumber || '-',
        employeeName: detail.employeeName,
        department: detail.department,
        project: detail.project || '-',
        statusInMaster: 'Aktif',
        billingWage: 0,
        billingEmployee1Pct: 0,
        billingFamilyExtra: 0,
        billingEmployer4Pct: 0,
        billingTotal: 0,
        payrollWage: detail.baseSalary,
        payrollEmployee1Pct: payroll1Pct,
        payrollFamilyExtra: payrollFamily,
        payrollEmployer4Pct: payroll4Pct,
        payrollTotal,
        wageDifference: -detail.baseSalary,
        totalDifference: -payrollTotal,
        status: 'MISSING_IN_BILLING',
        statusLabel: m.payroll_recon_status_missing(),
        diagnosis: m.payroll_recon_diagnosis_missing(),
      })
    }
  }

  // 2. Periksa baris tagihan BPJS yang tidak cocok dengan karyawan mana pun di master (Orphan)
  for (const bRecord of billingRecords) {
    if (!matchedBillingSet.has(bRecord)) {
      const billingAmounts = computeBillingAmounts(bRecord, bpjsKesConfig)
      rows.push({
        id: `recon-orphan-${bRecord.bpjsNumber || bRecord.nik || bRecord.nopeg || Math.random()}`,
        nopeg: bRecord.nopeg || '-',
        nik: bRecord.nik || '-',
        bpjsNumber: bRecord.bpjsNumber || '-',
        employeeName: bRecord.name || m.payroll_recon_unknown_participant(),
        department: '-',
        project: '-',
        statusInMaster: 'Tidak Terdaftar',
        billingWage: bRecord.bpjsWage,
        billingEmployee1Pct: billingAmounts.employeeShare,
        billingFamilyExtra: billingAmounts.familyExtra,
        billingEmployer4Pct: billingAmounts.employerShare,
        billingTotal: billingAmounts.total,
        payrollWage: 0,
        payrollEmployee1Pct: 0,
        payrollFamilyExtra: 0,
        payrollEmployer4Pct: 0,
        payrollTotal: 0,
        wageDifference: bRecord.bpjsWage,
        totalDifference: billingAmounts.total,
        status: 'ORPHAN_BILLING',
        statusLabel: m.payroll_recon_status_orphan(),
        diagnosis: m.payroll_recon_diagnosis_orphan(),
      })
    }
  }

  const matchCount = rows.filter((r) => r.status === 'MATCH').length
  const wageDiffCount = rows.filter((r) => r.status === 'WAGE_DIFF').length
  const missingInBillingCount = rows.filter((r) => r.status === 'MISSING_IN_BILLING').length
  const orphanBillingCount = rows.filter((r) => r.status === 'ORPHAN_BILLING').length

  const totalBillingSum = rows.reduce((acc, r) => acc + r.billingTotal, 0)
  const totalPayrollSum = rows.reduce((acc, r) => acc + r.payrollTotal, 0)
  const netDifference = totalBillingSum - totalPayrollSum

  return {
    rows,
    summary: {
      totalRows: rows.length,
      matchCount,
      wageDiffCount,
      missingInBillingCount,
      orphanBillingCount,
      totalBillingSum,
      totalPayrollSum,
      netDifference,
    },
  }
}
