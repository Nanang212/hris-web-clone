import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  EmployeePayrollComponent,
  PayrollComponentKind,
  PayrollInputLine,
} from '../types'

export const employeeComponentKinds = {
  allowance: [
    'fixed_allowance',
    'variable_allowance',
    'thr_bonus',
    'arrears',
    'other_taxable_income',
    'non_taxable_payment',
    'taxable_benefit',
  ],
  deduction: [
    'qualified_pension',
    'qualified_zakat',
    'loan',
    'cash_advance',
    'other_deduction',
  ],
} as const satisfies Record<EmployeePayrollComponent['type'], readonly PayrollComponentKind[]>

const automaticComponentKinds: readonly PayrollComponentKind[] = [
  'overtime',
  'attendance_reduction',
  'tax_allowance',
]

export function isAutomaticPayrollComponent(component: EmployeePayrollComponent): boolean {
  return automaticComponentKinds.includes(getEmployeeComponentKind(component))
}

export function getEmployeeComponentKind(component: EmployeePayrollComponent): PayrollComponentKind {
  if (component.componentKind) return component.componentKind
  if (component.id === 'employee-component-loan-1') return 'loan'
  if (component.id === 'employee-component-arrears-1') return 'arrears'
  if (component.id === 'employee-component-zakat-1') return 'qualified_zakat'
  return component.type === 'allowance' ? 'other_taxable_income' : 'other_deduction'
}

interface PayrollComponentStoreState {
  employeeComponents: EmployeePayrollComponent[]
  addEmployeeComponent: (component: EmployeePayrollComponent) => void
  addImportedEmployeeComponents: (components: EmployeePayrollComponent[]) => void
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
    componentKind: 'loan',
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
    componentKind: 'arrears',
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
    componentKind: 'qualified_zakat',
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
  if (!isEmployeeComponentInPeriod(component, periodKey)) return false
  if (component.frequency === 'installment' && (component.remainingBalance ?? 0) <= 0) return false
  return true
}

export function isEmployeeComponentInPeriod(
  component: EmployeePayrollComponent,
  periodKey: string,
): boolean {
  if (component.frequency === 'one_time') return component.startPeriod === periodKey
  return component.startPeriod <= periodKey && (!component.endPeriod || component.endPeriod >= periodKey)
}

export function employeeComponentToInputLine(
  component: EmployeePayrollComponent,
): PayrollInputLine {
  const componentKind = getEmployeeComponentKind(component)
  const amount =
    component.frequency === 'installment'
      ? Math.min(component.amount, component.remainingBalance ?? component.amount)
      : component.amount

  return {
    code: component.code,
    name: component.name,
    type: component.type,
    amount,
    isTaxable: component.type === 'allowance' && componentKind !== 'non_taxable_payment',
    componentKind,
    cashImpact: componentKind !== 'taxable_benefit',
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
      addImportedEmployeeComponents: (components) =>
        set((state) => ({
          employeeComponents: [...state.employeeComponents, ...components],
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
              !isEmployeeComponentEffective(item, periodKey) ||
              isAutomaticPayrollComponent(item)
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
