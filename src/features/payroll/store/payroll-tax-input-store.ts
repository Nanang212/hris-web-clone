import { create } from 'zustand'

import type { TaxYearToDateInput } from '../types'
import { initialPayrollEmployeeInputs } from '../data/mock-payroll-inputs'

export function payrollTaxIdentityKey(year: number, employeeId: string, nik?: string): string {
  const identity = nik ?? initialPayrollEmployeeInputs.find((employee) => employee.employeeId === employeeId)?.nik
  return `${year}:${identity && /^\d{16}$/.test(identity) ? identity : employeeId}`
}

interface PayrollTaxInputStoreState {
  taxYearToDateOverrides: Record<string, TaxYearToDateInput>
  setTaxYearToDate: (year: number, employeeId: string, value: TaxYearToDateInput) => void
}

/** Tax input stays in memory until the payroll backend provides secure persistence. */
export const usePayrollTaxInputStore = create<PayrollTaxInputStoreState>((set) => ({
  taxYearToDateOverrides: {},
  setTaxYearToDate: (year, employeeId, value) =>
    set((state) => ({
      taxYearToDateOverrides: {
        ...state.taxYearToDateOverrides,
        [payrollTaxIdentityKey(year, employeeId)]: value,
      },
    })),
}))
