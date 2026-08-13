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
  requireReview?: boolean
  reviewFrequency?: string
  accessExpiry?: string
  action?: string
}

export interface RoleStats {
  activeRoles: number
  userAssignments: number
  permissionSets: number
  accessReviews: number
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
  requireReview: boolean
  reviewFrequency: string
  accessExpiry: string
}

export interface UpdateRolePayload extends Partial<CreateRolePayload> {}
