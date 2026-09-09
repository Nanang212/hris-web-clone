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

export interface EmployeeInformationPersonalDetail {
  fullName: string
  email: string
  phoneNumber: string | null
  birthDate: string | null
  gender: string | null
  maritalStatus: string | null
  nationality: string | null
  address: string | null
}

export interface EmployeeInformationEmploymentDetail {
  employeeNumber: string
  joinDate: string
  employmentType: EmployeeInformationEmploymentType
  departmentId: string
  departmentName: string
  divisionId: string
  divisionName: string
  positionId: string
  positionName: string
  gradeId: string | null
  gradeName: string | null
  branchId: string
  supervisorId: string | null
  workLocation: string
  supervisorName: string | null
}

export interface EmployeeInformationEmergencyContactDetail {
  name: string | null
  relationship: string | null
  phoneNumber: string | null
  address: string | null
}

export interface EmployeeInformationDocumentDetail {
  fileName: string | null
  fileSize: number | null
  url: string | null
}

export interface EmployeeInformationBankVerificationDetail {
  status: 'Verified' | 'Pending' | 'Failed' | null
  verifiedAt: string | null
  payrollMappingActive: boolean
}

export interface EmployeeInformationFinancialDetail {
  bankId: string | null
  bankAccountHolder: string | null
  bankName: string | null
  bankAccountNumber: string | null
  bankBranch?: string | null
  bankAccountType?: string | null
  currency?: string | null
  bankEffectiveDate?: string | null
  payrollAccount?: boolean | null
  bankVerification?: EmployeeInformationBankVerificationDetail | null
  npwpNumber: string | null
  npwpStatus: string | null
  npwpRegisteredName?: string | null
  taxCategory?: string | null
  npwpEffectiveDate?: string | null
  taxOffice?: string | null
  npwpDocument?: EmployeeInformationDocumentDetail | null
  bpjsHealthNumber: string | null
  bpjsEmploymentNumber: string | null
}

export interface EmployeeInformationMedicalCheckupDetail {
  status: string | null
  dueDate: string | null
  lastCheckupDate: string | null
  provider?: string | null
  examinationType?: string | null
  followUpRequired?: boolean | null
  administrativeNote?: string | null
  document?: EmployeeInformationDocumentDetail | null
}

export interface EmployeeInformationStatusManagementDetail {
  effectiveDate: string | null
  reason: string | null
  lastWorkingDate: string | null
  notes: string | null
}

export interface EmployeeInformationStatusHistoryItem {
  id: string
  status: EmployeeInformationStatus
  employmentType: EmployeeInformationEmploymentType
  effectiveDate: string
  reason: string | null
}

export interface EmployeeInformationDetailData {
  id: string
  employeeNumber: string
  fullName: string
  email: string
  phoneNumber: string | null
  address: string | null
  avatarUrl: string | null
  status: EmployeeInformationStatus
  positionName: string
  departmentName: string
  divisionName: string
  branchName: string
  gradeName: string | null
  joinDate: string
  employmentType: EmployeeInformationEmploymentType
  personalInformation: EmployeeInformationPersonalDetail
  employmentInformation: EmployeeInformationEmploymentDetail
  emergencyContact: EmployeeInformationEmergencyContactDetail
  financialAndCompliance: EmployeeInformationFinancialDetail
  medicalCheckup: EmployeeInformationMedicalCheckupDetail
  statusManagement?: EmployeeInformationStatusManagementDetail | null
  statusHistory?: EmployeeInformationStatusHistoryItem[]
}

export interface UpdateEmployeeInformationPayload {
  status: EmployeeInformationStatus
  personalInformation: EmployeeInformationPersonalDetail
  employmentInformation: {
    joinDate: string
    employmentType: EmployeeInformationEmploymentType
    departmentId: string
    divisionId: string
    positionId: string
    gradeId?: string
    branchId: string
    supervisorId?: string
    workLocation: string
  }
  emergencyContact: EmployeeInformationEmergencyContactDetail
  financialAndCompliance: {
    bankId?: string
    bankAccountHolder?: string
    bankAccountNumber?: string
    bankBranch?: string
    bankAccountType?: string
    currency?: string
    bankEffectiveDate?: string
    payrollAccount?: boolean
    npwpNumber?: string
    npwpStatus?: string
    npwpRegisteredName?: string
    taxCategory?: string
    npwpEffectiveDate?: string
    taxOffice?: string
    bpjsHealthNumber?: string
    bpjsEmploymentNumber?: string
  }
  medicalCheckup: {
    status: string | null
    dueDate: string | null
    lastCheckupDate: string | null
    provider?: string
    examinationType?: string
    followUpRequired?: boolean
    administrativeNote?: string
  }
  statusChange?: {
    previousStatus: EmployeeInformationStatus
    effectiveDate: string
    reason: string
    lastWorkingDate?: string
    notes: string
  }
  removeProfilePhoto?: boolean
}

export interface UpdateEmployeeInformationRequest {
  employeeId: string
  payload: UpdateEmployeeInformationPayload
  profilePhoto?: File
  npwpDocument?: File
  medicalCheckupDocument?: File
}

export interface EmployeeBankVerificationData {
  employeeId: string
  status: 'Pending'
  requestedAt: string
}
