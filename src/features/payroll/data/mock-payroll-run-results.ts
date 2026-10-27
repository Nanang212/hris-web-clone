import {
  calculatePayroll,
  type CalculatePayrollParams,
} from '@/features/payroll/lib/calculate-payroll'
import type { PayrollRunResult } from '@/features/payroll/store/payroll-run-store'
import type { PayrollRun } from '@/features/payroll/types'

import {
  initialBpjsKesConfig,
  initialBpjsTkConfig,
  initialGeneralConfig,
  initialPayrollRuns,
  initialPph21Config,
} from './mock-payroll-data'
import { initialPayrollEmployeeInputs } from './mock-payroll-inputs'

/** Explicit demo fixtures only, never a fallback for an unknown or backend-supplied batch. */
export function createMockPayrollRunResults() {
  const resultsByRunId: Record<string, PayrollRunResult> = {}
  const editableDraft: PayrollRun = {
    id: 'pay-run-2026-07-demo',
    code: 'PR-202607-DEMO',
    period: 'July 2026',
    periodMonth: 7,
    periodYear: 2026,
    cutoffStartDate: '21 Jun 2026',
    cutoffEndDate: '20 Jul 2026',
    paymentDate: '25 Jul 2026',
    totalEmployees: 0,
    totalGrossPay: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    totalTaxPPh21: 0,
    totalBpjsTK: 0,
    totalBpjsKes: 0,
    totalNetDisbursement: 0,
    status: 'draft',
    attendanceSynced: true,
    approvalStage: 'hr_review',
    bankBatchGenerated: false,
  }
  // Summary placeholders above are replaced by the calculated six-employee dataset below.
  const runs: PayrollRun[] = [editableDraft, ...initialPayrollRuns].map((run) => {
    const monthOffset = run.periodMonth - 5
    const employees = structuredClone(initialPayrollEmployeeInputs).map((employee, index) => ({
      ...employee,
      baseSalary: employee.baseSalary + monthOffset * 100_000,
      // The original YTD fixtures model a different period; regular demo batches do not reuse them.
      taxYearToDate: undefined,
      variableComponents: employee.variableComponents.map((line) => ({
        ...line,
        amount: Math.max(0, line.amount + monthOffset * 25_000),
      })),
      attendance: {
        workingDays: 22,
        actualPresent: 22 - ((index + run.periodMonth) % 3),
        absentCount: (index + run.periodMonth) % 3,
        lateCount: (index + run.periodMonth) % 4,
        overtimeHours: (index * 3 + run.periodMonth) % 15,
      },
      thrTaxInstallment: employee.thrTaxInstallment
        ? {
            ...employee.thrTaxInstallment,
            currentInstallmentMonth: Math.min(
              employee.thrTaxInstallment.tenorMonths,
              run.periodMonth - 3,
            ),
          }
        : undefined,
    }))
    const projectIds = [...new Set(employees.map((employee) => employee.projectId))]
    const calculation: CalculatePayrollParams = {
      employees,
      billing: [],
      bpjsKesConfig: structuredClone(initialBpjsKesConfig),
      bpjsTkConfig: structuredClone(initialBpjsTkConfig),
      generalConfig: structuredClone(initialGeneralConfig),
      pph21Config: structuredClone(initialPph21Config),
      wageCapRules: [],
      tkProjectSettings: projectIds.map((projectId, index) => ({
        id: `demo-tk-${run.id}-${index}`,
        projectId,
        effectiveFrom: '2026-01',
        jkkRatePercent: index % 2 === 0 ? 0.24 : 0.54,
        jhtActive: true,
        jpActive: index % 2 === 0,
      })),
      periodKey: `${run.periodYear}-${String(run.periodMonth).padStart(2, '0')}`,
      includeThrInstallment: true,
    }
    const result = calculatePayroll(calculation)
    const details = result.details.map((detail) => ({
      ...detail,
      id: `${run.id}-${detail.employeeId}`,
      status: run.status === 'disbursed' ? ('paid' as const) : ('calculated' as const),
    }))
    resultsByRunId[run.id] = {
      details,
      sourceDetails: structuredClone(details),
      unmatchedBilling: result.unmatchedBilling,
      calculation,
      overrides: {},
      dirtyEmployeeIds: [],
      revision: 0,
      calculatedAt: `${run.periodYear}-${String(run.periodMonth).padStart(2, '0')}-24T02:00:00.000Z`,
    }
    return {
      ...run,
      runType: 'REGULAR',
      totalEmployees: result.summary.employeeCount,
      totalGrossPay: result.summary.totalGross,
      totalAllowances: result.summary.totalAllowances,
      totalDeductions: result.summary.totalDeductions,
      totalTaxPPh21: result.summary.totalTaxPPh21,
      totalBpjsTK: result.summary.totalBpjsTK,
      totalBpjsKes: result.summary.totalBpjsKes,
      totalNetDisbursement: result.summary.totalNet,
    }
  })
  return { runs, resultsByRunId }
}
