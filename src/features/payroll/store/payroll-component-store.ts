import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { EmployeePayrollComponent, PayrollInputLine } from '../types'

interface PayrollComponentStoreState {
  employeeComponents: EmployeePayrollComponent[]
  addEmployeeComponent: (component: EmployeePayrollComponent) => void
  updateEmployeeComponent: (component: EmployeePayrollComponent) => void
  removeEmployeeComponent: (id: string) => void
  toggleEmployeeComponent: (id: string) => void
  applyPayrollPeriod: (periodKey: string, employeeIds: string[]) => void
}

const initialEmployeeComponents: EmployeePayrollComponent[] = [
  {
    id: 'employee-component-loan-1',
    employeeId: 'EMP002',
    employeeName: 'Siti Aminah',
    employeeCode: 'EMP002',
    name: 'Cicilan Pinjaman Karyawan',
    code: 'DED_LOAN_SITI',
    type: 'deduction',
    amount: 500_000,
    frequency: 'installment',
    startPeriod: '2026-01',
    endPeriod: '2026-12',
    originalAmount: 6_000_000,
    remainingBalance: 3_000_000,
    status: 'active',
    notes: 'Cicilan pinjaman perusahaan, tidak mengurangi bruto pajak.',
  },
  {
    id: 'employee-component-arrears-1',
    employeeId: 'EMP003',
    employeeName: 'Budi Santoso',
    employeeCode: 'EMP003',
    name: 'Rapel Koreksi Gaji',
    code: 'ARREARS_BUDI_202607',
    type: 'allowance',
    amount: 750_000,
    frequency: 'one_time',
    startPeriod: '2026-07',
    endPeriod: '2026-07',
    status: 'active',
  },
  {
    id: 'employee-component-zakat-1',
    employeeId: 'EMP005',
    employeeName: 'Andi Pratama',
    employeeCode: 'EMP005',
    name: 'Zakat melalui Payroll',
    code: 'QUALIFIED_ZAKAT_ANDI',
    type: 'deduction',
    amount: 150_000,
    frequency: 'recurring',
    startPeriod: '2026-01',
    status: 'active',
  },
]

export function isEmployeeComponentEffective(
  component: EmployeePayrollComponent,
  periodKey: string,
): boolean {
  if (component.status !== 'active') return false
  if (component.startPeriod > periodKey) return false
  if (component.endPeriod && component.endPeriod < periodKey) return false
  if (component.frequency === 'installment' && (component.remainingBalance ?? 0) <= 0) return false
  return true
}

export function employeeComponentToInputLine(
  component: EmployeePayrollComponent,
): PayrollInputLine {
  const amount =
    component.frequency === 'installment'
      ? Math.min(component.amount, component.remainingBalance ?? component.amount)
      : component.amount

  return {
    code: component.code,
    name: component.name,
    type: component.type,
    amount,
    isTaxable: component.type === 'allowance',
    componentKind: component.type === 'allowance' ? 'other_taxable_income' : 'other_deduction',
    cashImpact: true,
  }
}

export const usePayrollComponentStore = create<PayrollComponentStoreState>()(
  persist(
    (set) => ({
      employeeComponents: initialEmployeeComponents,
      addEmployeeComponent: (component) =>
        set((state) => ({
          employeeComponents: [
            ...state.employeeComponents,
            { ...component, id: component.id || crypto.randomUUID() },
          ],
        })),
      updateEmployeeComponent: (component) =>
        set((state) => ({
          employeeComponents: state.employeeComponents.map((item) =>
            item.id === component.id ? component : item,
          ),
        })),
      removeEmployeeComponent: (id) =>
        set((state) => ({
          employeeComponents: state.employeeComponents.filter((item) => item.id !== id),
        })),
      toggleEmployeeComponent: (id) =>
        set((state) => ({
          employeeComponents: state.employeeComponents.map((item) =>
            item.id === id
              ? { ...item, status: item.status === 'active' ? 'paused' : 'active' }
              : item,
          ),
        })),
      applyPayrollPeriod: (periodKey, employeeIds) =>
        set((state) => ({
          employeeComponents: state.employeeComponents.map((item) => {
            if (
              !employeeIds.includes(item.employeeId) ||
              !isEmployeeComponentEffective(item, periodKey)
            ) {
              return item
            }
            if (item.frequency === 'one_time') return { ...item, status: 'completed' }
            if (item.frequency !== 'installment') return item

            const remainingBalance = Math.max(0, (item.remainingBalance ?? 0) - item.amount)
            return {
              ...item,
              remainingBalance,
              status: remainingBalance === 0 ? 'completed' : item.status,
            }
          }),
        })),
    }),
    { name: 'hris_payroll_employee_components_v1' },
  ),
)
