// src/features/payroll/store/payroll-run-store.ts
// Hasil kalkulasi payroll per run (rincian per karyawan + tagihan yang tidak cocok).
import { create } from 'zustand'
import dayjs from 'dayjs'
import type { BpjsKesBillingRecord, EmployeePayrollDetail, PayrollEmployeeOverride, PayrollRun } from '../types'
import type { CalculatePayrollParams } from '../lib/calculate-payroll'
import { calculatePayroll } from '../lib/calculate-payroll'
import { initialPayrollRuns } from '../data/mock-payroll-data'

export interface PayrollRunResult {
  details: EmployeePayrollDetail[]
  unmatchedBilling: BpjsKesBillingRecord[]
  calculation?: CalculatePayrollParams
  overrides?: Record<string, PayrollEmployeeOverride>
  dirtyEmployeeIds?: string[]
  revision?: number
  calculatedAt?: string
  sourceDetails?: EmployeePayrollDetail[]
}

interface PayrollRunStoreState {
  runs: PayrollRun[]
  setRuns: (update: PayrollRun[] | ((runs: PayrollRun[]) => PayrollRun[])) => void
  resultsByRunId: Record<string, PayrollRunResult>
  saveOverride: (runId: string, employeeId: string, value: PayrollEmployeeOverride | null) => void
  recalculate: (run: PayrollRun) => PayrollRun
  setRunResult: (runId: string, result: PayrollRunResult) => void
  updateRunDetails: (runId: string, details: EmployeePayrollDetail[]) => void
}

export const usePayrollRunStore = create<PayrollRunStoreState>()((set, get) => ({
  runs: initialPayrollRuns,
  setRuns: (update) => set((state) => ({ runs: typeof update === 'function' ? update(state.runs) : update })),
  resultsByRunId: {},
  saveOverride: (runId, employeeId, value) => set((state) => {
    const current = state.resultsByRunId[runId]
    const run = state.runs.find((item) => item.id === runId)
    if (!current?.calculation || run?.status !== 'draft') return state
    const overrides = { ...current.overrides }
    if (value) overrides[employeeId] = value
    else delete overrides[employeeId]
    return { resultsByRunId: {
      ...state.resultsByRunId,
      [runId]: { ...current, overrides, revision: (current.revision ?? 0) + 1,
        dirtyEmployeeIds: [...new Set([...(current.dirtyEmployeeIds ?? []), employeeId])] },
    } }
  }),
  recalculate: (run) => {
    const current = get().resultsByRunId[run.id]
    const currentRun = get().runs.find((item) => item.id === run.id)
    if (!current?.calculation || currentRun?.status !== 'draft') throw new Error('PAYROLL_INPUTS_UNAVAILABLE')
    const employees = current.calculation.employees.map((employee) => {
      const override = current.overrides?.[employee.employeeId]
      return override ? { ...employee, ...override, overrides: override } : employee
    })
    const result = calculatePayroll({ ...current.calculation, employees })
    const summary = result.summary
    const updatedRun: PayrollRun = {
      ...currentRun, totalEmployees: summary.employeeCount, totalGrossPay: summary.totalGross,
      totalAllowances: summary.totalAllowances, totalDeductions: summary.totalDeductions,
      totalTaxPPh21: summary.totalTaxPPh21, totalBpjsTK: summary.totalBpjsTK,
      totalBpjsKes: summary.totalBpjsKes, totalNetDisbursement: summary.totalNet,
    }
    set((state) => ({
      runs: state.runs.map((item) => item.id === run.id ? updatedRun : item),
      resultsByRunId: { ...state.resultsByRunId, [run.id]: {
        ...current, ...result, dirtyEmployeeIds: [], calculatedAt: dayjs().toISOString(),
      } },
    }))
    return updatedRun
  },
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
