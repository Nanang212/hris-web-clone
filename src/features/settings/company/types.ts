export type CompanyTab = 'overview' | 'locations' | 'branches' | 'edit'

export interface CompanyProfile {
  name: string
  legalName: string
  code: string
  industry: string
  establishedDate: string
  taxId: string
  email: string
  phone: string
  website: string
  description: string
  headOfficeName: string
  cityProvince: string
  country: string
  address: string
  status: 'Active' | 'Inactive'
  logoUrl?: string
  profileCompletion: number
  totalEmployees: number
}

export interface CorporateSettings {
  timezone: string
  workingWeek: string
  defaultCurrency: string
  payrollCutoff: string
  fiscalYear: string
  language: string
}

export type OfficeLocationType = 'Head Office' | 'Branch' | 'Regional' | 'Warehouse' | 'Remote Hub'
export type OfficeStatus = 'Active' | 'Inactive'

export interface LocationEmployee {
  id: string
  name: string
  empCode: string
  position: string
  department: string
  contractType: 'PKWTT' | 'PKWT' | 'Probation'
  joinDate: string
  email: string
}

export interface OfficeLocation {
  id: string
  name: string
  code: string
  branchName: string
  type: OfficeLocationType
  city: string
  address: string
  employeesCount: number
  geofenceRadius: number // in meters
  status: OfficeStatus
  latitude?: number
  longitude?: number
  employees?: LocationEmployee[]
}

export type BranchType = 'Head Office' | 'Branch' | 'Regional' | 'Representative'
export type BranchStatus = 'Active' | 'Inactive'

export interface CompanyBranch {
  id: string
  name: string
  code: string
  type: BranchType
  city: string
  linkedOffice: string
  picName: string
  picEmail: string
  employeesCount: number
  status: BranchStatus
  employees?: LocationEmployee[]
}

export interface CompanyStats {
  profileCompletion: number
  totalBranches: number
  activeBranches: number
  totalLocations: number
  activeLocations: number
  headOfficeCount: number
  totalEmployees: number
  citiesCount: number
}
