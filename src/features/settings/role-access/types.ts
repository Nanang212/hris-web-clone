export type RoleScope = 'Company' | 'Team' | 'Self'
export type RoleStatus = 'Active' | 'Inactive' | 'Draft'

export interface Role {
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

export interface RoleStats {
  activeRoles: number
  userAssignments: number
  permissionSets: number
}

export interface RoleFilterParams {
  search?: string
  status?: string
}

export interface CreateRolePayload {
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

export interface RoleAssignmentUser {
  id: string
  employeeId: string
  name: string
  position: string
  department: string
  branch: string
  status: UserAssignmentStatus
}

export interface RoleAssignments {
  roleId: string
  users: RoleAssignmentUser[]
}

export interface AssignRoleUsersPayload {
  userIds: string[]
  effectiveDate: string
  notifyUsers: boolean
}

export interface RoleEligibilityOption {
  id: string
  name: string
}

export interface RoleEligibilityOptions {
  departments: RoleEligibilityOption[]
  branches: RoleEligibilityOption[]
}

export type PermissionAction =
  'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'configure'

export type PermissionDataScope = 'Company' | 'Administrator' | 'Self'

export type PermissionFlags = Record<PermissionAction, boolean>

export interface RolePermissionModule {
  id: string
  name: string
  category: string
  scope: PermissionDataScope
  permissions: PermissionFlags
}

export interface RolePermissionMatrix {
  roleId: string
  roleName: string
  userCount: number
  defaultDataScope: PermissionDataScope
  modules: RolePermissionModule[]
}

export interface UpdateRolePermissionsPayload {
  defaultDataScope: PermissionDataScope
  modules: RolePermissionModule[]
}
