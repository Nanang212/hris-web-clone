import axios from 'axios'

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
} from '@/features/settings/role-access/data/types'

type RolePermissionMatrixApiResponse = Omit<RolePermissionMatrix, 'modules'> & {
  modules: Array<
    Omit<RolePermissionModule, 'scope'> & { scope: RolePermissionModule['scope'] | 'Restricted' }
  >
}

/**
 * Helper function untuk menangani error HTTP/Axios secara konsisten
 */
function handleApiError(err: unknown): never {
  if (axios.isAxiosError<Envelope<unknown>>(err)) {
    const backendMessage = err.response?.data?.messages?.[0]
    const errorMessage = backendMessage || err.response?.data?.code || err.message
    throw new Error(errorMessage)
  }
  throw err instanceof Error ? err : new Error('An unexpected error occurred')
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

/**
 * Endpoint: `/api/v1/user-roles/stats`
 * Method: `GET`
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "activeRoles": 6,
 *     "userAssignments": 202,
 *     "permissionSets": 3
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getRoleStats(): Promise<RoleStats> {
  try {
    const res = await apiClient.get<Envelope<RoleStats>>('/api/v1/user-roles/stats')
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/eligibility-options`
 * Method: `GET`
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "departments": [
 *       { "id": "dept-hr", "name": "Human Resources" },
 *       { "id": "dept-tech", "name": "Technology" }
 *     ],
 *     "branches": [
 *       { "id": "branch-jakarta", "name": "Jakarta HQ" },
 *       { "id": "branch-bandung", "name": "Bandung" }
 *     ]
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getRoleEligibilityOptions(): Promise<RoleEligibilityOptions> {
  try {
    const res = await apiClient.get<Envelope<RoleEligibilityOptions>>(
      '/api/v1/user-roles/eligibility-options',
    )
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles`
 * Method: `GET`
 * Query Params: ?search=...&status=...
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": [
 *     {
 *       "id": "role-1",
 *       "name": "Super Admin",
 *       "code": "SUPER_ADMIN",
 *       "users": 2,
 *       "scope": "Company",
 *       "coverage": "100%",
 *       "updatedAt": "08 Aug 2026",
 *       "status": "Active",
 *       "description": "Full system access and administrator controls."
 *     },
 *     {
 *       "id": "role-2",
 *       "name": "Admin",
 *       "code": "ADMIN",
 *       "users": 4,
 *       "scope": "Company",
 *       "coverage": "82%",
 *       "updatedAt": "07 Aug 2026",
 *       "status": "Active",
 *       "description": "General administrative operations and module configurations."
 *     }
 *   ],
 *   "messages": []
 * }
 * ```
 */
export async function getRoles(params?: RoleFilterParams): Promise<Role[]> {
  try {
    const res = await apiClient.get<Envelope<Role[]>>('/api/v1/user-roles', { params })
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/edit/:id`
 * Method: `GET`
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "id": "role-1",
 *     "name": "Super Admin",
 *     "code": "SUPER_ADMIN",
 *     "users": 2,
 *     "scope": "Company",
 *     "coverage": "100%",
 *     "updatedAt": "08 Aug 2026",
 *     "status": "Active",
 *     "description": "Full system access and administrator controls.",
 *     "eligibleDepartments": ["dept-hr", "dept-tech"],
 *     "eligibleBranches": ["branch-jakarta", "branch-bandung"]
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getRoleById(id: string): Promise<Role> {
  try {
    const res = await apiClient.get<Envelope<Role>>(`/api/v1/user-roles/edit/${id}`)
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles`
 * Method: `POST`
 * Body Payload: CreateRolePayload
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "CREATED",
 *   "data": {
 *     "id": "role-7",
 *     "name": "HR Supervisor",
 *     "code": "HR_SUPERVISOR",
 *     "users": 0,
 *     "scope": "Company",
 *     "coverage": "0%",
 *     "updatedAt": "14 Aug 2026",
 *     "status": "Active",
 *     "description": "Supervises HR operations, employee data, attendance approvals.",
 *     "allowMultipleRoles": true,
 *     "accessExpiry": "No expiry",
 *     "eligibleDepartments": ["dept-hr", "dept-tech"],
 *     "eligibleBranches": ["branch-jakarta", "branch-bandung"]
 *   },
 *   "messages": ["Role created successfully"]
 * }
 * ```
 */
export async function createRole(payload: CreateRolePayload): Promise<Role> {
  try {
    const res = await apiClient.post<Envelope<Role>>('/api/v1/user-roles', payload)
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/:id`
 * Method: `PUT`
 * Body Payload: UpdateRolePayload
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "id": "role-1",
 *     "name": "Super Admin Updated",
 *     "code": "SUPER_ADMIN",
 *     "users": 2,
 *     "scope": "Company",
 *     "coverage": "100%",
 *     "updatedAt": "14 Aug 2026",
 *     "status": "Active",
 *     "eligibleDepartments": ["dept-hr"],
 *     "eligibleBranches": ["branch-jakarta"]
 *   },
 *   "messages": ["Role updated successfully"]
 * }
 * ```
 */
export async function updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
  try {
    const res = await apiClient.put<Envelope<Role>>(`/api/v1/user-roles/${id}`, payload)
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/:id`
 * Method: `DELETE`
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": null,
 *   "messages": ["Role deleted successfully"]
 * }
 * ```
 */
export async function deleteRole(id: string): Promise<void> {
  try {
    await apiClient.delete<Envelope<null>>(`/api/v1/user-roles/${id}`)
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/:id/assignments`
 * Method: `GET`
 * Mengembalikan user yang sudah assigned serta user dari department dan branch yang eligible.
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "roleId": "role-1",
 *     "users": [
 *       {
 *         "id": "user-1",
 *         "employeeId": "NIP 10034",
 *         "name": "Rama Wijaya",
 *         "position": "HR Manager",
 *         "department": "Human Resources",
 *         "branch": "Jakarta HQ",
 *         "status": "Assigned"
 *       },
 *       {
 *         "id": "user-2",
 *         "employeeId": "NIP 10041",
 *         "name": "Dewi Kartika",
 *         "position": "HR Specialist",
 *         "department": "Human Resources",
 *         "branch": "Jakarta HQ",
 *         "status": "Eligible"
 *       }
 *     ]
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getRoleAssignments(id: string): Promise<RoleAssignments> {
  try {
    const res = await apiClient.get<Envelope<RoleAssignments>>(
      `/api/v1/user-roles/${id}/assignments`,
    )
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/:id/assignments`
 * Method: `POST`
 * Body Payload: `AssignRoleUsersPayload`
 *
 * Contoh Request JSON:
 * ```json
 * {
 *   "userIds": ["user-2", "user-3"],
 *   "effectiveDate": "2026-08-15",
 *   "notifyUsers": true
 * }
 * ```
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "roleId": "role-1",
 *     "users": [
 *       {
 *         "id": "user-2",
 *         "employeeId": "NIP 10041",
 *         "name": "Dewi Kartika",
 *         "position": "HR Specialist",
 *         "department": "Human Resources",
 *         "branch": "Jakarta HQ",
 *         "status": "Assigned"
 *       },
 *       {
 *         "id": "user-3",
 *         "employeeId": "NIP 10115",
 *         "name": "Budi Setiawan",
 *         "position": "Employee",
 *         "department": "Technology",
 *         "branch": "Bandung",
 *         "status": "Assigned"
 *       }
 *     ]
 *   },
 *   "messages": ["2 users assigned successfully"]
 * }
 * ```
 */
export async function assignRoleUsers(
  id: string,
  payload: AssignRoleUsersPayload,
): Promise<RoleAssignments> {
  try {
    const res = await apiClient.post<Envelope<RoleAssignments>>(
      `/api/v1/user-roles/${id}/assignments`,
      payload,
    )
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/:id/assignments/:userId`
 * Method: `DELETE`
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": null,
 *   "messages": ["User removed from role successfully"]
 * }
 * ```
 */
export async function removeRoleUser(id: string, userId: string): Promise<void> {
  try {
    await apiClient.delete<Envelope<null>>(`/api/v1/user-roles/${id}/assignments/${userId}`)
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/:id/assignments`
 * Method: `DELETE`
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": null,
 *   "messages": ["All users removed from role successfully"]
 * }
 * ```
 */
export async function removeAllRoleUsers(id: string): Promise<void> {
  try {
    await apiClient.delete<Envelope<null>>(`/api/v1/user-roles/${id}/assignments`)
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/:id/permissions`
 * Method: `GET`
 * Nilai `defaultDataScope` dan `modules[].scope`: `Company`, `Administrator`, atau `Self`.
 * Response legacy dengan scope `Restricted` dinormalisasi menjadi `Administrator`.
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "roleId": "role-1",
 *     "roleName": "Super Admin",
 *     "userCount": 2,
 *     "defaultDataScope": "Company",
 *     "modules": [
 *       {
 *         "id": "employee-management",
 *         "name": "Employee Management",
 *         "category": "HR Core",
 *         "scope": "Company",
 *         "permissions": {
 *           "view": true,
 *           "create": true,
 *           "edit": true,
 *           "delete": false,
 *           "approve": false,
 *           "export": true,
 *           "configure": false
 *         }
 *       }
 *     ]
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getRolePermissions(id: string): Promise<RolePermissionMatrix> {
  try {
    const res = await apiClient.get<Envelope<RolePermissionMatrixApiResponse>>(
      `/api/v1/user-roles/${id}/permissions`,
    )
    return normalizeRolePermissionMatrix(res.data.data)
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Endpoint: `/api/v1/user-roles/:id/permissions`
 * Method: `PUT`
 * Body Payload: `UpdateRolePermissionsPayload`
 * Nilai `defaultDataScope` dan `modules[].scope`: `Company`, `Administrator`, atau `Self`.
 *
 * Contoh Request JSON:
 * ```json
 * {
 *   "defaultDataScope": "Company",
 *   "modules": [
 *     {
 *       "id": "employee-management",
 *       "name": "Employee Management",
 *       "category": "HR Core",
 *       "scope": "Company",
 *       "permissions": {
 *         "view": true,
 *         "create": true,
 *         "edit": true,
 *         "delete": false,
 *         "approve": false,
 *         "export": true,
 *         "configure": false
 *       }
 *     }
 *   ]
 * }
 * ```
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "roleId": "role-1",
 *     "roleName": "Super Admin",
 *     "userCount": 2,
 *     "defaultDataScope": "Company",
 *     "modules": [
 *       {
 *         "id": "employee-management",
 *         "name": "Employee Management",
 *         "category": "HR Core",
 *         "scope": "Company",
 *         "permissions": {
 *           "view": true,
 *           "create": true,
 *           "edit": true,
 *           "delete": false,
 *           "approve": false,
 *           "export": true,
 *           "configure": false
 *         }
 *       }
 *     ]
 *   },
 *   "messages": ["Role permissions updated successfully"]
 * }
 * ```
 */
export async function updateRolePermissions(
  id: string,
  payload: UpdateRolePermissionsPayload,
): Promise<RolePermissionMatrix> {
  try {
    const res = await apiClient.put<Envelope<RolePermissionMatrixApiResponse>>(
      `/api/v1/user-roles/${id}/permissions`,
      payload,
    )
    return normalizeRolePermissionMatrix(res.data.data)
  } catch (err) {
    handleApiError(err)
  }
}
