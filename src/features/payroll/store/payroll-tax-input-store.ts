import { create } from 'zustand'

import type { TaxYearToDateInput } from '../types'

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
        [`${year}:${employeeId}`]: value,
      },
    })),
}))
