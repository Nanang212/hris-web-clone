// src/features/payroll/types/index.ts — Complete TypeScript definitions for Payroll Module

export type PayrollTab = 'overview' | 'configuration' | 'process' | 'approval' | 'payslip'

export type ConfigSubTab =
  | 'general'
  | 'components'
  | 'bpjs-tk'
  | 'bpjs-kes'
  | 'pph21'
  | 'thr'

export type PayrollStatus = 'draft' | 'in_review' | 'approved' | 'disbursed'
export type PayslipStatus = 'draft' | 'published' | 'sent' | 'downloaded'

export interface SalaryComponent {
  id: string
  name: string
  code: string
  type: 'allowance' | 'deduction'
  category: 'fixed' | 'variable' | 'tax' | 'statutory'
  isTaxable: boolean
  isBpjsBase: boolean
  calculationType: 'fixed_amount' | 'percentage' | 'formula' | 'attendance_based'
  defaultAmount: number
  description?: string
  status: 'active' | 'inactive'
}

export interface PayrollRun {
  id: string
  code: string
  period: string // e.g. "May 2026"
  periodMonth: number
  periodYear: number
  cutoffStartDate: string
  cutoffEndDate: string
  paymentDate: string
  totalEmployees: number
  totalGrossPay: number
  totalAllowances: number
  totalDeductions: number
  totalTaxPPh21: number
  totalBpjsTK: number
  totalBpjsKes: number
  totalNetDisbursement: number
  status: PayrollStatus
  attendanceSynced: boolean
  approvalStage: 'hr_review' | 'finance_approval' | 'director_signoff' | 'completed'
  approvedBy?: string
  approvedAt?: string
  disbursedAt?: string
  bankBatchGenerated?: boolean
  notes?: string
}

export interface EmployeePayrollDetail {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  position: string
  employmentType: 'Permanent' | 'Contract' | 'Probation'
  ptkpStatus: string // e.g. "TK/0", "K/1", "K/2"
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
  // Attendance & Working Days
  workingDays: number
  actualPresent: number
  lateCount: number
  absentCount: number
  overtimeHours: number
  // Salary Breakdown
  baseSalary: number
  fixedAllowances: number
  variableAllowances: number
  overtimePay: number
  bonusTHR: number
  totalGross: number
  // Deductions Breakdown
  unpaidLeaveDeduction: number
  lateDeduction: number
  loanDeduction: number
  bpjsTkEmployee: number
  bpjsTkEmployer: number
  bpjsKesEmployee: number
  bpjsKesEmployer: number
  pph21Tax: number
  totalDeductions: number
  // Final Net
  netTakeHomePay: number
  status: 'calculated' | 'verified' | 'paid'
}

export interface PayslipRecord {
  id: string
  payslipNumber: string
  payrollRunId: string
  period: string
  paymentDate: string
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  position: string
  joinDate: string
  ptkpStatus: string
  npwp: string
  bankName: string
  bankAccountNumber: string
  // Detailed Line Items
  earnings: { name: string; amount: number; isTaxable: boolean }[]
  deductions: { name: string; amount: number }[]
  totalEarnings: number
  totalDeductions: number
  netPay: number
  status: PayslipStatus
  sentAt?: string
  downloadedAt?: string
}

export interface BpjsTkConfig {
  jkkRatePercent: number // e.g. 0.24%
  jkmRatePercent: number // e.g. 0.30%
  jhtCompanyPercent: number // 3.7%
  jhtEmployeePercent: number // 2.0%
  jpCompanyPercent: number // 2.0%
  jpEmployeePercent: number // 1.0%
  jpMaxWageCap: number // Rp 10,042,300
}

export interface BpjsKesConfig {
  companyRatePercent: number // 4.0%
  employeeRatePercent: number // 1.0%
  maxWageCap: number // Rp 12,000,000
  includeFamilyMembers: boolean
}

export interface Pph21Config {
  taxMethod: 'gross' | 'nett' | 'gross_up'
  useTERScheme: boolean
  ptkpTK0: number
  ptkpK0: number
  ptkpK1: number
  ptkpK2: number
  ptkpK3: number
}

export interface GeneralPayrollConfig {
  cutoffStartDay: number // e.g. 21
  cutoffEndDay: number // e.g. 20
  payDay: number // e.g. 25
  prorateMethod: 'working_days' | 'calendar_days'
  standardWorkDaysPerMonth: number // 21 or 22
  overtimeHourlyRateDivider: number // 173
  taxBorneByCompany: boolean
}
