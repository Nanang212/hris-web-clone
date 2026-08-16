import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  AssignRoleUsersPayload,
  CreateRolePayload,
  Role,
  RoleAssignments,
  RoleEligibilityOptions,
  RoleFilterParams,
  RolePermissionMatrix,
  RolePermissionModule,
  RoleStats,
  UpdateRolePayload,
  UpdateRolePermissionsPayload,
} from '@/features/settings/role-access/types'

interface RolePermissionModuleApiResponse extends Omit<RolePermissionModule, 'scope'> {
  scope: RolePermissionModule['scope'] | 'Restricted'
}

interface RolePermissionMatrixApiResponse extends Omit<RolePermissionMatrix, 'modules'> {
  modules: RolePermissionModuleApiResponse[]
}

function normalizeRolePermissionMatrix(
  matrix: RolePermissionMatrixApiResponse,
): RolePermissionMatrix {
  return {
    ...matrix,
    modules: matrix.modules.map((module) => ({
      ...module,
      name: module.id === 'user-role' ? 'Role & Access' : module.name,
      scope: module.scope === 'Restricted' ? 'Administrator' : module.scope,
    })),
  }
}

function normalizePermissionEnvelope(
  envelope: Envelope<RolePermissionMatrixApiResponse>,
): Envelope<RolePermissionMatrix> {
  return { ...envelope, data: normalizeRolePermissionMatrix(envelope.data) }
}

/**
 * Endpoint: `/api/v1/role-access/stats`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "activeRoles": 6, "userAssignments": 202, "permissionSets": 3 }, "messages": [] }`
 */
export async function getRoleStats() {
  const res = await apiClient.get<Envelope<RoleStats>>('/api/v1/role-access/stats')
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/eligibility-options`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "departments": [{ "id": "dept-hr", "name": "Human Resources" }], "branches": [{ "id": "branch-jakarta", "name": "Jakarta HQ" }] }, "messages": [] }`
 */
export async function getRoleEligibilityOptions() {
  const res = await apiClient.get<Envelope<RoleEligibilityOptions>>(
    '/api/v1/role-access/eligibility-options',
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": [{ "id": "role-1", "name": "Super Admin", "code": "SUPER_ADMIN", "users": 2, "scope": "Company", "coverage": "100%", "updatedAt": "16 Aug 2026", "status": "Active" }], "messages": [] }`
 */
export async function getRoles(params?: RoleFilterParams) {
  const res = await apiClient.get<Envelope<Role[]>>('/api/v1/role-access', { params })
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/edit/:id`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "id": "role-1", "name": "Super Admin", "code": "SUPER_ADMIN", "users": 2, "scope": "Company", "coverage": "100%", "updatedAt": "16 Aug 2026", "status": "Active", "eligibleDepartments": ["dept-hr"], "eligibleBranches": ["branch-jakarta"] }, "messages": [] }`
 */
export async function getRoleById(id: string) {
  const res = await apiClient.get<Envelope<Role>>(`/api/v1/role-access/edit/${id}`)
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "CREATED", "data": { "id": "role-7", "name": "HR Supervisor", "code": "HR_SUPERVISOR", "users": 0, "scope": "Company", "coverage": "0%", "updatedAt": "16 Aug 2026", "status": "Active" }, "messages": ["Role created successfully"] }`
 */
export async function createRole(payload: CreateRolePayload) {
  const res = await apiClient.post<Envelope<Role>>('/api/v1/role-access', payload)
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/:id`
 * Method: `PUT`
 * Expected response: `{ "success": true, "code": "OK", "data": { "id": "role-1", "name": "Super Admin", "code": "SUPER_ADMIN", "users": 2, "scope": "Company", "coverage": "100%", "updatedAt": "16 Aug 2026", "status": "Active" }, "messages": ["Role updated successfully"] }`
 */
export async function updateRole(id: string, payload: UpdateRolePayload) {
  const res = await apiClient.put<Envelope<Role>>(`/api/v1/role-access/${id}`, payload)
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/:id`
 * Method: `DELETE`
 * Expected response: `{ "success": true, "code": "OK", "data": null, "messages": ["Role deleted successfully"] }`
 */
export async function deleteRole(id: string) {
  const res = await apiClient.delete<Envelope<null>>(`/api/v1/role-access/${id}`)
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/:id/assignments`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "roleId": "role-1", "users": [{ "id": "user-1", "employeeId": "NIP 10034", "name": "Rama Wijaya", "position": "HR Manager", "department": "Human Resources", "branch": "Jakarta HQ", "status": "Assigned" }] }, "messages": [] }`
 */
export async function getRoleAssignments(id: string) {
  const res = await apiClient.get<Envelope<RoleAssignments>>(
    `/api/v1/role-access/${id}/assignments`,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/:id/assignments`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "OK", "data": { "roleId": "role-1", "users": [{ "id": "user-2", "employeeId": "NIP 10041", "name": "Dewi Kartika", "position": "HR Specialist", "department": "Human Resources", "branch": "Jakarta HQ", "status": "Assigned" }] }, "messages": ["Users assigned successfully"] }`
 */
export async function assignRoleUsers(id: string, payload: AssignRoleUsersPayload) {
  const res = await apiClient.post<Envelope<RoleAssignments>>(
    `/api/v1/role-access/${id}/assignments`,
    payload,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/:id/assignments/:userId`
 * Method: `DELETE`
 * Expected response: `{ "success": true, "code": "OK", "data": null, "messages": ["User removed from role successfully"] }`
 */
export async function removeRoleUser(id: string, userId: string) {
  const res = await apiClient.delete<Envelope<null>>(
    `/api/v1/role-access/${id}/assignments/${userId}`,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/:id/assignments`
 * Method: `DELETE`
 * Expected response: `{ "success": true, "code": "OK", "data": null, "messages": ["All users removed from role successfully"] }`
 */
export async function removeAllRoleUsers(id: string) {
  const res = await apiClient.delete<Envelope<null>>(`/api/v1/role-access/${id}/assignments`)
  return res.data
}

/**
 * Endpoint: `/api/v1/role-access/:id/permissions`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "roleId": "role-1", "roleName": "Super Admin", "userCount": 2, "defaultDataScope": "Company", "modules": [{ "id": "employee-management", "name": "Employee Management", "category": "HR Core", "scope": "Company", "permissions": { "view": true, "create": true, "edit": true, "delete": false, "approve": false, "export": true, "configure": false } }] }, "messages": [] }`
 */
export async function getRolePermissions(id: string) {
  const res = await apiClient.get<Envelope<RolePermissionMatrixApiResponse>>(
    `/api/v1/role-access/${id}/permissions`,
  )
  return normalizePermissionEnvelope(res.data)
}

/**
 * Endpoint: `/api/v1/role-access/:id/permissions`
 * Method: `PUT`
 * Expected response: `{ "success": true, "code": "OK", "data": { "roleId": "role-1", "roleName": "Super Admin", "userCount": 2, "defaultDataScope": "Company", "modules": [{ "id": "employee-management", "name": "Employee Management", "category": "HR Core", "scope": "Company", "permissions": { "view": true, "create": true, "edit": true, "delete": false, "approve": false, "export": true, "configure": false } }] }, "messages": ["Role permissions updated successfully"] }`
 */
export async function updateRolePermissions(id: string, payload: UpdateRolePermissionsPayload) {
  const res = await apiClient.put<Envelope<RolePermissionMatrixApiResponse>>(
    `/api/v1/role-access/${id}/permissions`,
    payload,
  )
  return normalizePermissionEnvelope(res.data)
}
