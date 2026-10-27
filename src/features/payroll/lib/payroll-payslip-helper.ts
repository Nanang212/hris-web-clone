// src/features/payroll/lib/payroll-payslip-helper.ts
import type { EmployeePayrollDetail, PayslipRecord } from '../types'
import { resolveComponentParameters } from './payroll-component-parameters'

export function detailToPayslip(
  detail: EmployeePayrollDetail,
  runId: string = 'pay-run-2026-06',
  period: string = 'June 2026',
  paymentDate: string = '25 Jun 2026',
): PayslipRecord {
  const cashComponents = detail.systemComponents ? [...detail.systemComponents, ...(detail.lines ?? [])] : undefined
  const earnings: { name: string; amount: number; isTaxable: boolean }[] = cashComponents
    ? cashComponents.filter((line) => resolveComponentParameters(line).thpEffect === 'add' && line.amount !== 0).map((line) => ({ name: line.name, amount: line.amount, isTaxable: resolveComponentParameters(line).taxGrossEffect === 'add' }))
    : [{ name: 'Gaji Pokok', amount: detail.baseSalary, isTaxable: true }]
  const earningLines = detail.lines?.filter(
    (line) => resolveComponentParameters(line).thpEffect === 'add',
  )
  const deductionLines = detail.lines?.filter((line) => resolveComponentParameters(line).thpEffect === 'subtract')

  if (!cashComponents && earningLines?.length) {
    earnings.push(
      ...earningLines.map((line) => ({
        name: line.name,
        amount: line.amount,
        isTaxable: resolveComponentParameters(line).taxTreatment === 'regular' && resolveComponentParameters(line).taxGrossEffect === 'add',
      })),
    )
  } else if (!cashComponents && detail.fixedAllowances > 0) {
    earnings.push({ name: 'Tunjangan Tetap', amount: detail.fixedAllowances, isTaxable: true })
    if (detail.variableAllowances > 0) {
      earnings.push({
        name: 'Tunjangan Variabel',
        amount: detail.variableAllowances,
        isTaxable: true,
      })
    }
    if (detail.overtimePay > 0) {
      earnings.push({
        name: `Upah Lembur (${detail.overtimeHours} Jam)`,
        amount: detail.overtimePay,
        isTaxable: true,
      })
    }
  }

  const deductions: { name: string; amount: number }[] = cashComponents
    ? cashComponents.filter((line) => resolveComponentParameters(line).thpEffect === 'subtract' && line.amount !== 0).map((line) => ({ name: line.name, amount: line.amount }))
    : []
  if (!cashComponents) {
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
  const employeeTax = detail.pph21EmployeeDeduction ?? detail.pph21Tax
  if (employeeTax > 0) {
    deductions.push({ name: 'Pajak PPh 21 Bulanan', amount: employeeTax })
  } else if (employeeTax < 0) {
    earnings.push({
      name: 'Pengembalian PPh 21',
      amount: Math.abs(employeeTax),
      isTaxable: false,
    })
  }
  if (detail.thrTaxInstallment && detail.thrTaxInstallment > 0) {
    deductions.push({
      name: `Cicilan PPh 21 THR (Bln ${detail.thrTaxInstallmentInfo?.currentInstallmentMonth || 1}/${detail.thrTaxInstallmentInfo?.tenorMonths || 3})`,
      amount: detail.thrTaxInstallment,
    })
  }
  if (deductionLines?.length) {
    deductions.push(...deductionLines.map((line) => ({ name: line.name, amount: line.amount })))
  } else {
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
      deductions.push({ name: 'Potongan Pinjaman / Lainnya', amount: detail.loanDeduction })
    }
  }

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
    joinDate: detail.joinDate ?? '',
    ptkpStatus: detail.ptkpStatus,
    npwp: detail.npwp ?? '',
    bankName: detail.bankName,
    bankAccountNumber: detail.bankAccountNumber,
    earnings,
    deductions,
    totalEarnings: earnings.reduce((total, item) => total + item.amount, 0),
    totalDeductions: deductions.reduce((total, item) => total + item.amount, 0),
    netPay: detail.netTakeHomePay,
    status: detail.status === 'paid' ? 'sent' : 'draft',
    sentAt: detail.status === 'paid' ? `${paymentDate}, 09:00` : undefined,
  }
}
