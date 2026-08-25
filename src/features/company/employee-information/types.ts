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
