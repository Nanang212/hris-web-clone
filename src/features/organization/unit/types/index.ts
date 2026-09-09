// src/features/organization/unit/types/index.ts
export type OrgLevel = 'company' | 'division' | 'department' | 'position'

export type OrgStatus = 'active' | 'inactive' | 'draft'

export interface HeadOfUnit {
  id: string
  name: string
  title: string
  avatar?: string
  email?: string
}

export interface OrgMember {
  id: string
  name: string
  nik: string
  title: string
  email: string
  avatar?: string
  departmentName?: string
  divisionName?: string
  status: 'active' | 'probation' | 'contract'
  joinDate?: string
}

export interface OrgNode {
  id: string
  code: string
  name: string
  level: OrgLevel
  parentId: string | null
  parentName?: string
  headOfUnit?: HeadOfUnit
  costCenter?: string
  totalEmployees: number
  totalSubUnits: number
  status: OrgStatus
  description?: string
  members?: OrgMember[]
  children?: OrgNode[]
}

export interface DivisionRecord {
  id: string
  code: string
  name: string
  headOfDivision?: HeadOfUnit
  costCenter: string
  totalDepartments: number
  totalEmployees: number
  status: OrgStatus
  description?: string
  members?: OrgMember[]
  createdAt: string
}

export interface DepartmentRecord {
  id: string
  code: string
  name: string
  divisionId: string
  divisionName: string
  headOfDepartment?: HeadOfUnit
  costCenter: string
  totalPositions: number
  totalEmployees: number
  status: OrgStatus
  description?: string
  members?: OrgMember[]
  createdAt: string
}

export interface PositionRecord {
  id: string
  code: string
  title: string
  departmentId: string
  departmentName: string
  divisionName: string
  jobLevel: string // e.g. 'Executive' | 'Director' | 'Manager' | 'Lead' | 'Senior' | 'Staff'
  jobGrade: string // e.g. 'Grade 7', 'Grade 6', 'Grade 5'
  headcountCurrent: number
  headcountLimit: number
  reportsToPositionId?: string
  reportsToPositionTitle?: string
  status: OrgStatus
  description?: string
  members?: OrgMember[]
  createdAt: string
}

export interface OrgOverviewStats {
  totalDivisions: number
  totalDepartments: number
  totalPositions: number
  totalEmployees: number
  headVacancies: number
  understaffedDepts: number
  openPositions: number
  filledPositions: number
}

export interface AddEditUnitPayload {
  id?: string
  name: string
  code: string
  level: OrgLevel
  parentId: string | null
  headOfUnitName?: string
  headOfUnitTitle?: string
  costCenter?: string
  description?: string
  status: OrgStatus
}

export interface MoveUnitPayload {
  unitId: string
  newParentId: string
  reason?: string
}

export interface DivisionFormPayload {
  id?: string
  name: string
  code: string
  headOfDivisionName?: string
  headOfDivisionTitle?: string
  costCenter: string
  description?: string
  status: OrgStatus
}

export interface DepartmentFormPayload {
  id?: string
  name: string
  code: string
  divisionId: string
  headOfDepartmentName?: string
  headOfDepartmentTitle?: string
  costCenter: string
  description?: string
  status: OrgStatus
}

export interface PositionFormPayload {
  id?: string
  title: string
  code: string
  departmentId: string
  jobLevel: string
  jobGrade: string
  headcountLimit: number
  reportsToPositionId?: string
  description?: string
  status: OrgStatus
}
