export type EmployeeInformationStatus = 'Active' | 'OnLeave' | 'Probation' | 'Resigned' | 'Inactive'

export type EmployeeInformationEmploymentType =
  'Permanent' | 'Contract' | 'Internship' | 'Freelance'

export interface EmployeeInformationFilterParams {
  search?: string
  employeeIds?: string[]
  departmentId?: string
  status?: EmployeeInformationStatus
  employmentType?: EmployeeInformationEmploymentType
  page?: number
  limit?: number
}

export interface EmployeeInformationFilterOption {
  value: string
  label: string
}

export interface EmployeeInformationStats {
  totalEmployees: number
  totalChangePercent: number
  activeEmployees: number
  activeChangePercent: number
  onLeaveEmployees: number
  onLeaveChangePercent: number
  resignedThisMonth: number
  resignedChangePercent: number
}

export interface DepartmentDistributionItem {
  departmentId: string
  departmentName: string
  employeeCount: number
  percentage: number
  color: string
}

export interface EmployeeInformationOverviewData {
  stats: EmployeeInformationStats
  departmentDistribution: DepartmentDistributionItem[]
  filterOptions: {
    departments: EmployeeInformationFilterOption[]
    statuses: EmployeeInformationStatus[]
    employmentTypes: EmployeeInformationEmploymentType[]
  }
  updatedAt: string
}

export interface EmployeeInformationItem {
  id: string
  employeeNumber: string
  fullName: string
  email: string
  avatarUrl: string | null
  departmentId: string
  departmentName: string
  positionName: string
  status: EmployeeInformationStatus
  employmentType: EmployeeInformationEmploymentType
  joinDate: string
}

export interface EmployeeInformationListData {
  items: EmployeeInformationItem[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface EmployeeInformationActionData {
  employeeId: string
  completedAt: string
}

export interface UpdateEmployeeStatusPayload {
  status: EmployeeInformationStatus
}

export interface ImportEmployeeInformationData {
  imported: number
  skipped: number
  failed: number
  completedAt: string
}

export type EmployeeGender = 'Male' | 'Female'

export interface EmployeeCreationOption {
  id: string
  name: string
}

export interface EmployeeCreationPositionOption extends EmployeeCreationOption {
  departmentId: string
}

export interface EmployeeCreationOptionsData {
  departments: EmployeeCreationOption[]
  divisions: EmployeeCreationOption[]
  positions: EmployeeCreationPositionOption[]
  grades: EmployeeCreationOption[]
  branches: EmployeeCreationOption[]
  managers: EmployeeCreationOption[]
  banks: EmployeeCreationOption[]
  genders: EmployeeGender[]
  employmentTypes: EmployeeInformationEmploymentType[]
}

export interface EmployeePersonalInformationPayload {
  employeeNumber: string
  fullName: string
  workEmail: string
  phoneNumber?: string
  gender?: EmployeeGender
  birthDate?: string
  address?: string
}

export interface EmployeeEmploymentInformationPayload {
  departmentId: string
  divisionId: string
  positionId: string
  gradeId: string
  branchId: string
  managerId?: string
  employmentType: EmployeeInformationEmploymentType
  joinDate: string
  workLocation: string
}

export interface EmployeePayrollIdentificationPayload {
  bankId: string
  bankAccountNumber: string
  bankAccountHolder: string
  npwpNumber?: string
  bpjsHealthNumber?: string
  bpjsEmploymentNumber?: string
}

export interface CreateEmployeeInformationPayload {
  status: 'Draft' | 'Active'
  personalInformation: EmployeePersonalInformationPayload
  employmentInformation: EmployeeEmploymentInformationPayload
  payrollAndIdentification: EmployeePayrollIdentificationPayload
}

export interface CreateEmployeeInformationRequest {
  payload: CreateEmployeeInformationPayload
  profilePhoto?: File
}

export interface CreateEmployeeInformationData {
  employeeId: string
  employeeNumber: string
  status: 'Draft' | 'Active'
  createdAt: string
}
