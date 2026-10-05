// src/features/payroll/lib/bpjs-kes-billing-calc.ts
// Turunan nominal tagihan BPJS Kes dari Upah BPJS + persentase master BPJS Kesehatan.
import type { BpjsKesBillingRecord, BpjsKesConfig } from '../types'

export interface BillingAmounts {
  /** Upah BPJS setelah dibatasi batas upah maksimal. */
  cappedWage: number
  /** Potongan karyawan (% karyawan × upah) — mengurangi THP. */
  employeeShare: number
  /** Bagian perusahaan (% perusahaan × upah) — dasar pajak, tidak dipotong dari gaji. */
  employerShare: number
  /** Pot. keluarga tambahan — mengurangi THP, tidak memengaruhi pajak. */
  familyExtra: number
  /** Nilai tagihan = karyawan + perusahaan + keluarga tambahan. */
  total: number
}

export function computeBillingAmounts(
  record: Pick<BpjsKesBillingRecord, 'bpjsWage' | 'familyExtra'>,
  config: BpjsKesConfig,
): BillingAmounts {
  const cappedWage = config.maxWageCap > 0 ? Math.min(record.bpjsWage, config.maxWageCap) : record.bpjsWage
  const employeeShare = Math.round((cappedWage * config.employeeRatePercent) / 100)
  const employerShare = Math.round((cappedWage * config.companyRatePercent) / 100)
  return {
    cappedWage,
    employeeShare,
    employerShare,
    familyExtra: record.familyExtra,
    total: employeeShare + employerShare + record.familyExtra,
  }
}
