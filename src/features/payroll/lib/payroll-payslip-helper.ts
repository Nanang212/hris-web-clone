// src/features/payroll/lib/payroll-payslip-helper.ts
import type { EmployeePayrollDetail, PayslipRecord } from '../types'

export function detailToPayslip(
  detail: EmployeePayrollDetail,
  runId: string = 'pay-run-2026-06',
  period: string = 'June 2026',
  paymentDate: string = '25 Jun 2026',
): PayslipRecord {
  const earnings: { name: string; amount: number; isTaxable: boolean }[] = [
    { name: 'Gaji Pokok', amount: detail.baseSalary, isTaxable: true },
  ]
  if (detail.fixedAllowances > 0) {
    earnings.push({ name: 'Tunjangan Tetap', amount: detail.fixedAllowances, isTaxable: true })
  }
  if (detail.variableAllowances > 0) {
    earnings.push({ name: 'Tunjangan Variabel', amount: detail.variableAllowances, isTaxable: true })
  }
  if (detail.overtimePay > 0) {
    earnings.push({
      name: `Upah Lembur (${detail.overtimeHours} Jam)`,
      amount: detail.overtimePay,
      isTaxable: true,
    })
  }

  const deductions: { name: string; amount: number }[] = []
  if (detail.bpjsKesEmployee > 0) {
    const family = detail.bpjsKesFamilyExtra ?? 0
    const kes1 = Math.max(0, detail.bpjsKesEmployee - family)
    deductions.push({ name: 'BPJS Kesehatan (1%)', amount: kes1 })
    if (family > 0) {
      deductions.push({ name: 'Iuran Keluarga Tambahan BPJS Kes', amount: family })
    }
  }
  if (detail.bpjsTkEmployee > 0) {
    deductions.push({
      name: 'BPJS Ketenagakerjaan (JHT + JP)',
      amount: detail.bpjsTkEmployee,
    })
  }
  if (detail.pph21Tax > 0) {
    deductions.push({ name: 'Pajak PPh 21 Bulanan', amount: detail.pph21Tax })
  }
  if (detail.thrTaxInstallment && detail.thrTaxInstallment > 0) {
    deductions.push({
      name: `Cicilan PPh 21 THR (Bln ${detail.thrTaxInstallmentInfo?.currentInstallmentMonth || 1}/${detail.thrTaxInstallmentInfo?.tenorMonths || 3})`,
      amount: detail.thrTaxInstallment,
    })
  }
  if (detail.unpaidLeaveDeduction > 0) {
    deductions.push({
      name: `Potongan Unpaid Leave (${detail.absentCount} hari)`,
      amount: detail.unpaidLeaveDeduction,
    })
  }
  if (detail.lateDeduction > 0) {
    deductions.push({
      name: `Denda Keterlambatan (${detail.lateCount}x)`,
      amount: detail.lateDeduction,
    })
  }
  if (detail.loanDeduction > 0) {
    deductions.push({
      name: 'Potongan Pinjaman / Lainnya',
      amount: detail.loanDeduction,
    })
  }

  return {
    id: `slip-${detail.employeeId}-${period.replace(/\s+/g, '-').toLowerCase()}`,
    payslipNumber: `PS/${period.slice(-4)}/${detail.employeeCode.replace(/\D/g, '').padStart(4, '0')}`,
    payrollRunId: runId,
    period,
    paymentDate,
    employeeId: detail.employeeId,
    employeeName: detail.employeeName,
    employeeCode: detail.employeeCode,
    department: detail.department,
    position: detail.position,
    joinDate: '12 Jan 2022',
    ptkpStatus: detail.ptkpStatus,
    npwp: '82.918.271.0-012.000',
    bankName: detail.bankName,
    bankAccountNumber: detail.bankAccountNumber,
    earnings,
    deductions,
    totalEarnings: detail.totalGross,
    totalDeductions: detail.totalDeductions,
    netPay: detail.netTakeHomePay,
    status: detail.status === 'paid' ? 'sent' : 'draft',
    sentAt: detail.status === 'paid' ? `${paymentDate}, 09:00` : undefined,
  }
}
