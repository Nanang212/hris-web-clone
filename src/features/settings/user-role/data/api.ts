import axios from 'axios'
import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  CreateRolePayload,
  Role,
  RoleFilterParams,
  RoleStats,
  UpdateRolePayload,
} from '@/features/settings/user-role/data/types'

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

/**
 * GET /api/v1/user-roles/stats
 *
 * Ekspektasi Response JSON:
 * ```json
 * {
 *   "success": true,
 *   "code": "OK",
 *   "data": {
 *     "activeRoles": 6,
 *     "userAssignments": 202,
 *     "permissionSets": 3,
 *     "accessReviews": 4
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getRoleStats(): Promise<RoleStats> {
  try {
    const res = await apiClient.get<Envelope<RoleStats>>('/user-roles/stats')
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * GET /api/v1/user-roles
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
    const res = await apiClient.get<Envelope<Role[]>>('/user-roles', { params })
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * GET /api/v1/user-roles/:id
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
 *     "description": "Full system access and administrator controls."
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getRoleById(id: string): Promise<Role> {
  try {
    const res = await apiClient.get<Envelope<Role>>(`/user-roles/${id}`)
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * POST /api/v1/user-roles
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
 *     "requireReview": true,
 *     "reviewFrequency": "90 days",
 *     "accessExpiry": "No expiry"
 *   },
 *   "messages": ["Role created successfully"]
 * }
 * ```
 */
export async function createRole(payload: CreateRolePayload): Promise<Role> {
  try {
    const res = await apiClient.post<Envelope<Role>>('/user-roles', payload)
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * PUT /api/v1/user-roles/:id
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
 *     "status": "Active"
 *   },
 *   "messages": ["Role updated successfully"]
 * }
 * ```
 */
export async function updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
  try {
    const res = await apiClient.put<Envelope<Role>>(`/user-roles/${id}`, payload)
    return res.data.data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * DELETE /api/v1/user-roles/:id
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
    await apiClient.delete<Envelope<null>>(`/user-roles/${id}`)
  } catch (err) {
    handleApiError(err)
  }
}
