export type RoleScope = 'Company' | 'Team' | 'Self'
export type RoleStatus = 'Active' | 'Inactive' | 'Draft'

export type Role = {
  id: string
  name: string
  code: string
  users: number
  scope: RoleScope
  coverage: string
  updatedAt: string
  status: RoleStatus
  description?: string
  allowMultipleRoles?: boolean
  accessExpiry?: string
  eligibleDepartments?: string[]
  eligibleBranches?: string[]
  action?: string
}

export type RoleStats = {
  activeRoles: number
  userAssignments: number
  permissionSets: number
}

export type RoleFilterParams = {
  search?: string
  status?: string
}

export type CreateRolePayload = {
  name: string
  code: string
  status: RoleStatus
  description: string
  allowMultipleRoles: boolean
  accessExpiry: string
  eligibleDepartments: string[]
  eligibleBranches: string[]
}

export type UpdateRolePayload = Partial<CreateRolePayload>

export type UserAssignmentStatus = 'Assigned' | 'Eligible'

export type RoleAssignmentUser = {
  id: string
  employeeId: string
  name: string
  position: string
  department: string
  branch: string
  status: UserAssignmentStatus
}

export type RoleAssignments = {
  roleId: string
  users: RoleAssignmentUser[]
}

export type AssignRoleUsersPayload = {
  userIds: string[]
  effectiveDate: string
  notifyUsers: boolean
}

export type RoleEligibilityOption = {
  id: string
  name: string
}

export type RoleEligibilityOptions = {
  departments: RoleEligibilityOption[]
  branches: RoleEligibilityOption[]
}

export type PermissionAction =
  'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'configure'

export type PermissionDataScope = 'Self' | 'Department' | 'Branch' | 'Company'
export type PermissionModuleScope = 'Company' | 'Restricted'

export type PermissionFlags = Record<PermissionAction, boolean>

export type RolePermissionModule = {
  id: string
  name: string
  category: string
  scope: PermissionModuleScope
  permissions: PermissionFlags
}

export type RolePermissionMatrix = {
  roleId: string
  roleName: string
  userCount: number
  defaultDataScope: PermissionDataScope
  modules: RolePermissionModule[]
}

export type UpdateRolePermissionsPayload = {
  defaultDataScope: PermissionDataScope
  modules: RolePermissionModule[]
}
