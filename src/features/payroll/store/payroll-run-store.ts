// src/features/payroll/store/payroll-run-store.ts
// Hasil kalkulasi payroll per run (rincian per karyawan + tagihan yang tidak cocok).
import { create } from 'zustand'
import type { BpjsKesBillingRecord, EmployeePayrollDetail } from '../types'

interface PayrollRunResult {
  details: EmployeePayrollDetail[]
  unmatchedBilling: BpjsKesBillingRecord[]
}

interface PayrollRunStoreState {
  resultsByRunId: Record<string, PayrollRunResult>
  setRunResult: (runId: string, result: PayrollRunResult) => void
  updateRunDetails: (runId: string, details: EmployeePayrollDetail[]) => void
}

export const usePayrollRunStore = create<PayrollRunStoreState>()((set) => ({
  resultsByRunId: {},
  setRunResult: (runId, result) =>
    set((state) => ({ resultsByRunId: { ...state.resultsByRunId, [runId]: result } })),
  updateRunDetails: (runId, details) =>
    set((state) => {
      const current = state.resultsByRunId[runId]
      if (!current) return state
      return {
        resultsByRunId: { ...state.resultsByRunId, [runId]: { ...current, details } },
      }
    }),
}))
