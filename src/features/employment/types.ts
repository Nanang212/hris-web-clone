// types.ts — Employment feature types

export type EmployeeStatus = 'active' | 'inactive' | 'probation' | 'resigned' | 'terminated'
export type ContractType = 'permanent' | 'contract' | 'internship' | 'freelance'
export type Gender = 'male' | 'female'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

export interface Employee {
  id: string
  employeeCode: string
  fullName: string
  email: string
  phone: string
  photo: string | null
  departmentId: string
  departmentName: string
  divisionId: string | null
  divisionName: string | null
  positionId: string
  positionName: string
  gradeId: string
  gradeName: string
  status: EmployeeStatus
  contractType: ContractType
  joinDate: string
  endDate: string | null
  managerId: string | null
  managerName: string | null
  workLocation: string
  createdAt: string
  updatedAt: string
}

export interface EmployeePersonalInfo {
  employeeId: string
  nik: string
  birthPlace: string
  birthDate: string
  gender: Gender
  maritalStatus: MaritalStatus
  religion: string
  bloodType: string
  address: string
  city: string
  province: string
  postalCode: string
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string
}

export interface EmployeeEmploymentInfo {
  employeeId: string
  contractType: ContractType
  contractStart: string
  contractEnd: string | null
  shiftId: string
  shiftName: string
  workLocation: string
  managerId: string | null
  managerName: string | null
  bpjsKetenagakerjaanNo: string
  bpjsKesehatanNo: string
  npwp: string
  taxStatus: string
}

export interface EmployeeDocument {
  id: string
  employeeId: string
  name: string
  type: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
}

export interface EmployeePayrollComponent {
  componentId: string
  componentName: string
  componentType: 'earning' | 'deduction'
  amount: number
  isFormula: boolean
  formula: string | null
}

export interface EmployeePayrollInfo {
  employeeId: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  npwp: string
  bpjsKetenagakerjaanNo: string
  bpjsKesehatanNo: string
  basicSalary: number
  components: EmployeePayrollComponent[]
}

export interface EmployeeLeaveBalance {
  leaveTypeId: string
  leaveTypeName: string
  leaveTypeCode: string
  totalBalance: number
  used: number
  remaining: number
  isPaid: boolean
  canCarryForward: boolean
}

export interface EmployeeStats {
  total: number
  active: number
  inactive: number
  probation: number
  newThisMonth: number
}

export interface EmployeeFilterParams {
  search?: string
  departmentId?: string
  positionId?: string
  gradeId?: string
  status?: EmployeeStatus
  contractType?: ContractType
  page?: number
  limit?: number
}

export interface CreateEmployeePayload {
  fullName: string
  email: string
  phone: string
  departmentId: string
  divisionId?: string
  positionId: string
  gradeId: string
  shiftId: string
  contractType: ContractType
  joinDate: string
  endDate?: string
  workLocation: string
  managerId?: string
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  status?: EmployeeStatus
}

export type ContractStatus = 'active' | 'expiring' | 'draft' | 'unsigned'

export interface EmployeeContract {
  id: string
  employeeId: string
  fullName: string
  photo: string | null
  contractNumber: string
  contractType: string
  startDate: string
  endDate: string
  probation: string
  workLocation: string
  positionName: string
  salaryGrade: string
  status: ContractStatus
  documentName: string
  documentSize: string
  reminderActive: boolean
}

