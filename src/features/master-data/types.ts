// types.ts — Master Data feature types

export type MasterDataStatus = 'active' | 'inactive'

export interface Department {
  id: string
  code: string
  name: string
  managerName: string
  parentDepartmentName: string
  status: MasterDataStatus
}

export interface Division {
  id: string
  code: string
  name: string
  departmentName: string
  description: string
  status: MasterDataStatus
}

export interface Position {
  id: string
  code: string
  name: string
  departmentName: string
  divisionName: string
  jobDescription: string
  status: MasterDataStatus
}

export interface Grade {
  id: string
  code: string
  name: string
  level: number
  minSalary: number
  maxSalary: number
  status: MasterDataStatus
}

export interface Shift {
  id: string
  code: string
  name: string
  startTime: string
  endTime: string
  gracePeriod: number // in minutes
  status: MasterDataStatus
}

export interface Holiday {
  id: string
  name: string
  date: string
  type: 'national' | 'company'
  description: string
  status: MasterDataStatus
}

export interface LeaveType {
  id: string
  code: string
  name: string
  defaultAllowance: number
  isPaid: boolean
  canCarryForward: boolean
  status: MasterDataStatus
}

export interface PayrollComponent {
  id: string
  code: string
  name: string
  type: 'earning' | 'deduction'
  defaultValue: number
  isFormula: boolean
  formula: string
  status: MasterDataStatus
}

export interface MasterDataStats {
  departmentsCount: number
  divisionsCount: number
  positionsCount: number
  gradesCount: number
  shiftsCount: number
  holidaysCount: number
  leaveTypesCount: number
  payrollComponentsCount: number
}
